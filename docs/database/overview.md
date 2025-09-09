# Database Schema Overview

Civix uses MongoDB as its primary database, with carefully designed schemas to support efficient civic issue management. The database architecture emphasizes performance, scalability, and data integrity.

## Database Architecture

```mermaid
erDiagram
    User ||--o{ Ticket : creates
    User ||--o{ ResolveRequest : submits
    Authority ||--o{ Ticket : manages
    Authority ||--o{ User : supervises
    Ticket ||--o{ ResolveRequest : resolves
    
    User {
        string _id PK
        string email UK
        string password
        string name
        string role
        boolean is_technician
        string specialization
        number points
        array issues
        array issues_assigned
        array pulls_created
        date created_at
        date updated_at
    }
    
    Ticket {
        string _id PK
        string creator_id FK
        string creator_name
        string status
        string issue_name
        string issue_category
        string issue_description
        string image_url
        array tags
        object votes
        string urgency
        object location
        date opening_time
        date closing_time
        string authority FK
        string sub_authority FK
        string assigned_technician FK
    }
    
    Authority {
        string _id PK
        string email UK
        string password
        string name
        object location
        array issues
        array technicians
        string role
        date created_at
        date updated_at
    }
    
    ResolveRequest {
        string _id PK
        string creator FK
        string name
        string description
        string image_url
        string sub_authority FK
        string authority FK
        string ticket_id FK
        string status
        date created_at
        date updated_at
    }
```

## Collections Overview

| Collection | Purpose | Document Count (Typical) |
|------------|---------|-------------------------|
| `users` | Citizens, technicians, admins | 10,000 - 100,000+ |
| `tickets` | Reported civic issues | 1,000 - 50,000+ |
| `authorities` | City departments | 10 - 100 |
| `resolverequests` | Resolution submissions | 500 - 10,000+ |

## Core Schemas

### User Schema
**Collection**: `users`  
**Purpose**: Stores all platform users (citizens, technicians, administrators)

```javascript
{
  _id: String,              // UUID primary key
  email: String,            // Unique email address
  password: String,         // bcrypt hashed password
  name: String,             // Full name
  role: String,             // "citizen" | "technician" | "admin"
  is_technician: Boolean,   // Quick technician check
  
  // Citizen fields
  points: Number,           // Gamification points
  issues: [ObjectId],       // References to created tickets
  
  // Technician fields
  specialization: String,   // "Electrician", "Plumber", etc.
  contact: String,          // Phone number
  dept: String,             // Department name
  openTickets: Number,      // Current active assignments
  avgResolutionTime: String, // Performance metric
  status: String,           // "active" | "inactive" | "on_site"
  totalResolved: Number,    // Completed tickets count
  rating: Number,           // User rating (1-5)
  issues_assigned: [ObjectId], // Assigned tickets
  pulls_created: [ObjectId],   // Resolve requests created
  
  // Metadata
  created_at: Date,
  updated_at: Date
}
```

### Ticket Schema
**Collection**: `tickets`  
**Purpose**: Stores all reported civic issues

```javascript
{
  _id: String,              // Auto-generated ID
  creator_id: ObjectId,     // Reference to User
  creator_name: String,     // Cached creator name
  status: String,           // "open" | "in_process" | "resolved"
  
  // Issue details
  issue_name: String,       // Brief title
  issue_category: String,   // "Water", "Electric issue", etc.
  issue_description: String, // Detailed description
  image_url: String,        // Photo evidence URL
  tags: [String],           // Searchable tags
  
  // Community features
  votes: {
    upvotes: Number,        // Community upvotes
    downvotes: Number       // Community downvotes
  },
  
  // Priority and location
  urgency: String,          // "critical" | "moderate" | "low"
  location: {
    coordinates: {
      lat: Number,          // GPS latitude
      lng: Number           // GPS longitude
    },
    address: String         // Human-readable address
  },
  
  // Lifecycle
  opening_time: Date,       // When issue was reported
  closing_time: Date,       // When issue was resolved
  
  // Assignment
  authority: ObjectId,      // Reference to Authority
  sub_authority: ObjectId,  // Reference to SubAuthority
  assigned_technician: ObjectId, // Reference to User (technician)
  
  // Metadata
  created_at: Date,
  updated_at: Date
}
```

### Authority Schema
**Collection**: `authorities`  
**Purpose**: Stores city departments and administrative entities

```javascript
{
  _id: String,              // UUID primary key
  email: String,            // Unique contact email
  password: String,         // bcrypt hashed password
  name: String,             // Department/authority name
  role: String,             // Always "authority"
  
  // Geographic coverage
  location: {
    coordinates: {
      lat: Number,          // Center point latitude
      lng: Number           // Center point longitude
    },
    address: String         // Office address
  },
  
  // Managed resources
  issues: [ObjectId],       // Tickets under jurisdiction
  technicians: [ObjectId], // Assigned technicians
  
  // Metadata
  created_at: Date,
  updated_at: Date
}
```

### ResolveRequest Schema
**Collection**: `resolverequests`  
**Purpose**: Stores technician resolution submissions

```javascript
{
  _id: String,              // UUID primary key
  creator: ObjectId,        // Reference to User (technician)
  name: String,             // Resolution title
  description: String,      // Work performed description
  image_url: String,        // Before/after photos
  
  // Administrative
  sub_authority: ObjectId,  // Reference to SubAuthority
  authority: ObjectId,      // Reference to Authority
  ticket_id: ObjectId,      // Reference to Ticket
  status: String,           // "pending" | "approved" | "rejected"
  
  // Metadata
  created_at: Date,
  updated_at: Date
}
```

## Database Indexes

### Performance Indexes

#### Users Collection
```javascript
// Unique email index
db.users.createIndex({ email: 1 }, { unique: true })

// Role-based queries
db.users.createIndex({ role: 1, is_technician: 1 })

// Technician specialization lookup
db.users.createIndex({ specialization: 1, status: 1 })

// Performance tracking
db.users.createIndex({ avgResolutionTime: 1, rating: -1 })
```

#### Tickets Collection
```javascript
// Geospatial index for location-based queries
db.tickets.createIndex({ "location.coordinates": "2dsphere" })

// Status and date filtering
db.tickets.createIndex({ status: 1, opening_time: -1 })

// Category and urgency filtering
db.tickets.createIndex({ issue_category: 1, urgency: 1 })

// Assignment tracking
db.tickets.createIndex({ assigned_technician: 1, status: 1 })

// Creator lookup
db.tickets.createIndex({ creator_id: 1, opening_time: -1 })

// Authority management
db.tickets.createIndex({ authority: 1, status: 1 })

// Full-text search on issue content
db.tickets.createIndex({ 
  issue_name: "text", 
  issue_description: "text", 
  tags: "text" 
})
```

#### Authorities Collection
```javascript
// Unique email index
db.authorities.createIndex({ email: 1 }, { unique: true })

// Geographic queries
db.authorities.createIndex({ "location.coordinates": "2dsphere" })
```

#### ResolveRequests Collection
```javascript
// Status and date filtering
db.resolverequests.createIndex({ status: 1, created_at: -1 })

// Technician tracking
db.resolverequests.createIndex({ creator: 1, created_at: -1 })

// Ticket resolution tracking
db.resolverequests.createIndex({ ticket_id: 1, status: 1 })

// Authority review queue
db.resolverequests.createIndex({ authority: 1, status: 1 })
```

## Data Validation

### Mongoose Schema Validation

```javascript
// User email validation
email: {
  type: String,
  required: true,
  unique: true,
  lowercase: true,
  validate: {
    validator: function(v) {
      return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
    },
    message: 'Please enter a valid email'
  }
}

// Password strength validation
password: {
  type: String,
  required: true,
  minlength: 8,
  validate: {
    validator: function(v) {
      return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(v);
    },
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  }
}

// Geographic coordinates validation
'location.coordinates.lat': {
  type: Number,
  required: true,
  min: -90,
  max: 90
},
'location.coordinates.lng': {
  type: Number,
  required: true,
  min: -180,
  max: 180
}

// Enum validation for status fields
status: {
  type: String,
  enum: ['open', 'in_process', 'resolved'],
  default: 'open'
}
```

## Database Performance

### Query Optimization

#### Efficient Ticket Queries
```javascript
// Find nearby open tickets
db.tickets.find({
  status: "open",
  "location.coordinates": {
    $near: {
      $geometry: { type: "Point", coordinates: [-74.0060, 40.7128] },
      $maxDistance: 1000  // 1km radius
    }
  }
}).hint({ "location.coordinates": "2dsphere" })

// Technician workload query
db.tickets.aggregate([
  { $match: { assigned_technician: { $exists: true }, status: "in_process" } },
  { $group: { 
    _id: "$assigned_technician", 
    count: { $sum: 1 },
    avgUrgency: { $avg: { $cond: [
      { $eq: ["$urgency", "critical"] }, 3,
      { $cond: [{ $eq: ["$urgency", "moderate"] }, 2, 1]}
    ]}}
  }},
  { $sort: { count: -1 } }
])
```

#### Dashboard Analytics Query
```javascript
// Daily ticket statistics
db.tickets.aggregate([
  {
    $group: {
      _id: {
        year: { $year: "$opening_time" },
        month: { $month: "$opening_time" },
        day: { $dayOfMonth: "$opening_time" }
      },
      count: { $sum: 1 },
      resolved: { 
        $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] }
      },
      avgResolutionTime: {
        $avg: {
          $cond: [
            { $ne: ["$closing_time", null] },
            { $subtract: ["$closing_time", "$opening_time"] },
            null
          ]
        }
      }
    }
  },
  { $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 } },
  { $limit: 30 }
])
```

### Connection Configuration

```javascript
// Optimized MongoDB connection
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,          // Maximum connections
      serverSelectionTimeoutMS: 5000, // Connection timeout
      socketTimeoutMS: 45000,   // Socket timeout
      family: 4,                // Use IPv4
      bufferCommands: false,    // Disable mongoose buffering
      bufferMaxEntries: 0       // Disable mongoose buffering
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};
```

## Data Migration

### Schema Evolution

```javascript
// Migration script example: Add new field to tickets
async function migrateTickets() {
  await db.tickets.updateMany(
    { priority_score: { $exists: false } },
    {
      $set: {
        priority_score: 0,
        last_updated: new Date()
      }
    }
  );
}

// Index creation for new features
async function createNewIndexes() {
  await db.tickets.createIndex({ priority_score: -1, status: 1 });
  await db.users.createIndex({ last_login: -1 });
}
```

## Database Security

### Access Control
```javascript
// Create application user with limited permissions
use civix
db.createUser({
  user: "civix_app",
  pwd: "secure_application_password",
  roles: [
    { role: "readWrite", db: "civix" }
  ]
})

// Create read-only analytics user
db.createUser({
  user: "civix_analytics",
  pwd: "analytics_password", 
  roles: [
    { role: "read", db: "civix" }
  ]
})
```

### Data Encryption
- **At Rest**: MongoDB encryption using WiredTiger
- **In Transit**: TLS/SSL connections
- **Application Level**: bcrypt password hashing, JWT token encryption

## Backup and Recovery

### Automated Backups
```bash
#!/bin/bash
# Daily backup script
DATE=$(date +%Y%m%d)
mongodump --uri="mongodb://user:pass@host:port/civix" --out="/backup/civix_$DATE"

# Compress backup
tar -czf "/backup/civix_$DATE.tar.gz" "/backup/civix_$DATE"

# Clean up old backups (keep 30 days)
find /backup -name "civix_*.tar.gz" -mtime +30 -delete
```

### Point-in-Time Recovery
```bash
# Restore from specific backup
mongorestore --uri="mongodb://localhost:27017/civix_restore" --drop /backup/civix_20250109/
```

## Database Monitoring

### Performance Metrics
```javascript
// Query performance analysis
db.tickets.explain("executionStats").find({ status: "open" })

// Index usage statistics
db.tickets.aggregate([{ $indexStats: {} }])

// Connection monitoring
db.runCommand({ serverStatus: 1 }).connections
```

### Health Checks
```javascript
// Database health endpoint
app.get('/api/health/database', async (req, res) => {
  try {
    const stats = await mongoose.connection.db.stats();
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    res.json({
      status: 'healthy',
      database: mongoose.connection.name,
      collections: collections.length,
      dataSize: stats.dataSize,
      indexSize: stats.indexSize
    });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});
```

This database schema provides a robust foundation for the Civix platform, ensuring data integrity, performance, and scalability as the system grows.