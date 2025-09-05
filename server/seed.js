const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('./config/database');
const { User, Ticket, Authority } = require('./models');

const seedData = async () => {
    try {
        // Connect to database
        await connectDB();
        
        // Clear existing data
        await User.deleteMany({});
        await Ticket.deleteMany({});
        await Authority.deleteMany({});
        
        console.log('Cleared existing data');
        
        // Create sample users
        const users = [
            {
                _id: 'user-001',
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
                points: 250,
                role: 'citizen'
            },
            {
                _id: 'user-002',
                name: 'Jane Smith',
                email: 'jane@example.com',
                password: 'password123',
                points: 180,
                role: 'citizen'
            }
        ];
        
        const createdUsers = await User.insertMany(users);
        console.log('Created users:', createdUsers.length);
        
        // Create sample technicians
        const technicians = [
            {
                _id: 'TECH-001',
                name: 'Raj Sharma',
                email: 'raj@civix.com',
                password: 'password123',
                contact: '+91 98765-43210',
                specialization: 'Water Supply',
                dept: 'Water Department',
                openTickets: 0,
                avgResolutionTime: '1.5 days',
                status: 'active',
                totalResolved: 145,
                rating: 4.8,
                role: 'technician'
            },
            {
                _id: 'TECH-002',
                name: 'Priya Patel',
                email: 'priya@civix.com',
                password: 'password123',
                contact: '+91 98765-43211',
                specialization: 'Electricity',
                dept: 'Electrical Department',
                openTickets: 0,
                avgResolutionTime: '2.1 days',
                status: 'active',
                totalResolved: 98,
                rating: 4.5,
                role: 'technician'
            }
        ];
        
        const createdTechnicians = await User.insertMany(technicians);
        console.log('Created technicians:', createdTechnicians.length);
        
        // Create sample authority
        const authority = new Authority({
            _id: 'auth-001',
            name: 'Mumbai Municipal Corporation',
            email: 'admin@mmc.gov.in',
            password: 'password123',
            location: {
                coordinates: { lat: 19.0760, lng: 72.8777 },
                address: 'BMC Building, Mumbai'
            }
        });
        
        await authority.save();
        console.log('Created authority');
        
        // Create sample tickets
        const tickets = [
            {
                _id: 'TICK-001',
                creator_id: 'user-001',
                creator_name: 'John Doe',
                status: 'open',
                issue_name: 'Pothole near MMM',
                issue_category: 'Roads',
                issue_description: 'Large pothole causing traffic issues on Main Street',
                tags: ['urgent', 'traffic'],
                votes: { upvotes: 15, downvotes: 2 },
                urgency: 'critical',
                location: {
                    coordinates: { lat: 19.0760, lng: 72.8777 },
                    address: 'Main Street, Sector 12'
                },
                opening_time: new Date('2024-01-15T10:30:00Z'),
                authority: 'auth-001'
            },
            {
                _id: 'TICK-002',
                creator_id: 'user-002',
                creator_name: 'Jane Smith',
                status: 'in process',
                issue_name: 'Street light not working',
                issue_category: 'Electricity',
                issue_description: 'Multiple street lights not working in sector 7',
                tags: ['safety', 'lighting'],
                votes: { upvotes: 8, downvotes: 0 },
                urgency: 'moderate',
                location: {
                    coordinates: { lat: 19.0820, lng: 72.8800 },
                    address: 'Park Avenue, Block A'
                },
                opening_time: new Date('2024-01-14T14:20:00Z'),
                authority: 'auth-001',
                assigned_technician: 'TECH-002'
            }
        ];
        
        const createdTickets = await Ticket.insertMany(tickets);
        console.log('Created tickets:', createdTickets.length);
        
        // Update associations
        await User.findByIdAndUpdate('user-001', {
            $push: { issues: 'TICK-001' }
        });
        
        await User.findByIdAndUpdate('user-002', {
            $push: { issues: 'TICK-002' }
        });
        
        await User.findByIdAndUpdate('TECH-002', {
            $push: { issues_assigned: 'TICK-002' },
            $inc: { openTickets: 1 }
        });
        
        await Authority.findByIdAndUpdate('auth-001', {
            $push: { issues: { $each: ['TICK-001', 'TICK-002'] } }
        });
        
        console.log('Database seeded successfully!');
        process.exit(0);
        
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedData();