const mongoose = require('mongoose');

const resolveRequestSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => require('uuid').v4()
    },
    creator: {
        type: String,
        ref: 'User',
        required: true,
        validate: {
            validator: async function(userId) {
                const User = mongoose.model('User');
                const user = await User.findById(userId);
                return user && user.role === 'technician';
            },
            message: 'Only technicians can create resolve requests'
        }
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image_url: {
        type: String,
        default: null
    },
    sub_authority: {
        type: String,
        ref: 'SubAuthority',
        required: true
    },
    authority: {
        type: String,
        ref: 'Authority',
        required: true
    },
    ticket_id: {
        type: String,
        ref: 'Ticket',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: true,
    _id: false // We're providing custom _id
});

// Index for common queries
resolveRequestSchema.index({ creator: 1, createdAt: -1 });
resolveRequestSchema.index({ authority: 1, status: 1 });
resolveRequestSchema.index({ ticket_id: 1 });

module.exports = mongoose.model('ResolveRequest', resolveRequestSchema);