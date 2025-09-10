const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/civix';
        
        console.log('Attempting to connect to MongoDB...');
        const conn = await mongoose.connect(mongoURI, {
            // Mongoose 6+ no longer needs these options as they are defaults
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000, // Timeout after 5s instead of 30s
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        console.log('Running without database - API will use fallback in-memory storage');
        
        // Don't exit the process, let the app run with fallback storage
        return null;
    }
};

module.exports = connectDB;