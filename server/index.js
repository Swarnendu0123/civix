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
