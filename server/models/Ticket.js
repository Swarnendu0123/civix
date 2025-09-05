const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: function() {
            // Auto-generate ticket ID in format TICK-001, TICK-002, etc.
            return `TICK-${String(Date.now()).slice(-6)}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
        }
    },
    creator_id: {
        type: String,
        ref: 'User',
        required: true
    },
    creator_name: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['open', 'resolved', 'in process'],
        default: 'open'
    },
    issue_name: {
        type: String,
        required: true
    },
    issue_category: {
        type: String,
        required: true // "Water", "Electric issue", "Roads", etc.
    },
    issue_description: {
        type: String,
        required: true
    },
    image_url: {
        type: String,
        default: null
    },
    tags: [{
        type: String
    }],
    votes: {
        upvotes: {
            type: Number,
            default: 0
        },
        downvotes: {
            type: Number,
            default: 0
        }
    },
    urgency: {
        type: String,
        enum: ['critical', 'moderate', 'low'],
        default: 'moderate'
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
    opening_time: {
        type: Date,
        default: Date.now
    },
    closing_time: {
        type: Date,
        default: null
    },
    authority: {
        type: String,
        ref: 'Authority',
        required: true
    },
    sub_authority: {
        type: String,
        ref: 'SubAuthority',
        default: null
    },
    assigned_technician: {
        type: String,
        ref: 'User',
        default: null
    }
}, {
    timestamps: true,
    _id: false // We're providing custom _id
});

// Index for location-based queries
ticketSchema.index({ 'location.coordinates': '2dsphere' });

// Index for common query patterns
ticketSchema.index({ status: 1, opening_time: -1 });
ticketSchema.index({ creator_id: 1, opening_time: -1 });
ticketSchema.index({ assigned_technician: 1, status: 1 });

module.exports = mongoose.model('Ticket', ticketSchema);