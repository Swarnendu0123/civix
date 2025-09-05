const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Database and Models
const connectDB = require('./config/database');
const { User, Ticket, ResolveRequest, Authority } = require('./models');

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

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

// Helper functions
const findUserById = async (id) => {
    try {
        return await User.findById(id);
    } catch (error) {
        return null;
    }
};

const findTechnicianById = async (id) => {
    try {
        return await User.findOne({ _id: id, role: 'technician' });
    } catch (error) {
        return null;
    }
};

const findTicketById = async (id) => {
    try {
        return await Ticket.findById(id);
    } catch (error) {
        return null;
    }
};

const findAuthorityById = async (id) => {
    try {
        return await Authority.findById(id);
    } catch (error) {
        return null;
    }
};

// Authentication middleware (simplified - in real app use JWT)
const authenticateUser = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    
    const userId = authHeader.substring(7); // Remove 'Bearer ' prefix
    const user = await findUserById(userId) || await findAuthorityById(userId);
    
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
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        // Check all user types (User and Authority)
        let user = await User.findOne({ email });
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
        
        // Check if user already exists
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
    } catch (error) {
        console.error('Registration error:', error);
        if (error.code === 11000) {
            return res.status(409).json({ error: 'User already exists' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
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

app.put('/api/users/profile', authenticateUser, async (req, res) => {
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
app.get('/api/analytics', authenticateUser, async (req, res) => {
    try {
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
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
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
