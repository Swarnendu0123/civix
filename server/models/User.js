const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => require('uuid').v4()
    },
    password: {
        type: String,
        required: true
    },
    issues: [{
        type: String,
        ref: 'Ticket'
    }],
    name: {
        type: String,
        default: null
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    is_technician: {
        type: Boolean,
        default: false
    },
    specialization: {
        type: String,
        default: null // "Electrician", "Plumber", "Water Supply", "Roads", etc.
    },
    points: {
        type: Number,
        default: 0
    },
    role: {
        type: String,
        enum: ['citizen', 'technician'],
        default: 'citizen'
    },
    // Additional fields for technicians
    contact: {
        type: String,
        default: null
    },
    dept: {
        type: String,
        default: null
    },
    openTickets: {
        type: Number,
        default: 0
    },
    avgResolutionTime: {
        type: String,
        default: '0 days'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'on_site'],
        default: 'active'
    },
    totalResolved: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    issues_assigned: [{
        type: String,
        ref: 'Ticket'
    }],
    pulls_created: [{
        type: String,
        ref: 'ResolveRequest'
    }]
}, {
    timestamps: true,
    _id: false // We're providing custom _id
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Update is_technician based on role
userSchema.pre('save', function(next) {
    this.is_technician = this.role === 'technician';
    next();
});

module.exports = mongoose.model('User', userSchema);