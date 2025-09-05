const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

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

// In-memory data storage (in a real app, this would be a database)
let users = [
    {
        _id: 'user-001',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedpassword123', // In real app, this would be bcrypt hashed
        points: 250,
        issues: [],
        role: 'citizen'
    },
    {
        _id: 'user-002',
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'hashedpassword456',
        points: 180,
        issues: [],
        role: 'citizen'
    }
];

let tickets = [
    {
        _id: 'TICK-001',
        creator_id: 'user-001',
        creator_name: 'John Doe',
        status: 'open',
        issue_name: 'Pothole near MMM',
        issue_category: 'Roads',
        issue_description: 'Large pothole causing traffic issues on Main Street',
        image_url: '/uploads/sample-pothole.jpg',
        tags: ['urgent', 'traffic'],
        votes: { upvotes: 15, downvotes: 2 },
        urgency: 'critical',
        location: {
            coordinates: { lat: 19.0760, lng: 72.8777 },
            address: 'Main Street, Sector 12'
        },
        opening_time: new Date('2024-01-15T10:30:00Z'),
        closing_time: null,
        authority: 'auth-001',
        sub_authority: null,
        assigned_technician: null
    },
    {
        _id: 'TICK-002',
        creator_id: 'user-002',
        creator_name: 'Jane Smith',
        status: 'in process',
        issue_name: 'Street light not working',
        issue_category: 'Electricity',
        issue_description: 'Multiple street lights not working in sector 7',
        image_url: '/uploads/sample-streetlight.jpg',
        tags: ['safety', 'lighting'],
        votes: { upvotes: 8, downvotes: 0 },
        urgency: 'moderate',
        location: {
            coordinates: { lat: 19.0820, lng: 72.8800 },
            address: 'Park Avenue, Block A'
        },
        opening_time: new Date('2024-01-14T14:20:00Z'),
        closing_time: null,
        authority: 'auth-001',
        sub_authority: 'sub-auth-001',
        assigned_technician: 'TECH-002'
    },
    {
        _id: 'TICK-003',
        creator_id: 'user-001',
        creator_name: 'John Doe',
        status: 'resolved',
        issue_name: 'Water leak',
        issue_category: 'Water',
        issue_description: 'Water pipe leakage causing waterlogging',
        image_url: '/uploads/sample-waterleak.jpg',
        tags: ['water', 'urgent'],
        votes: { upvotes: 12, downvotes: 1 },
        urgency: 'moderate',
        location: {
            coordinates: { lat: 19.0750, lng: 72.8790 },
            address: 'Green Lane, Colony 3'
        },
        opening_time: new Date('2024-01-13T09:15:00Z'),
        closing_time: new Date('2024-01-14T16:30:00Z'),
        authority: 'auth-001',
        sub_authority: 'sub-auth-002',
        assigned_technician: 'TECH-001'
    }
];

let technicians = [
    {
        _id: 'TECH-001',
        name: 'Raj Sharma',
        email: 'raj@civix.com',
        password: 'hashedpassword789',
        contact: '+91 98765-43210',
        specialization: 'Water Supply',
        dept: 'Water Department',
        openTickets: 3,
        avgResolutionTime: '1.5 days',
        status: 'active',
        totalResolved: 145,
        rating: 4.8,
        issues_assigned: ['TICK-003'],
        pulls_created: [],
        role: 'technician'
    },
    {
        _id: 'TECH-002',
        name: 'Priya Patel',
        email: 'priya@civix.com',
        password: 'hashedpassword101',
        contact: '+91 98765-43211',
        specialization: 'Electricity',
        dept: 'Electrical Department',
        openTickets: 5,
        avgResolutionTime: '2.1 days',
        status: 'active',
        totalResolved: 98,
        rating: 4.5,
        issues_assigned: ['TICK-002'],
        pulls_created: [],
        role: 'technician'
    },
    {
        _id: 'TECH-003',
        name: 'Kumar Singh',
        email: 'kumar@civix.com',
        password: 'hashedpassword202',
        contact: '+91 98765-43212',
        specialization: 'Roads',
        dept: 'Public Works',
        openTickets: 2,
        avgResolutionTime: '3.2 days',
        status: 'on_site',
        totalResolved: 76,
        rating: 4.2,
        issues_assigned: [],
        pulls_created: [],
        role: 'technician'
    }
];

let authorities = [
    {
        _id: 'auth-001',
        name: 'Mumbai Municipal Corporation',
        email: 'admin@mmc.gov.in',
        password: 'hashedpassword303',
        location: {
            coordinates: { lat: 19.0760, lng: 72.8777 },
            address: 'BMC Building, Mumbai'
        },
        issues: ['TICK-001', 'TICK-002', 'TICK-003'],
        role: 'authority'
    }
];

let resolveRequests = [];

// Helper functions
const findUserById = (id) => users.find(user => user._id === id);
const findTechnicianById = (id) => technicians.find(tech => tech._id === id);
const findTicketById = (id) => tickets.find(ticket => ticket._id === id);

// Authentication middleware (simplified - in real app use JWT)
const authenticateUser = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    
    const userId = authHeader.substring(7); // Remove 'Bearer ' prefix
    const user = findUserById(userId) || findTechnicianById(userId);
    
    if (!user) {
        return res.status(401).json({ error: 'Invalid user' });
    }
    
    req.user = user;
    next();
};

// API Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Authentication endpoints
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Check all user types
    const user = [...users, ...technicians, ...authorities].find(u => u.email === email);
    
    if (!user || user.password !== password) { // In real app, use bcrypt.compare
        return res.status(401).json({ error: 'Invalid credentials' });
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
});

app.post('/api/auth/register', (req, res) => {
    const { name, email, password, role = 'citizen' } = req.body;
    
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email and password are required' });
    }
    
    // Check if user already exists
    const existingUser = [...users, ...technicians, ...authorities].find(u => u.email === email);
    if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
    }
    
    const newUser = {
        _id: uuidv4(),
        name,
        email,
        password, // In real app, hash with bcrypt
        points: 0,
        issues: [],
        role
    };
    
    users.push(newUser);
    
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
});

// User endpoints
app.get('/api/users/profile', authenticateUser, (req, res) => {
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

app.put('/api/users/profile', authenticateUser, (req, res) => {
    const { name, contact } = req.body;
    const user = req.user;
    
    if (user.role === 'citizen') {
        const userIndex = users.findIndex(u => u._id === user._id);
        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], name: name || users[userIndex].name };
        }
    } else if (user.role === 'technician') {
        const techIndex = technicians.findIndex(t => t._id === user._id);
        if (techIndex !== -1) {
            technicians[techIndex] = {
                ...technicians[techIndex],
                name: name || technicians[techIndex].name,
                contact: contact || technicians[techIndex].contact
            };
        }
    }
    
    res.json({ message: 'Profile updated successfully' });
});

// Analytics endpoint
app.get('/api/analytics', authenticateUser, (req, res) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const activeTickets = tickets.filter(ticket => ticket.status === 'open' || ticket.status === 'in process').length;
    const resolvedToday = tickets.filter(ticket => 
        ticket.status === 'resolved' && 
        ticket.closing_time && 
        new Date(ticket.closing_time) >= today
    ).length;
    const inProgress = tickets.filter(ticket => ticket.status === 'in process').length;
    
    res.json({
        activeTickets,
        resolvedToday,
        inProgress,
        totalTickets: tickets.length,
        totalUsers: users.length,
        totalTechnicians: technicians.length
    });
});

// Ticket endpoints
app.get('/api/tickets', (req, res) => {
    const { status, category, urgency, page = 1, limit = 10, userId } = req.query;
    
    let filteredTickets = [...tickets];
    
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
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedTickets = filteredTickets.slice(startIndex, endIndex);
    
    res.json({
        tickets: paginatedTickets,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: filteredTickets.length,
            pages: Math.ceil(filteredTickets.length / limit)
        }
    });
});

app.get('/api/tickets/:id', (req, res) => {
    const ticket = findTicketById(req.params.id);
    if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json(ticket);
});

app.post('/api/tickets', authenticateUser, upload.single('image'), (req, res) => {
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
    
    const newTicket = {
        _id: `TICK-${String(tickets.length + 1).padStart(3, '0')}`,
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
    
    tickets.push(newTicket);
    
    // Add ticket to user's issues
    if (req.user.role === 'citizen') {
        const userIndex = users.findIndex(u => u._id === req.user._id);
        if (userIndex !== -1) {
            users[userIndex].issues.push(newTicket._id);
        }
    }
    
    res.status(201).json(newTicket);
});

app.put('/api/tickets/:id/vote', authenticateUser, (req, res) => {
    const { type } = req.body; // 'upvote' or 'downvote'
    const ticket = findTicketById(req.params.id);
    
    if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
    }
    
    if (type === 'upvote') {
        ticket.votes.upvotes += 1;
    } else if (type === 'downvote') {
        ticket.votes.downvotes += 1;
    } else {
        return res.status(400).json({ error: 'Invalid vote type' });
    }
    
    res.json(ticket);
});

app.put('/api/tickets/:id/assign', authenticateUser, (req, res) => {
    const { technicianId } = req.body;
    const ticket = findTicketById(req.params.id);
    const technician = findTechnicianById(technicianId);
    
    if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
    }
    
    if (!technician) {
        return res.status(404).json({ error: 'Technician not found' });
    }
    
    ticket.assigned_technician = technicianId;
    ticket.status = 'in process';
    
    // Add to technician's assigned issues
    if (!technician.issues_assigned.includes(ticket._id)) {
        technician.issues_assigned.push(ticket._id);
        technician.openTickets += 1;
    }
    
    res.json(ticket);
});

app.put('/api/tickets/:id/status', authenticateUser, (req, res) => {
    const { status } = req.body;
    const ticket = findTicketById(req.params.id);
    
    if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
    }
    
    const validStatuses = ['open', 'in process', 'resolved'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }
    
    const oldStatus = ticket.status;
    ticket.status = status;
    
    if (status === 'resolved' && oldStatus !== 'resolved') {
        ticket.closing_time = new Date();
        
        // Update technician stats
        if (ticket.assigned_technician) {
            const technician = findTechnicianById(ticket.assigned_technician);
            if (technician) {
                technician.openTickets = Math.max(0, technician.openTickets - 1);
                technician.totalResolved += 1;
            }
        }
    }
    
    res.json(ticket);
});

// Technician endpoints
app.get('/api/technicians', (req, res) => {
    const { specialization, status, department } = req.query;
    
    let filteredTechnicians = [...technicians];
    
    if (specialization) {
        filteredTechnicians = filteredTechnicians.filter(tech => 
            tech.specialization.toLowerCase().includes(specialization.toLowerCase())
        );
    }
    
    if (status) {
        filteredTechnicians = filteredTechnicians.filter(tech => tech.status === status);
    }
    
    if (department) {
        filteredTechnicians = filteredTechnicians.filter(tech => 
            tech.dept.toLowerCase().includes(department.toLowerCase())
        );
    }
    
    res.json(filteredTechnicians);
});

app.get('/api/technicians/:id', (req, res) => {
    const technician = findTechnicianById(req.params.id);
    if (!technician) {
        return res.status(404).json({ error: 'Technician not found' });
    }
    
    // Get assigned tickets
    const assignedTickets = tickets.filter(ticket => 
        technician.issues_assigned.includes(ticket._id)
    );
    
    res.json({
        ...technician,
        assignedTickets
    });
});

app.post('/api/technicians', authenticateUser, (req, res) => {
    const { name, email, contact, specialization, dept } = req.body;
    
    if (!name || !email || !contact || !specialization) {
        return res.status(400).json({ 
            error: 'Name, email, contact, and specialization are required' 
        });
    }
    
    const newTechnician = {
        _id: `TECH-${String(technicians.length + 1).padStart(3, '0')}`,
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
    };
    
    technicians.push(newTechnician);
    res.status(201).json(newTechnician);
});

// Technician task endpoints
app.get('/api/technicians/:id/tasks', authenticateUser, (req, res) => {
    const { status: taskStatus } = req.query;
    const technicianId = req.params.id;
    
    // Ensure technician can only access their own tasks or admin can access any
    if (req.user._id !== technicianId && req.user.role !== 'authority') {
        return res.status(403).json({ error: 'Access denied' });
    }
    
    let tasks = tickets.filter(ticket => ticket.assigned_technician === technicianId);
    
    if (taskStatus) {
        tasks = tasks.filter(task => task.status === taskStatus);
    }
    
    res.json(tasks);
});

// File upload endpoint
app.post('/api/upload', authenticateUser, upload.single('file'), (req, res) => {
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
