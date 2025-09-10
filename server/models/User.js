const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  // Will be editable at the User end
  name: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    default: null
  },
  address: {
    type: String,
    default: null
  },
  location: {
    type: {
      latitude: Number,
      longitude: Number
    },
    default: null
  },
  // Will be updated by the Admin Panel
  role: {
    type: String,
    enum: ['user', 'technician', 'authority', 'admin'],
    default: 'user'
  },
  isTechnician: {
    type: Boolean,
    default: false
  },
  // Automatically updated
  tickets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket'
  }],
  points: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);