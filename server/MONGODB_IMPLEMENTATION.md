# MongoDB Configuration and Schemas Implementation

## Overview
Successfully implemented comprehensive MongoDB database configuration with all required schemas for the Civix platform according to the issue requirements.

## Implemented Schemas

### 1. User Schema (`models/User.js`)
```javascript
{
    _id: String (UUID),
    password: String (bcrypt hashed),
    issues: [Ref(Ticket)],
    name: String,
    email: String (unique),
    is_technician: Boolean,
    specialization: String, // "Electrician", "Plumber", etc.
    points: Number,
    role: String, // "citizen" | "technician"
    // Additional technician fields:
    contact: String,
    dept: String,
    openTickets: Number,
    avgResolutionTime: String,
    status: String, // "active" | "inactive" | "on_site"
    totalResolved: Number,
    rating: Number,
    issues_assigned: [Ref(Ticket)],
    pulls_created: [Ref(ResolveRequest)]
}
```

### 2. Ticket Schema (`models/Ticket.js`)
```javascript
{
    _id: String (auto-generated),
    creator_id: Ref(User),
    creator_name: String,
    status: String, // "open" | "resolved" | "in process"
    issue_name: String,
    issue_category: String, // "Water", "Electric issue", etc.
    issue_description: String,
    image_url: String,
    tags: [String],
    votes: {
        upvotes: Number,
        downvotes: Number
    },
    urgency: String, // "critical" | "moderate" | "low"
    location: {
        coordinates: { lat: Number, lng: Number },
        address: String
    },
    opening_time: Date,
    closing_time: Date,
    authority: Ref(Authority),
    sub_authority: Ref(SubAuthority),
    assigned_technician: Ref(User)
}
```

### 3. ResolveRequest Schema (`models/ResolveRequest.js`)
```javascript
{
    _id: String (UUID),
    creator: Ref(User), // Technician only
    name: String,
    description: String,
    image_url: String,
    sub_authority: Ref(SubAuthority),
    authority: Ref(Authority),
    ticket_id: Ref(Ticket),
    status: String // "pending" | "approved" | "rejected"
}
```

### 4. Authority Schema (`models/Authority.js`)
```javascript
{
    _id: String (UUID),
    password: String (bcrypt hashed),
    name: String,
    email: String (unique),
    location: {
        coordinates: { lat: Number, lng: Number },
        address: String
    },
    issues: [Ref(Ticket)],
    technicians: [Ref(User)],
    role: String // "authority"
}
```

## Key Features Implemented

### 1. Security
- ✅ Password hashing with bcrypt
- ✅ Input validation and sanitization
- ✅ Unique email constraints
- ✅ Role-based access control

### 2. Database Performance
- ✅ Optimized indexes for common queries
- ✅ Geospatial indexing for location-based searches
- ✅ Compound indexes for complex queries

### 3. Data Relationships
- ✅ Proper referencing between collections
- ✅ Automatic relationship management
- ✅ Validation for technician-only operations

### 4. Environment Configuration
- ✅ Environment variables with .env file
- ✅ Database connection configuration
- ✅ Graceful error handling
- ✅ Fallback storage for testing

## API Endpoints Tested

All authentication and user management endpoints are working correctly:

1. **POST** `/api/auth/login` - User authentication
2. **POST** `/api/auth/register` - User registration  
3. **GET** `/api/users/profile` - User profile retrieval
4. **PUT** `/api/users/profile` - Profile updates
5. **GET** `/api/analytics` - System analytics
6. **GET** `/api/health` - Health check

## Database Connection

The system includes robust database connection handling:
- Attempts MongoDB connection with configurable timeout
- Falls back to in-memory storage for testing/development
- Comprehensive error logging
- Environment-based configuration

## Testing

Schema validation tests demonstrate:
- ✅ All required fields are properly validated
- ✅ Schema relationships work correctly
- ✅ Indexes are properly configured
- ✅ Password hashing functions correctly
- ✅ Role-based validation works

## Usage

### With MongoDB:
```bash
# Set environment variables
MONGODB_URI=mongodb://localhost:27017/civix

# Start server
npm start
```

### Without MongoDB (Fallback):
The system automatically detects MongoDB unavailability and switches to in-memory storage with sample data for demonstration.

## Files Created/Modified

1. `config/database.js` - Database connection configuration
2. `models/User.js` - User/Technician schema
3. `models/Ticket.js` - Issue tracking schema
4. `models/ResolveRequest.js` - Resolution request schema
5. `models/Authority.js` - City authority schema
6. `models/index.js` - Model exports
7. `seed.js` - Development data seeding
8. `test-schemas.js` - Schema validation tests
9. `.env` - Environment configuration
10. `index.js` - Updated main server with MongoDB integration

The implementation fully satisfies all requirements from the issue specification and provides a production-ready foundation for the Civix platform.