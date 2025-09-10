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

// Services
const { processIssueType } = require('./services/intentRecognition');
const { getTechnicianSuggestions } = require('./services/technicianFiltering');

// Fallback in-memory storage for when MongoDB is not available
let fallbackStorage = {
    users: [],
    tickets: [],
    authorities: [],
    resolveRequests: []
};

const app = express();
const PORT = process.env.PORT || 8000;

// Check if running in serverless environment (Vercel)
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

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

// Configure multer for file uploads
let upload;

if (isServerless) {
    // For serverless environments, use memory storage
    upload = multer({ 
        storage: multer.memoryStorage(),
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
} else {
    // For local development, use disk storage
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Serve static files (only in local environment)
    app.use('/uploads', express.static('uploads'));

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/');
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
        }
    });

    upload = multer({ 
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
}

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
        const { name, email, password, role = 'citizen', firebaseUid } = req.body;
        
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
                _id: firebaseUid || require('uuid').v4(), // Use Firebase UID if provided
                name,
                email,
                password: password === 'firebase-managed' ? 'firebase-managed' : password, // Handle Firebase managed passwords
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
                _id: firebaseUid || require('uuid').v4(),
                name,
                email,
                password: password === 'firebase-managed' ? 'firebase-managed' : password,
                points: 0,
                issues: [],
                role,
                is_technician: role === 'technician',
                createdAt: new Date()
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
        
        // Process issue type using intent recognition
        const classificationResult = await processIssueType(
            issue_category, 
            issue_description, 
            issue_name,
            // We'll pass ticket data after it's created
        );
        
        const processedIssueType = classificationResult.finalType;
        
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
                issue_category: processedIssueType, // Use processed issue type
                issue_description,
                image_url: req.file ? (isServerless ? 
                    `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` : 
                    `/uploads/${req.file.filename}`) : null,
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
            
            // Get technician suggestions for the newly created ticket
            let technicianSuggestions = null;
            let autoAssignmentResult = null;
            
            try {
                // If classification requires manual review, create notification
                if (classificationResult.requiresManualReview) {
                    const { notifyUnclassifiedIssue } = require('./services/notificationService');
                    notifyUnclassifiedIssue(newTicket);
                } else {
                    // Try to get technician suggestions and potentially auto-assign
                    const { autoAssignIssue } = require('./services/technicianFiltering');
                    autoAssignmentResult = await autoAssignIssue(newTicket, classificationResult);
                    
                    if (!autoAssignmentResult.assigned) {
                        // Get suggestions for manual assignment
                        technicianSuggestions = await getTechnicianSuggestions(newTicket, {
                            enableNotifications: true,
                            classificationMethod: classificationResult.classificationMethod
                        });
                    }
                }
            } catch (error) {
                console.warn('Failed to process assignment for new ticket:', error);
                // Create manual assignment notification as fallback
                const { notifyManualAssignmentRequired } = require('./services/notificationService');
                notifyManualAssignmentRequired(newTicket, 'System error during assignment processing');
            }
            
            res.status(201).json({
                ...newTicket.toObject(),
                originalIssueCategory: issue_category,
                processedIssueCategory: processedIssueType,
                classificationResult,
                autoAssignmentResult,
                technicianSuggestions
            });
        } else {
            // Fallback storage operations
            const ticketId = `TICK-${Date.now()}`;
            const newTicket = {
                _id: ticketId,
                creator_id: req.user._id,
                creator_name: req.user.name,
                status: 'open',
                issue_name,
                issue_category: processedIssueType, // Use processed issue type
                issue_description,
                image_url: req.file ? (isServerless ? 
                    `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` : 
                    `/uploads/${req.file.filename}`) : null,
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
            
            // Handle assignment and notifications for fallback storage
            let autoAssignmentResult = null;
            try {
                if (classificationResult.requiresManualReview) {
                    const { notifyUnclassifiedIssue } = require('./services/notificationService');
                    notifyUnclassifiedIssue(newTicket);
                } else {
                    // For fallback storage, just create notifications without actual assignment
                    const { notifyManualAssignmentRequired } = require('./services/notificationService');
                    notifyManualAssignmentRequired(newTicket, 'Using demo mode - manual assignment required');
                }
            } catch (error) {
                console.warn('Failed to create notifications for fallback ticket:', error);
            }
            
            res.status(201).json({
                ...newTicket,
                originalIssueCategory: issue_category,
                processedIssueCategory: processedIssueType,
                classificationResult,
                autoAssignmentResult
            });
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

// Get technician suggestions for a specific ticket
app.get('/api/tickets/:id/technician-suggestions', authenticateToken, async (req, res) => {
    try {
        // Only allow authority to access technician suggestions
        if (req.user.role !== 'authority') {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        const ticket = await findTicketById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        
        const suggestions = await getTechnicianSuggestions(ticket);
        res.json(suggestions);
    } catch (error) {
        console.error('Get technician suggestions error:', error);
        res.status(500).json({ error: 'Failed to get technician suggestions' });
    }
});

// Assign ticket to technician with enhanced logic
app.put('/api/tickets/:id/assign-technician', authenticateToken, async (req, res) => {
    try {
        // Only allow authority to assign technicians
        if (req.user.role !== 'authority') {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        const { technicianId, notes } = req.body;
        const { assignIssueToTechnician } = require('./services/technicianFiltering');
        
        if (!technicianId) {
            return res.status(400).json({ error: 'Technician ID is required' });
        }
        
        const result = await assignIssueToTechnician(req.params.id, technicianId);
        
        // Add assignment notes if provided
        if (notes) {
            await Ticket.findByIdAndUpdate(req.params.id, {
                $push: { 
                    notes: {
                        content: notes,
                        author: req.user.name,
                        timestamp: new Date()
                    }
                }
            });
        }
        
        res.json({
            message: 'Ticket assigned successfully',
            ticket: result.ticket,
            technician: {
                _id: result.technician._id,
                name: result.technician.name,
                specialization: result.technician.specialization,
                openTickets: result.technician.openTickets
            }
        });
    } catch (error) {
        console.error('Enhanced assign ticket error:', error);
        res.status(500).json({ error: error.message || 'Failed to assign ticket' });
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
        const { specialization, status, department, issueType, available } = req.query;
        
        let technicians = [];
        
        if (isConnectedToDB) {
            const filter = { role: 'technician' };
            
            // Filter by specialization/issue type
            if (specialization || issueType) {
                const searchTerm = specialization || issueType;
                filter.specialization = { $regex: searchTerm, $options: 'i' };
            }
            
            // Filter by status
            if (status) {
                filter.status = status;
            } else if (available === 'true') {
                // Only show active technicians if available filter is requested
                filter.status = 'active';
            }
            
            if (department) {
                filter.dept = { $regex: department, $options: 'i' };
            }
            
            technicians = await User.find(filter).select('-password');
        } else {
            // Fallback storage operations
            technicians = fallbackStorage.users.filter(user => user.role === 'technician');
            
            if (specialization || issueType) {
                const searchTerm = specialization || issueType;
                technicians = technicians.filter(tech => 
                    tech.specialization && tech.specialization.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }
            
            if (status) {
                technicians = technicians.filter(tech => tech.status === status);
            } else if (available === 'true') {
                technicians = technicians.filter(tech => tech.status === 'active');
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

// Get filtered technicians for specific issue type
app.get('/api/technicians/filtered/:issueType', authenticateToken, async (req, res) => {
    try {
        // Only allow authority to access filtered technicians
        if (req.user.role !== 'authority') {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        const { issueType } = req.params;
        const { filterTechniciansForIssue } = require('./services/technicianFiltering');
        
        const technicians = await filterTechniciansForIssue(issueType);
        
        res.json({
            issueType,
            availableTechnicians: technicians.length,
            technicians
        });
    } catch (error) {
        console.error('Get filtered technicians error:', error);
        res.status(500).json({ error: 'Failed to filter technicians' });
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
app.get('/api/technicians/:id/tasks', authenticateToken, async (req, res) => {
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
        
        if (isConnectedToDB) {
            const tasks = await Ticket.find(filter).sort({ opening_time: -1 });
            res.json(tasks);
        } else {
            // Fallback storage
            const tasks = fallbackStorage.tickets.filter(ticket => {
                const matchesTechnician = ticket.assigned_technician === technicianId;
                const matchesStatus = taskStatus ? ticket.status === taskStatus : true;
                return matchesTechnician && matchesStatus;
            });
            res.json(tasks);
        }
    } catch (error) {
        console.error('Get technician tasks error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get technician task summary (counts by status)
app.get('/api/technicians/:id/task-summary', authenticateToken, async (req, res) => {
    try {
        const technicianId = req.params.id;
        
        // Ensure technician can only access their own data or admin can access any
        if (req.user._id !== technicianId && req.user.role !== 'authority') {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        if (isConnectedToDB) {
            const openTasks = await Ticket.countDocuments({ 
                assigned_technician: technicianId, 
                status: 'open' 
            });
            const inProgressTasks = await Ticket.countDocuments({ 
                assigned_technician: technicianId, 
                status: 'in process' 
            });
            const resolvedTasks = await Ticket.countDocuments({ 
                assigned_technician: technicianId, 
                status: 'resolved' 
            });
            
            res.json({
                open: openTasks,
                inProgress: inProgressTasks,
                resolved: resolvedTasks,
                total: openTasks + inProgressTasks + resolvedTasks
            });
        } else {
            // Fallback storage
            const tasks = fallbackStorage.tickets.filter(ticket => 
                ticket.assigned_technician === technicianId
            );
            
            const summary = {
                open: tasks.filter(t => t.status === 'open').length,
                inProgress: tasks.filter(t => t.status === 'in process').length,
                resolved: tasks.filter(t => t.status === 'resolved').length,
                total: tasks.length
            };
            
            res.json(summary);
        }
    } catch (error) {
        console.error('Get technician task summary error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Promote user to technician endpoint
app.post('/api/admin/users/:id/promote-technician', authenticateToken, async (req, res) => {
    try {
        // Only allow authority to promote users
        if (req.user.role !== 'authority') {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        const { specialization, dept, contact } = req.body;
        const userId = req.params.id;
        
        if (!specialization) {
            return res.status(400).json({ error: 'Specialization is required' });
        }
        
        if (isConnectedToDB) {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            
            if (user.role === 'technician') {
                return res.status(400).json({ error: 'User is already a technician' });
            }
            
            // Update user to technician
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                {
                    role: 'technician',
                    is_technician: true,
                    specialization,
                    dept: dept || specialization,
                    contact: contact || user.contact,
                    status: 'active',
                    openTickets: 0,
                    avgResolutionTime: '0 days',
                    totalResolved: 0,
                    rating: 0
                },
                { new: true }
            ).select('-password');
            
            res.json({
                message: 'User promoted to technician successfully',
                user: updatedUser
            });
        } else {
            // Fallback storage operations
            const userIndex = fallbackStorage.users.findIndex(user => user._id === userId);
            
            if (userIndex === -1) {
                return res.status(404).json({ error: 'User not found' });
            }
            
            const user = fallbackStorage.users[userIndex];
            if (user.role === 'technician') {
                return res.status(400).json({ error: 'User is already a technician' });
            }
            
            // Update user to technician
            fallbackStorage.users[userIndex] = {
                ...user,
                role: 'technician',
                is_technician: true,
                specialization,
                dept: dept || specialization,
                contact: contact || user.contact,
                status: 'active',
                openTickets: 0,
                avgResolutionTime: '0 days',
                totalResolved: 0,
                rating: 0
            };
            
            const { password, ...sanitizedUser } = fallbackStorage.users[userIndex];
            res.json({
                message: 'User promoted to technician successfully',
                user: sanitizedUser
            });
        }
    } catch (error) {
        console.error('Promote user to technician error:', error);
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
        
        const { page = 1, limit = 20, read, type, priority } = req.query;
        
        // Get notifications from our notification service
        const notificationService = require('./services/notificationService');
        const notifications = notificationService.getNotifications({
            read: read ? read === 'true' : undefined,
            type,
            priority
        });
        
        // Pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const startIndex = (pageNum - 1) * limitNum;
        const endIndex = startIndex + limitNum;
        const paginatedNotifications = notifications.slice(startIndex, endIndex);
        
        // If we have specific admin notifications, merge with system-generated ones
        let systemNotifications = [];
        if (isConnectedToDB) {
            const recentTickets = await Ticket.find()
                .sort({ opening_time: -1 })
                .limit(5);
            
            const recentUsers = await User.find()
                .sort({ createdAt: -1 })
                .limit(3);
            
            systemNotifications = [
                ...recentTickets.map(ticket => ({
                    _id: `notif-ticket-${ticket._id}`,
                    type: 'ticket',
                    title: `New ${ticket.urgency} issue reported`,
                    message: `${ticket.issue_name} in ${ticket.location.address}`,
                    data: { ticketId: ticket._id },
                    read: false,
                    actionable: false,
                    priority: ticket.urgency === 'critical' ? 'high' : 'medium',
                    createdAt: ticket.opening_time
                })),
                ...recentUsers.map(user => ({
                    _id: `notif-user-${user._id}`,
                    type: 'user',
                    title: 'New user registered',
                    message: `${user.name} (${user.email}) joined as ${user.role}`,
                    data: { userId: user._id },
                    read: false,
                    actionable: false,
                    priority: 'low',
                    createdAt: user.createdAt || new Date()
                }))
            ];
        } else {
            // Fallback storage notifications
            systemNotifications = [
                {
                    _id: 'notif-system-1',
                    type: 'system',
                    title: 'System Status',
                    message: 'Using in-memory storage. Connect MongoDB for persistent data.',
                    data: {},
                    read: false,
                    actionable: false,
                    priority: 'low',
                    createdAt: new Date()
                },
                ...fallbackStorage.tickets.slice(0, 3).map(ticket => ({
                    _id: `notif-ticket-${ticket._id}`,
                    type: 'ticket',
                    title: `New ${ticket.urgency || 'moderate'} issue reported`,
                    message: `${ticket.issue_name} in ${ticket.location.address}`,
                    data: { ticketId: ticket._id },
                    read: false,
                    actionable: false,
                    priority: ticket.urgency === 'critical' ? 'high' : 'medium',
                    createdAt: ticket.opening_time
                }))
            ];
        }
        
        // Merge admin notifications with system notifications
        const allNotifications = [...paginatedNotifications, ...systemNotifications]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        res.json({
            notifications: allNotifications,
            counts: {
                total: notifications.length + systemNotifications.length,
                unread: notificationService.getUnreadCount(),
                actionable: notificationService.getActionableCount()
            },
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: notifications.length,
                pages: Math.ceil(notifications.length / limitNum)
            }
        });
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
        const notificationService = require('./services/notificationService');
        
        const updatedNotification = notificationService.markNotificationRead(notificationId);
        
        if (updatedNotification) {
            res.json({ message: 'Notification marked as read', notification: updatedNotification });
        } else {
            res.json({ message: 'Notification marked as read' }); // For system notifications
        }
    } catch (error) {
        console.error('Mark notification read error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Enhanced assignment endpoints for admin workflow

// Manual assignment endpoint for unclassified or problematic issues
app.put('/api/admin/tickets/:id/manual-assign', authenticateToken, async (req, res) => {
    try {
        // Only allow authority to manually assign
        if (req.user.role !== 'authority') {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        const { technicianId, issueCategory, notes } = req.body;
        const ticketId = req.params.id;
        
        if (!technicianId) {
            return res.status(400).json({ error: 'Technician ID is required' });
        }
        
        const ticket = await findTicketById(ticketId);
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        
        const technician = await findTechnicianById(technicianId);
        if (!technician) {
            return res.status(404).json({ error: 'Technician not found' });
        }
        
        // Update ticket with manual assignment
        const updateData = {
            assigned_technician: technicianId,
            status: 'in process'
        };
        
        // If issue category is being updated (for unclassified issues)
        if (issueCategory) {
            updateData.issue_category = issueCategory;
        }
        
        const updatedTicket = await Ticket.findByIdAndUpdate(
            ticketId,
            updateData,
            { new: true }
        );
        
        // Update technician's workload
        await User.findByIdAndUpdate(technicianId, {
            $addToSet: { issues_assigned: ticketId },
            $inc: { openTickets: 1 }
        });
        
        // Add assignment notes if provided
        if (notes) {
            await Ticket.findByIdAndUpdate(ticketId, {
                $push: { 
                    notes: {
                        content: `Manual assignment: ${notes}`,
                        author: req.user.name,
                        timestamp: new Date()
                    }
                }
            });
        }
        
        // Remove related notifications
        const notificationService = require('./services/notificationService');
        const notifications = notificationService.getNotifications();
        notifications.forEach(notification => {
            if (notification.data.ticketId === ticketId) {
                notificationService.removeNotification(notification._id);
            }
        });
        
        res.json({
            message: 'Ticket manually assigned successfully',
            ticket: updatedTicket,
            technician: {
                _id: technician._id,
                name: technician.name,
                specialization: technician.specialization
            }
        });
    } catch (error) {
        console.error('Manual assignment error:', error);
        res.status(500).json({ error: 'Failed to manually assign ticket' });
    }
});

// Assignment approval endpoint for LLM suggestions
app.put('/api/admin/tickets/:id/approve-assignment', authenticateToken, async (req, res) => {
    try {
        // Only allow authority to approve assignments
        if (req.user.role !== 'authority') {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        const { technicianId, approved, notes } = req.body;
        const ticketId = req.params.id;
        
        if (!technicianId) {
            return res.status(400).json({ error: 'Technician ID is required' });
        }
        
        const ticket = await findTicketById(ticketId);
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        
        if (approved) {
            // Approve the suggested assignment
            const { assignIssueToTechnician } = require('./services/technicianFiltering');
            const assignmentResult = await assignIssueToTechnician(ticketId, technicianId);
            
            // Add approval notes
            if (notes) {
                await Ticket.findByIdAndUpdate(ticketId, {
                    $push: { 
                        notes: {
                            content: `Assignment approved: ${notes}`,
                            author: req.user.name,
                            timestamp: new Date()
                        }
                    }
                });
            }
            
            res.json({
                message: 'Assignment approved successfully',
                ...assignmentResult
            });
        } else {
            // Assignment rejected - keep ticket open for manual assignment
            if (notes) {
                await Ticket.findByIdAndUpdate(ticketId, {
                    $push: { 
                        notes: {
                            content: `Assignment rejected: ${notes}`,
                            author: req.user.name,
                            timestamp: new Date()
                        }
                    }
                });
            }
            
            res.json({
                message: 'Assignment rejected - ticket remains open for manual assignment',
                ticket
            });
        }
        
        // Remove related notifications
        const notificationService = require('./services/notificationService');
        const notifications = notificationService.getNotifications();
        notifications.forEach(notification => {
            if (notification.data.ticketId === ticketId) {
                notificationService.removeNotification(notification._id);
            }
        });
        
    } catch (error) {
        console.error('Assignment approval error:', error);
        res.status(500).json({ error: 'Failed to process assignment approval' });
    }
});

// Get notification counts for admin dashboard
app.get('/api/admin/notification-counts', authenticateToken, async (req, res) => {
    try {
        // Only allow authority to access notification counts
        if (req.user.role !== 'authority') {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        const notificationService = require('./services/notificationService');
        
        res.json({
            total: notificationService.getNotifications().length,
            unread: notificationService.getUnreadCount(),
            actionable: notificationService.getActionableCount(),
            byType: {
                unclassified: notificationService.getNotifications({ type: 'issue_unclassified', read: false }).length,
                llmPending: notificationService.getNotifications({ type: 'llm_assignment_pending', read: false }).length,
                noTechnicians: notificationService.getNotifications({ type: 'no_technicians_available', read: false }).length,
                manualRequired: notificationService.getNotifications({ type: 'manual_assignment_required', read: false }).length
            }
        });
    } catch (error) {
        console.error('Get notification counts error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
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
    
    if (isServerless) {
        // In serverless environment, return base64 data URL
        res.json({
            filename: req.file.originalname,
            originalName: req.file.originalname,
            size: req.file.size,
            url: `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
            type: 'base64'
        });
    } else {
        // In local environment, return file path
        res.json({
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
            url: `/uploads/${req.file.filename}`,
            type: 'file'
        });
    }
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

// Start server (only in non-serverless environments)
if (!isServerless) {
    app.listen(PORT, () => {
        console.log(`Civix API Server running on port ${PORT}`);
        console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
} else {
    console.log('Running in serverless mode');
}

module.exports = app;
