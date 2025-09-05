const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Database and Models
const connectDB = require('./config/database');
const { User, Ticket, ResolveRequest, Authority } = require('./models');

// Fallback in-memory storage for when MongoDB is not available
let fallbackStorage = {
    users: [],
    tickets: [],
    authorities: [],
    resolveRequests: []
};

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
let isConnectedToDB = false;
connectDB().then((conn) => {
    isConnectedToDB = !!conn;
    if (isConnectedToDB) {
        console.log('Using MongoDB for data storage');
    } else {
        console.log('Using in-memory storage for demonstration');
        initializeFallbackData();
    }
});

// Initialize fallback data when MongoDB is not available
function initializeFallbackData() {
    // Keep the fallback storage empty initially - data will be created via API
    console.log('Fallback storage initialized with empty data');
}

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files
app.use('/uploads', express.static('uploads'));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'));
        }
    }
});

// Authentication middleware
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        // In our simple implementation, token is the user ID
        const user = await findUserById(token);
        if (!user) {
            // Try authorities
            const authority = await findAuthorityById(token);
            if (!authority) {
                return res.status(403).json({ error: 'Invalid token' });
            }
            req.user = authority;
        } else {
            req.user = user;
        }
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid token' });
    }
};

// Helper functions
const findUserById = async (id) => {
    try {
        if (isConnectedToDB) {
            return await User.findById(id);
        } else {
            return fallbackStorage.users.find(user => user._id === id) || null;
        }
    } catch (error) {
        return null;
    }
};

const findTechnicianById = async (id) => {
    try {
        if (isConnectedToDB) {
            return await User.findOne({ _id: id, role: 'technician' });
        } else {
            return fallbackStorage.users.find(user => user._id === id && user.role === 'technician') || null;
        }
    } catch (error) {
        return null;
    }
};

const findTicketById = async (id) => {
    try {
        if (isConnectedToDB) {
            return await Ticket.findById(id);
        } else {
            return fallbackStorage.tickets.find(ticket => ticket._id === id) || null;
        }
    } catch (error) {
        return null;
    }
};

const findAuthorityById = async (id) => {
    try {
        if (isConnectedToDB) {
            return await Authority.findById(id);
        } else {
            return fallbackStorage.authorities.find(auth => auth._id === id) || null;
        }
    } catch (error) {
        return null;
    }
};


// API Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Authentication endpoints
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        let user = null;
        
        if (isConnectedToDB) {
            // MongoDB operations
            user = await User.findOne({ email });
            if (!user) {
                user = await Authority.findOne({ email });
            }
            
            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            
            // Compare password using the model method
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
        } else {
            // Fallback storage operations
            user = [...fallbackStorage.users, ...fallbackStorage.authorities].find(u => u.email === email);
            
            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            
            // Simple password comparison for fallback (in production, this would use bcrypt)
            if (password !== 'password') {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
        }
        
        // In real app, generate JWT token
        const token = user._id;
        
        res.json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                points: user.points || 0,
                specialization: user.specialization || null
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, role = 'citizen' } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email and password are required' });
        }
        
        if (isConnectedToDB) {
            // MongoDB operations
            const existingUser = await User.findOne({ email }) || await Authority.findOne({ email });
            if (existingUser) {
                return res.status(409).json({ error: 'User already exists' });
            }
            
            const newUser = new User({
                name,
                email,
                password, // Will be hashed by the pre-save middleware
                points: 0,
                issues: [],
                role
            });
            
            await newUser.save();
            
            res.status(201).json({
                token: newUser._id,
                user: {
                    _id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                    points: newUser.points
                }
            });
        } else {
            // Fallback storage operations
            const existingUser = [...fallbackStorage.users, ...fallbackStorage.authorities].find(u => u.email === email);
            if (existingUser) {
                return res.status(409).json({ error: 'User already exists' });
            }
            
            const newUser = {
                _id: require('uuid').v4(),
                name,
                email,
                password, // In production, this would be hashed
                points: 0,
                issues: [],
                role,
                is_technician: role === 'technician'
            };
            
            fallbackStorage.users.push(newUser);
            
            res.status(201).json({
                token: newUser._id,
                user: {
                    _id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                    points: newUser.points
                }
            });
        }
    } catch (error) {
        console.error('Registration error:', error);
        if (error.code === 11000) {
            return res.status(409).json({ error: 'User already exists' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

// User endpoints
app.get('/api/users/profile', authenticateToken, (req, res) => {
    const user = req.user;
    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        points: user.points || 0,
        specialization: user.specialization || null,
        contact: user.contact || null,
        totalResolved: user.totalResolved || 0,
        rating: user.rating || null
    });
});

app.put('/api/users/profile', authenticateToken, async (req, res) => {
    try {
        const { name, contact } = req.body;
        const userId = req.user._id;
        
        const updateData = {};
        if (name) updateData.name = name;
        if (contact) updateData.contact = contact;
        
        if (req.user.role === 'citizen' || req.user.role === 'technician') {
            await User.findByIdAndUpdate(userId, updateData);
        } else if (req.user.role === 'authority') {
            await Authority.findByIdAndUpdate(userId, updateData);
        }
        
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Analytics endpoint
app.get('/api/analytics', async (req, res) => {
    try {
        if (isConnectedToDB) {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            const activeTickets = await Ticket.countDocuments({ 
                status: { $in: ['open', 'in process'] } 
            });
            const resolvedToday = await Ticket.countDocuments({
                status: 'resolved',
                closing_time: { $gte: today }
            });
            const inProgress = await Ticket.countDocuments({ status: 'in process' });
            const totalTickets = await Ticket.countDocuments();
            const totalUsers = await User.countDocuments();
            const totalTechnicians = await User.countDocuments({ role: 'technician' });
            
            res.json({
                activeTickets,
                resolvedToday,
                inProgress,
                totalTickets,
                totalUsers,
                totalTechnicians
            });
        } else {
            // Fallback storage analytics
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            const activeTickets = fallbackStorage.tickets.filter(ticket => 
                ticket.status === 'open' || ticket.status === 'in process'
            ).length;
            
            const resolvedToday = fallbackStorage.tickets.filter(ticket => 
                ticket.status === 'resolved' && 
                ticket.closing_time && 
                new Date(ticket.closing_time) >= today
            ).length;
            
            const inProgress = fallbackStorage.tickets.filter(ticket => 
                ticket.status === 'in process'
            ).length;
            
            const totalTickets = fallbackStorage.tickets.length;
            const totalUsers = fallbackStorage.users.length;
            const totalTechnicians = fallbackStorage.users.filter(user => 
                user.role === 'technician'
            ).length;
            
            res.json({
                activeTickets,
                resolvedToday,
                inProgress,
                totalTickets,
                totalUsers,
                totalTechnicians
            });
        }
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Ticket endpoints
app.get('/api/tickets', async (req, res) => {
    try {
        const { status, category, urgency, page = 1, limit = 10, userId } = req.query;
        
        if (isConnectedToDB) {
            // MongoDB operations
            const filter = {};
            
            if (status) {
                filter.status = status;
            }
            
            if (category) {
                filter.issue_category = { $regex: category, $options: 'i' };
            }
            
            if (urgency) {
                filter.urgency = urgency;
            }
            
            if (userId) {
                filter.creator_id = userId;
            }
            
            // Get total count for pagination
            const total = await Ticket.countDocuments(filter);
            
            // Get paginated results, sorted by creation time (newest first)
            const tickets = await Ticket.find(filter)
                .sort({ opening_time: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit));
            
            res.json({
                tickets,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } else {
            // Fallback storage operations
            let filteredTickets = [...fallbackStorage.tickets];
            
            if (status) {
                filteredTickets = filteredTickets.filter(ticket => ticket.status === status);
            }
            
            if (category) {
                filteredTickets = filteredTickets.filter(ticket => 
                    ticket.issue_category.toLowerCase().includes(category.toLowerCase())
                );
            }
            
            if (urgency) {
                filteredTickets = filteredTickets.filter(ticket => ticket.urgency === urgency);
            }
            
            if (userId) {
                filteredTickets = filteredTickets.filter(ticket => ticket.creator_id === userId);
            }
            
            // Sort by creation time (newest first)
            filteredTickets.sort((a, b) => new Date(b.opening_time) - new Date(a.opening_time));
            
            // Pagination
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const startIndex = (pageNum - 1) * limitNum;
            const endIndex = startIndex + limitNum;
            const paginatedTickets = filteredTickets.slice(startIndex, endIndex);
            
            res.json({
                tickets: paginatedTickets,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total: filteredTickets.length,
                    pages: Math.ceil(filteredTickets.length / limitNum)
                }
            });
        }
    } catch (error) {
        console.error('Get tickets error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/tickets/:id', async (req, res) => {
    try {
        const ticket = await findTicketById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        res.json(ticket);
    } catch (error) {
        console.error('Get ticket error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/tickets', upload.single('image'), authenticateToken, async (req, res) => {
    try {
        const {
            issue_name,
            issue_category,
            issue_description,
            urgency = 'moderate',
            location_address,
            location_lat,
            location_lng,
            tags
        } = req.body;
        
        if (!issue_name || !issue_category || !issue_description || !location_address) {
            return res.status(400).json({ 
                error: 'Issue name, category, description, and location are required' 
            });
        }
        
        if (isConnectedToDB) {
            // MongoDB operations
            // Find a default authority - in a real app, this would be based on location
            let authority = await Authority.findOne();
            if (!authority) {
                // Create a default authority if none exists
                authority = new Authority({
                    name: 'Default Municipal Authority',
                    email: 'admin@authority.gov',
                    password: 'defaultpassword',
                    location: {
                        coordinates: { lat: 0, lng: 0 },
                        address: 'Default Location'
                    }
                });
                await authority.save();
            }
            
            const newTicket = new Ticket({
                creator_id: req.user._id,
                creator_name: req.user.name,
                status: 'open',
                issue_name,
                issue_category,
                issue_description,
                image_url: req.file ? `/uploads/${req.file.filename}` : null,
                tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
                votes: { upvotes: 0, downvotes: 0 },
                urgency,
                location: {
                    coordinates: { 
                        lat: parseFloat(location_lat) || 0, 
                        lng: parseFloat(location_lng) || 0 
                    },
                    address: location_address
                },
                authority: authority._id,
                sub_authority: null,
                assigned_technician: null
            });
            
            await newTicket.save();
            
            // Add ticket to user's issues
            if (req.user.role === 'citizen' || req.user.role === 'technician') {
                await User.findByIdAndUpdate(req.user._id, {
                    $push: { issues: newTicket._id }
                });
            }
            
            // Add ticket to authority's issues
            await Authority.findByIdAndUpdate(authority._id, {
                $push: { issues: newTicket._id }
            });
            
            res.status(201).json(newTicket);
        } else {
            // Fallback storage operations
            const ticketId = `TICK-${Date.now()}`;
            const newTicket = {
                _id: ticketId,
                creator_id: req.user._id,
                creator_name: req.user.name,
                status: 'open',
                issue_name,
                issue_category,
                issue_description,
                image_url: req.file ? `/uploads/${req.file.filename}` : null,
                tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
                votes: { upvotes: 0, downvotes: 0 },
                urgency,
                location: {
                    coordinates: { 
                        lat: parseFloat(location_lat) || 0, 
                        lng: parseFloat(location_lng) || 0 
                    },
                    address: location_address
                },
                opening_time: new Date(),
                closing_time: null,
                authority: 'auth-001',
                sub_authority: null,
                assigned_technician: null
            };
            
            // Add to fallback storage
            fallbackStorage.tickets.push(newTicket);
            
            // Add ticket to user's issues (if user exists in fallback storage)
            const user = fallbackStorage.users.find(u => u._id === req.user._id);
            if (user) {
                user.issues.push(ticketId);
            }
            
            res.status(201).json(newTicket);
        }
    } catch (error) {
        console.error('Create ticket error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/tickets/:id/vote', async (req, res) => {
    try {
        const { type } = req.body; // 'upvote' or 'downvote'
        const ticket = await findTicketById(req.params.id);
        
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        
        const update = {};
        if (type === 'upvote') {
            update['votes.upvotes'] = ticket.votes.upvotes + 1;
        } else if (type === 'downvote') {
            update['votes.downvotes'] = ticket.votes.downvotes + 1;
        } else {
            return res.status(400).json({ error: 'Invalid vote type' });
        }
        
        const updatedTicket = await Ticket.findByIdAndUpdate(
            req.params.id, 
            { $inc: update }, 
            { new: true }
        );
        
        res.json(updatedTicket);
    } catch (error) {
        console.error('Vote ticket error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/tickets/:id/assign', async (req, res) => {
    try {
        const { technicianId } = req.body;
        const ticket = await findTicketById(req.params.id);
        const technician = await findTechnicianById(technicianId);
        
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        
        if (!technician) {
            return res.status(404).json({ error: 'Technician not found' });
        }
        
        // Update ticket
        const updatedTicket = await Ticket.findByIdAndUpdate(
            req.params.id,
            {
                assigned_technician: technicianId,
                status: 'in process'
            },
            { new: true }
        );
        
        // Add to technician's assigned issues
        await User.findByIdAndUpdate(technicianId, {
            $addToSet: { issues_assigned: ticket._id },
            $inc: { openTickets: 1 }
        });
        
        res.json(updatedTicket);
    } catch (error) {
        console.error('Assign ticket error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/tickets/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const ticket = await findTicketById(req.params.id);
        
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        
        const validStatuses = ['open', 'in process', 'resolved'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        
        const oldStatus = ticket.status;
        const updateData = { status };
        
        if (status === 'resolved' && oldStatus !== 'resolved') {
            updateData.closing_time = new Date();
            
            // Update technician stats
            if (ticket.assigned_technician) {
                await User.findByIdAndUpdate(ticket.assigned_technician, {
                    $inc: { openTickets: -1, totalResolved: 1 }
                });
            }
        }
        
        const updatedTicket = await Ticket.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        
        res.json(updatedTicket);
    } catch (error) {
        console.error('Update ticket status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Technician endpoints
app.get('/api/technicians', async (req, res) => {
    try {
        const { specialization, status, department } = req.query;
        
        let technicians = [];
        
        if (isConnectedToDB) {
            const filter = { role: 'technician' };
            
            if (specialization) {
                filter.specialization = { $regex: specialization, $options: 'i' };
            }
            
            if (status) {
                filter.status = status;
            }
            
            if (department) {
                filter.dept = { $regex: department, $options: 'i' };
            }
            
            technicians = await User.find(filter);
        } else {
            // Fallback storage operations
            technicians = fallbackStorage.users.filter(user => user.role === 'technician');
            
            if (specialization) {
                technicians = technicians.filter(tech => 
                    tech.specialization && tech.specialization.toLowerCase().includes(specialization.toLowerCase())
                );
            }
            
            if (status) {
                technicians = technicians.filter(tech => tech.status === status);
            }
            
            if (department) {
                technicians = technicians.filter(tech => 
                    tech.dept && tech.dept.toLowerCase().includes(department.toLowerCase())
                );
            }
        }
        
        res.json(technicians);
    } catch (error) {
        console.error('Get technicians error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/technicians/:id', async (req, res) => {
    try {
        const technician = await findTechnicianById(req.params.id);
        if (!technician) {
            return res.status(404).json({ error: 'Technician not found' });
        }
        
        // Get assigned tickets
        const assignedTickets = await Ticket.find({
            _id: { $in: technician.issues_assigned }
        });
        
        res.json({
            ...technician.toObject(),
            assignedTickets
        });
    } catch (error) {
        console.error('Get technician error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/technicians', authenticateToken, async (req, res) => {
    try {
        const { name, email, contact, specialization, dept } = req.body;
        
        if (!name || !email || !contact || !specialization) {
            return res.status(400).json({ 
                error: 'Name, email, contact, and specialization are required' 
            });
        }
        
        if (isConnectedToDB) {
            // Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(409).json({ error: 'User with this email already exists' });
            }
            
            const newTechnician = new User({
                name,
                email,
                password: 'defaultpassword123', // In real app, generate secure password
                contact,
                specialization,
                dept: dept || 'General',
                openTickets: 0,
                avgResolutionTime: '0 days',
                status: 'active',
                totalResolved: 0,
                rating: 0,
                issues_assigned: [],
                pulls_created: [],
                role: 'technician'
            });
            
            await newTechnician.save();
            res.status(201).json(newTechnician);
        } else {
            // Fallback storage operations
            const existingUser = fallbackStorage.users.find(u => u.email === email);
            if (existingUser) {
                return res.status(409).json({ error: 'User with this email already exists' });
            }
            
            const newTechnician = {
                _id: require('uuid').v4(),
                name,
                email,
                password: 'defaultpassword123',
                contact,
                specialization,
                dept: dept || 'General',
                openTickets: 0,
                avgResolutionTime: '0 days',
                status: 'active',
                totalResolved: 0,
                rating: 0,
                issues_assigned: [],
                pulls_created: [],
                role: 'technician'
            };
            
            fallbackStorage.users.push(newTechnician);
            res.status(201).json(newTechnician);
        }
    } catch (error) {
        console.error('Create technician error:', error);
        if (error.code === 11000) {
            return res.status(409).json({ error: 'User with this email already exists' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/technicians/:id', authenticateToken, async (req, res) => {
    try {
        const { name, contact, specialization, dept, status } = req.body;
        const technicianId = req.params.id;
        
        // Only allow authority to update technicians
        if (req.user.role !== 'authority') {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        const updateData = {};
        if (name) updateData.name = name;
        if (contact) updateData.contact = contact;
        if (specialization) updateData.specialization = specialization;
        if (dept) updateData.dept = dept;
        if (status) updateData.status = status;
        
        if (isConnectedToDB) {
            const updatedTechnician = await User.findByIdAndUpdate(
                technicianId,
                updateData,
                { new: true }
            );
            
            if (!updatedTechnician) {
                return res.status(404).json({ error: 'Technician not found' });
            }
            
            res.json(updatedTechnician);
        } else {
            const technicianIndex = fallbackStorage.users.findIndex(
                user => user._id === technicianId && user.role === 'technician'
            );
            
            if (technicianIndex === -1) {
                return res.status(404).json({ error: 'Technician not found' });
            }
            
            Object.assign(fallbackStorage.users[technicianIndex], updateData);
            res.json(fallbackStorage.users[technicianIndex]);
        }
    } catch (error) {
        console.error('Update technician error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/technicians/:id', authenticateToken, async (req, res) => {
    try {
        const technicianId = req.params.id;
        
        // Only allow authority to delete technicians
        if (req.user.role !== 'authority') {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        if (isConnectedToDB) {
            const deletedTechnician = await User.findByIdAndDelete(technicianId);
            
            if (!deletedTechnician) {
                return res.status(404).json({ error: 'Technician not found' });
            }
            
            res.json({ message: 'Technician deleted successfully' });
        } else {
            const technicianIndex = fallbackStorage.users.findIndex(
                user => user._id === technicianId && user.role === 'technician'
            );
            
            if (technicianIndex === -1) {
                return res.status(404).json({ error: 'Technician not found' });
            }
            
            fallbackStorage.users.splice(technicianIndex, 1);
            res.json({ message: 'Technician deleted successfully' });
        }
    } catch (error) {
        console.error('Delete technician error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Technician task endpoints
app.get('/api/technicians/:id/tasks', async (req, res) => {
    try {
        const { status: taskStatus } = req.query;
        const technicianId = req.params.id;
        
        // Ensure technician can only access their own tasks or admin can access any
        if (req.user._id !== technicianId && req.user.role !== 'authority') {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        const filter = { assigned_technician: technicianId };
        
        if (taskStatus) {
            filter.status = taskStatus;
        }
        
        const tasks = await Ticket.find(filter).sort({ opening_time: -1 });
        res.json(tasks);
    } catch (error) {
        console.error('Get technician tasks error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ============= ADMIN APIs =============

// User Management APIs (Admin only)
app.get('/api/admin/users', authenticateToken, async (req, res) => {
    try {
        // Only allow authority to access user management
        if (req.user.role !== 'authority') {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        const { page = 1, limit = 20, role, status, search } = req.query;
        
        if (isConnectedToDB) {
            const filter = {};
            
            if (role && role !== 'all') {
                filter.role = role;
            }
            
            if (status && status !== 'all') {
                filter.status = status;
            }
            
            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ];
            }
            
            const total = await User.countDocuments(filter);
            const users = await User.find(filter)
                .select('-password') // Exclude password from response
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit));
            
            res.json({
                users,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } else {
            let filteredUsers = [...fallbackStorage.users];
            
            if (role && role !== 'all') {
                filteredUsers = filteredUsers.filter(user => user.role === role);
            }
            
            if (status && status !== 'all') {
                filteredUsers = filteredUsers.filter(user => user.status === status);
            }
            
            if (search) {
                filteredUsers = filteredUsers.filter(user => 
                    user.name.toLowerCase().includes(search.toLowerCase()) ||
                    user.email.toLowerCase().includes(search.toLowerCase())
                );
            }
            
            // Remove password from response
            const sanitizedUsers = filteredUsers.map(({ password, ...user }) => user);
            
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const startIndex = (pageNum - 1) * limitNum;
            const endIndex = startIndex + limitNum;
            const paginatedUsers = sanitizedUsers.slice(startIndex, endIndex);
            
            res.json({
                users: paginatedUsers,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total: sanitizedUsers.length,
                    pages: Math.ceil(sanitizedUsers.length / limitNum)
                }
            });
        }
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/admin/users/:id/status', authenticateToken, async (req, res) => {
    try {
        // Only allow authority to manage user status
        if (req.user.role !== 'authority') {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        const { status } = req.body;
        const userId = req.params.id;
        
        const validStatuses = ['active', 'inactive', 'suspended'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        
        if (isConnectedToDB) {
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { status },
                { new: true }
            ).select('-password');
            
            if (!updatedUser) {
                return res.status(404).json({ error: 'User not found' });
            }
            
            res.json(updatedUser);
        } else {
            const userIndex = fallbackStorage.users.findIndex(user => user._id === userId);
            
            if (userIndex === -1) {
                return res.status(404).json({ error: 'User not found' });
            }
            
            fallbackStorage.users[userIndex].status = status;
            const { password, ...sanitizedUser } = fallbackStorage.users[userIndex];
            res.json(sanitizedUser);
        }
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/admin/users/:id', authenticateToken, async (req, res) => {
    try {
        // Only allow authority to delete users
        if (req.user.role !== 'authority') {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        const userId = req.params.id;
        
        if (isConnectedToDB) {
            const deletedUser = await User.findByIdAndDelete(userId);
            
            if (!deletedUser) {
                return res.status(404).json({ error: 'User not found' });
            }
            
            res.json({ message: 'User deleted successfully' });
        } else {
            const userIndex = fallbackStorage.users.findIndex(user => user._id === userId);
            
            if (userIndex === -1) {
                return res.status(404).json({ error: 'User not found' });
            }
            
            fallbackStorage.users.splice(userIndex, 1);
            res.json({ message: 'User deleted successfully' });
        }
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Notifications Management APIs
app.get('/api/admin/notifications', authenticateToken, async (req, res) => {
    try {
        // Only allow authority to access notifications
        if (req.user.role !== 'authority') {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        const { page = 1, limit = 20, read } = req.query;
        
        // For now, generate sample notifications based on recent system activity
        if (isConnectedToDB) {
            const recentTickets = await Ticket.find()
                .sort({ opening_time: -1 })
                .limit(10);
            
            const recentUsers = await User.find()
                .sort({ createdAt: -1 })
                .limit(5);
            
            const notifications = [
                ...recentTickets.map(ticket => ({
                    _id: `notif-ticket-${ticket._id}`,
                    type: 'ticket',
                    title: `New ${ticket.urgency} issue reported`,
                    message: `${ticket.issue_name} in ${ticket.location.address}`,
                    data: { ticketId: ticket._id },
                    read: false,
                    createdAt: ticket.opening_time
                })),
                ...recentUsers.map(user => ({
                    _id: `notif-user-${user._id}`,
                    type: 'user',
                    title: 'New user registered',
                    message: `${user.name} (${user.email}) joined as ${user.role}`,
                    data: { userId: user._id },
                    read: false,
                    createdAt: user.createdAt || new Date()
                }))
            ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            res.json({
                notifications,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: notifications.length,
                    pages: Math.ceil(notifications.length / limit)
                }
            });
        } else {
            // Fallback storage notifications
            const notifications = [
                {
                    _id: 'notif-1',
                    type: 'system',
                    title: 'System Status',
                    message: 'Using in-memory storage. Connect MongoDB for persistent data.',
                    data: {},
                    read: false,
                    createdAt: new Date()
                },
                ...fallbackStorage.tickets.slice(0, 5).map(ticket => ({
                    _id: `notif-ticket-${ticket._id}`,
                    type: 'ticket',
                    title: `New ${ticket.urgency || 'moderate'} issue reported`,
                    message: `${ticket.issue_name} in ${ticket.location.address}`,
                    data: { ticketId: ticket._id },
                    read: false,
                    createdAt: ticket.opening_time
                }))
            ];
            
            res.json({
                notifications,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: notifications.length,
                    pages: Math.ceil(notifications.length / limit)
                }
            });
        }
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/admin/notifications/:id/read', authenticateToken, async (req, res) => {
    try {
        // Only allow authority to mark notifications as read
        if (req.user.role !== 'authority') {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        const notificationId = req.params.id;
        
        // In a real implementation, this would update a notifications collection
        // For now, just return success
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Mark notification read error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Category Management APIs
app.get('/api/admin/categories', authenticateToken, async (req, res) => {
    try {
        // Only allow authority to manage categories
        if (req.user.role !== 'authority') {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        // Default categories for municipal issues
        const categories = [
            {
                _id: 'cat-1',
                name: 'Water',
                description: 'Water supply, drainage, and plumbing issues',
                color: '#3B82F6',
                active: true,
                createdAt: new Date('2024-01-01')
            },
            {
                _id: 'cat-2',
                name: 'Electricity',
                description: 'Power outages, street lighting, and electrical infrastructure',
                color: '#EAB308',
                active: true,
                createdAt: new Date('2024-01-01')
            },
            {
                _id: 'cat-3',
                name: 'Roads',
                description: 'Road maintenance, potholes, and traffic infrastructure',
                color: '#6B7280',
                active: true,
                createdAt: new Date('2024-01-01')
            },
            {
                _id: 'cat-4',
                name: 'Sanitation',
                description: 'Waste management, cleaning, and public hygiene',
                color: '#10B981',
                active: true,
                createdAt: new Date('2024-01-01')
            },
            {
                _id: 'cat-5',
                name: 'Public Safety',
                description: 'Security, emergency services, and public safety',
                color: '#EF4444',
                active: true,
                createdAt: new Date('2024-01-01')
            },
            {
                _id: 'cat-6',
                name: 'Parks & Recreation',
                description: 'Public parks, gardens, and recreational facilities',
                color: '#22C55E',
                active: true,
                createdAt: new Date('2024-01-01')
            }
        ];
        
        res.json({ categories });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/admin/categories', authenticateToken, async (req, res) => {
    try {
        // Only allow authority to create categories
        if (req.user.role !== 'authority') {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        const { name, description, color = '#6B7280' } = req.body;
        
        if (!name || !description) {
            return res.status(400).json({ error: 'Name and description are required' });
        }
        
        const newCategory = {
            _id: `cat-${Date.now()}`,
            name,
            description,
            color,
            active: true,
            createdAt: new Date()
        };
        
        res.status(201).json(newCategory);
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Advanced Analytics APIs
app.get('/api/admin/analytics/reports', authenticateToken, async (req, res) => {
    try {
        // Only allow authority to access advanced analytics
        if (req.user.role !== 'authority') {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        const { timeframe = '30d', type = 'summary' } = req.query;
        
        if (isConnectedToDB) {
            const now = new Date();
            let startDate;
            
            switch (timeframe) {
                case '7d':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case '30d':
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                case '90d':
                    startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            }
            
            const tickets = await Ticket.find({
                opening_time: { $gte: startDate }
            });
            
            const users = await User.countDocuments({
                createdAt: { $gte: startDate }
            });
            
            // Calculate metrics
            const totalTickets = tickets.length;
            const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
            const avgResolutionTime = resolvedTickets > 0 ? 
                tickets
                    .filter(t => t.status === 'resolved' && t.closing_time)
                    .reduce((sum, t) => {
                        const resolutionTime = new Date(t.closing_time) - new Date(t.opening_time);
                        return sum + (resolutionTime / (1000 * 60 * 60 * 24)); // Convert to days
                    }, 0) / resolvedTickets : 0;
            
            // Category breakdown
            const categoryBreakdown = tickets.reduce((acc, ticket) => {
                acc[ticket.issue_category] = (acc[ticket.issue_category] || 0) + 1;
                return acc;
            }, {});
            
            // Urgency breakdown
            const urgencyBreakdown = tickets.reduce((acc, ticket) => {
                acc[ticket.urgency] = (acc[ticket.urgency] || 0) + 1;
                return acc;
            }, {});
            
            res.json({
                timeframe,
                period: {
                    start: startDate,
                    end: now
                },
                summary: {
                    totalTickets,
                    resolvedTickets,
                    resolutionRate: totalTickets > 0 ? (resolvedTickets / totalTickets) * 100 : 0,
                    avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
                    newUsers: users
                },
                breakdown: {
                    byCategory: categoryBreakdown,
                    byUrgency: urgencyBreakdown
                }
            });
        } else {
            // Fallback storage analytics
            res.json({
                timeframe,
                period: {
                    start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
                    end: now
                },
                summary: {
                    totalTickets: fallbackStorage.tickets.length,
                    resolvedTickets: fallbackStorage.tickets.filter(t => t.status === 'resolved').length,
                    resolutionRate: fallbackStorage.tickets.length > 0 ? 
                        (fallbackStorage.tickets.filter(t => t.status === 'resolved').length / fallbackStorage.tickets.length) * 100 : 0,
                    avgResolutionTime: 2.5,
                    newUsers: fallbackStorage.users.length
                },
                breakdown: {
                    byCategory: fallbackStorage.tickets.reduce((acc, ticket) => {
                        acc[ticket.issue_category] = (acc[ticket.issue_category] || 0) + 1;
                        return acc;
                    }, {}),
                    byUrgency: fallbackStorage.tickets.reduce((acc, ticket) => {
                        acc[ticket.urgency || 'moderate'] = (acc[ticket.urgency || 'moderate'] || 0) + 1;
                        return acc;
                    }, {})
                }
            });
        }
    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/admin/analytics/performance', authenticateToken, async (req, res) => {
    try {
        // Only allow authority to access performance analytics
        if (req.user.role !== 'authority') {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        if (isConnectedToDB) {
            const technicians = await User.find({ role: 'technician' });
            
            const performance = await Promise.all(technicians.map(async (tech) => {
                const assignedTickets = await Ticket.find({ assigned_technician: tech._id });
                const resolvedTickets = assignedTickets.filter(t => t.status === 'resolved');
                
                const avgResolutionTime = resolvedTickets.length > 0 ?
                    resolvedTickets.reduce((sum, t) => {
                        if (t.closing_time) {
                            const resolutionTime = new Date(t.closing_time) - new Date(t.opening_time);
                            return sum + (resolutionTime / (1000 * 60 * 60 * 24));
                        }
                        return sum;
                    }, 0) / resolvedTickets.length : 0;
                
                return {
                    technicianId: tech._id,
                    name: tech.name,
                    specialization: tech.specialization,
                    totalAssigned: assignedTickets.length,
                    totalResolved: resolvedTickets.length,
                    resolutionRate: assignedTickets.length > 0 ? 
                        (resolvedTickets.length / assignedTickets.length) * 100 : 0,
                    avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
                    openTickets: tech.openTickets || 0,
                    rating: tech.rating || 0
                };
            }));
            
            res.json({ performance });
        } else {
            const technicians = fallbackStorage.users.filter(user => user.role === 'technician');
            
            const performance = technicians.map(tech => ({
                technicianId: tech._id,
                name: tech.name,
                specialization: tech.specialization || 'General',
                totalAssigned: tech.totalResolved || 0,
                totalResolved: tech.totalResolved || 0,
                resolutionRate: 95,
                avgResolutionTime: Math.random() * 3 + 1, // Random 1-4 days
                openTickets: tech.openTickets || 0,
                rating: tech.rating || (Math.random() * 2 + 3) // Random 3-5 rating
            }));
            
            res.json({ performance });
        }
    } catch (error) {
        console.error('Get performance analytics error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// System Settings APIs
app.get('/api/admin/settings', authenticateToken, async (req, res) => {
    try {
        // Only allow authority to access settings
        if (req.user.role !== 'authority') {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        const settings = {
            system: {
                appName: 'Civix Admin',
                version: '1.0.0',
                maintenanceMode: false,
                maxFileSize: '10MB',
                allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif']
            },
            notifications: {
                emailEnabled: true,
                smsEnabled: false,
                pushNotificationsEnabled: true,
                adminNotifications: true
            },
            tickets: {
                autoAssignment: false,
                urgencyLevels: ['low', 'moderate', 'high', 'critical'],
                defaultUrgency: 'moderate',
                maxTicketsPerTechnician: 10
            },
            users: {
                autoApproval: true,
                requireEmailVerification: false,
                defaultRole: 'citizen',
                maxUsersPerRole: {
                    citizen: -1,
                    technician: 50,
                    authority: 5
                }
            }
        };
        
        res.json(settings);
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/admin/settings', authenticateToken, async (req, res) => {
    try {
        // Only allow authority to update settings
        if (req.user.role !== 'authority') {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        const { system, notifications, tickets, users } = req.body;
        
        // In a real implementation, this would save to database
        // For now, just return the updated settings
        const updatedSettings = {
            system: system || {},
            notifications: notifications || {},
            tickets: tickets || {},
            users: users || {},
            updatedAt: new Date()
        };
        
        res.json(updatedSettings);
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// File upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    
    res.json({
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: `/uploads/${req.file.filename}`
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File size too large' });
        }
    }
    
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Civix API Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
