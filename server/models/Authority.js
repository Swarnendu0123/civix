const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const authoritySchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => require('uuid').v4()
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    location: {
        coordinates: {
            lat: {
                type: Number,
                required: true
            },
            lng: {
                type: Number,
                required: true
            }
        },
        address: {
            type: String,
            required: true
        }
    },
    issues: [{
        type: String,
        ref: 'Ticket'
    }],
    technicians: [{
        type: String,
        ref: 'User'
    }],
    role: {
        type: String,
        default: 'authority'
    }
}, {
    timestamps: true,
    _id: false // We're providing custom _id
});

// Hash password before saving
authoritySchema.pre('save', async function(next) {
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
authoritySchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Index for location-based queries
authoritySchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Authority', authoritySchema);