# API Integration Guide

This guide explains how the Civix clients have been updated to sync with the new backend server implementation.

## Server Setup

The backend server is now implemented with Node.js, Express, and MongoDB. To run the complete system:

### 1. Start MongoDB
```bash
# Install and start MongoDB (varies by system)
# Example for Ubuntu:
sudo systemctl start mongod

# Or use Docker:
docker run -d -p 27017:27017 --name civix-mongo mongo:latest
```

### 2. Install Server Dependencies
```bash
cd server
npm install
```

### 3. Configure Environment
Copy the example environment file and configure:
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and other settings
```

### 4. Start Server
```bash
cd server
npm start
# Server runs on http://localhost:3000
```

## Client Updates

Both web and mobile clients have been updated to use the new server API endpoints.

### API Endpoint Changes

| Old Endpoint | New Endpoint | Purpose |
|-------------|-------------|---------|
| `/auth/register` | `/api/user/register` | User registration |
| `/tickets/*` | `/api/ticket/*` | Ticket management |
| `/users/profile` | `/api/user/update/details/:email` | User profile updates |

### Authentication Changes

- Removed JWT token-based authentication (server doesn't implement this yet)
- Using simple user storage with email-based access
- Login functionality requires server-side implementation

### Data Format Changes

#### Tickets
- Server expects: `{ creator_id, creator_name, issue_name, issue_category, issue_description, location: { latitude, longitude } }`
- Server returns: `{ tickets: [...] }` with populated creator and authority data

#### Users
- Server expects: `{ email, password, name, phone, address, location }`
- Server returns: User object without password field

## Testing the Integration

### 1. Start All Services
```bash
# Terminal 1: Start MongoDB
mongod

# Terminal 2: Start Server
cd server && npm start

# Terminal 3: Start Web Client
cd clients/web && npm run dev

# Terminal 4: Start Mobile App
cd clients/app && npx expo start --web
```

### 2. Test API Endpoints
```bash
# Health check
curl http://localhost:3000/health

# Register a user
curl -X POST http://localhost:3000/api/user/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Get all tickets
curl http://localhost:3000/api/ticket/all
```

### 3. Test Client Functionality

#### Web Client (http://localhost:5173)
- Dashboard loads with analytics and recent tickets
- Issue management shows all tickets from server
- Ticket creation works with new API format

#### Mobile App (http://localhost:8081)
- Home screen displays recent tickets from server
- Raise issue form submits to new API endpoint
- My tickets filters tickets by current user

## Key Implementation Details

### Error Handling
- Graceful fallback to sample data when server is unavailable
- Proper error messages for API failures
- Loading states during API calls

### Data Transformation
- `transformers.ticketToIssue()` - Server ticket → UI Issue format
- `transformers.ticketToMobileFormat()` - Server ticket → Mobile format
- `transformers.uiToTicketAPI()` - UI form data → Server format

### Backwards Compatibility
- Legacy API functions maintained but updated to use new endpoints
- Existing component interfaces preserved
- Sample data fallbacks for development without backend

## Limitations and Future Improvements

### Current Limitations
- No authentication/login implementation on server
- File upload not implemented (uses mock URLs)
- No real-time updates
- Limited user role management

### Recommended Improvements
1. Implement JWT authentication on server
2. Add file upload functionality
3. Implement WebSocket for real-time updates
4. Add comprehensive user role management
5. Add input validation and sanitization
6. Implement proper logging and monitoring

## Migration Checklist

- [x] Update API services in both clients
- [x] Fix data transformation functions
- [x] Update component API calls
- [x] Handle authentication changes
- [x] Update environment configuration
- [x] Test basic functionality
- [ ] Implement missing authentication on server
- [ ] Add file upload capability
- [ ] Add real-time updates
- [ ] Comprehensive testing with MongoDB