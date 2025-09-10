# Architecture Overview

Civix follows a modern, scalable architecture designed to handle high volumes of civic ticket reports while maintaining performance and reliability.

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│  Mobile App     │    │  Web Dashboard  │    │  Documentation  │
│  (React Native)│    │  (React + TS)   │    │  (VitePress)    │
│                 │    │                 │    │                 │
└─────────┬───────┘    └─────────┬───────┘    └─────────────────┘
          │                      │                      
          │                      │                      
          │              ┌───────▼───────┐              
          │              │               │              
          └──────────────▶  API Gateway  ◀──────────────┘
                         │  (Express.js) │              
                         │               │              
                         └───────┬───────┘              
                                 │                      
                         ┌───────▼───────┐              
                         │               │              
                         │  Backend API  │              
                         │  (Node.js)    │              
                         │               │              
                         └───────┬───────┘              
                                 │                      
                ┌────────────────┼────────────────┐     
                │                │                │     
        ┌───────▼───────┐ ┌──────▼──────┐ ┌──────▼──────┐
        │               │ │             │ │             │
        │   MongoDB     │ │   Firebase  │ │   Mapbox    │
        │   Database    │ │   Storage   │ │   Maps API  │
        │               │ │             │ │             │
        └───────────────┘ └─────────────┘ └─────────────┘
```

## Component Overview

### Frontend Applications

#### 1. Mobile App (`clients/app/`)
- **Framework**: React Native 0.79 with Expo 53
- **Purpose**: Citizen-facing application for ticket reporting
- **Key Features**:
  - Camera integration for photo capture
  - GPS location services
  - User authentication with Firebase
  - Real-time ticket tracking
  - Push notifications

#### 2. Web Dashboard (`clients/web/`)
- **Framework**: React 19 with TypeScript and Vite 7
- **Purpose**: Administrative interface for city officials
- **Key Features**:
  - Interactive maps with Mapbox GL
  - ticket management and assignment
  - Analytics and reporting
  - User management
  - Real-time dashboard updates

#### 3. Documentation Site (`docs/`)
- **Framework**: VitePress 2.0
- **Purpose**: Comprehensive documentation and guides
- **Content**: API docs, user guides, development instructions

### Backend Services

#### API Server (`server/`)
- **Framework**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Key Features**:
  - RESTful API endpoints
  - JWT-based authentication
  - Role-based access control
  - File upload handling
  - Real-time WebSocket connections

## Data Flow Architecture

### 1. ticket Reporting Flow
```
Citizen Mobile App → Photo Capture → GPS Location → API Server → Database
                                                        ↓
Authority Web Dashboard ← Real-time Update ← ticket Created
```

### 2. ticket Assignment Flow
```
Admin Dashboard → Assignment Decision → API Server → Database Update
                                           ↓
Technician Mobile App ← Push Notification ← Assignment Created
```

### 3. ticket Resolution Flow
```
Technician → Update Status → API Server → Database → Real-time Update
                                             ↓
Citizen Mobile App ← Status Notification ← Update Processed
```

## Technology Stack

### Frontend Technologies

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Web Client | React | 19.1.1 | UI Framework |
| Web Client | TypeScript | 5.8.3 | Type Safety |
| Web Client | Vite | 7.1.2 | Build Tool |
| Web Client | Tailwind CSS | 4.1.12 | Styling |
| Mobile App | React Native | 0.79.6 | Mobile Framework |
| Mobile App | Expo | 53.0.22 | Development Platform |
| Mobile App | NativeWind | 4.1.23 | Mobile Styling |
| Documentation | VitePress | 2.0.0 | Documentation |

### Backend Technologies

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Server | Node.js | Latest | Runtime |
| Server | Express.js | 4.18.2 | Web Framework |
| Database | MongoDB | Latest | Primary Database |
| ODM | Mongoose | 8.18.0 | Database Modeling |
| Auth | JWT | 9.0.2 | Authentication |
| Security | bcrypt | 5.1.1 | Password Hashing |

### External Services

| Service | Purpose | Integration |
|---------|---------|-------------|
| Firebase | Authentication & Storage | Web & Mobile |
| Mapbox | Maps & Geolocation | Web Dashboard |
| Google AI | ticket Classification | Server API |

## Database Schema Design

### Core Entities

1. **Users** - Citizens, technicians, and administrators
2. **Tickets** - Reported civic tickets
3. **Authorities** - City departments and agencies
4. **ResolveRequests** - Technician resolution submissions

### Relationships

```
Users (1:N) ← Reports → Tickets (N:1) → Authority
   ↓                       ↓
Assignments            ResolveRequests
   ↓                       ↑
Technicians ────────────────┘
```

## Security Architecture

### Authentication Flow
1. **User Registration**: Email/password with Firebase Auth
2. **Token Generation**: JWT tokens with 24-hour expiry
3. **API Authorization**: Bearer token validation on protected routes
4. **Role Verification**: Route-level role checking (citizen/technician/admin)

### Data Security
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Mongoose schema validation
- **Rate Limiting**: Express rate limiter on API endpoints
- **CORS Configuration**: Controlled cross-origin requests
- **Helmet.js**: Security headers and protection

## Scalability Considerations

### Horizontal Scaling
- **Stateless API**: All servers can handle any request
- **Database Sharding**: MongoDB supports horizontal partitioning
- **CDN Integration**: Static assets served via CDN
- **Load Balancing**: Multiple server instances behind load balancer

### Performance Optimization
- **Database Indexing**: Optimized queries with compound indexes
- **Caching Strategy**: Redis for session and frequently accessed data
- **Image Optimization**: Compressed uploads with Firebase Storage
- **API Pagination**: Large datasets served in chunks

## Deployment Architecture

### Development Environment
```
Local Machine → Hot Reload → Browser/Emulator Testing
```

### Production Environment
```
GitHub → CI/CD Pipeline → Vercel (Frontend) + Cloud Provider (Backend)
```

### Infrastructure Components
- **Frontend Hosting**: Vercel for static site deployment
- **Backend Hosting**: Cloud provider with Node.js support
- **Database Hosting**: MongoDB Atlas for managed database
- **File Storage**: Firebase Storage for images
- **CDN**: Integrated CDN for global content delivery

## API Design Principles

### RESTful Architecture
- **Resource-based URLs**: `/api/tickets`, `/api/users`
- **HTTP Methods**: GET, POST, PUT, DELETE for CRUD operations
- **Status Codes**: Proper HTTP status code usage
- **JSON Format**: Consistent request/response format

### Error Handling
```javascript
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {...}
  }
}
```

### Rate Limiting
- **Per User**: 100 requests per 15 minutes
- **Per IP**: 1000 requests per 15 minutes
- **File Upload**: 10 uploads per hour per user

## Monitoring and Analytics

### Application Metrics
- **Response Times**: API endpoint performance tracking
- **Error Rates**: 4xx and 5xx error monitoring
- **User Activity**: Registration, login, and ticket reporting metrics
- **Database Performance**: Query execution times and connection health

### Business Metrics
- **ticket Volume**: Daily/weekly/monthly reported tickets
- **Resolution Times**: Average time from report to resolution
- **User Engagement**: Active users and feature usage
- **Geographic Distribution**: ticket hotspots and coverage areas

## Future Architecture Enhancements

### Planned Improvements
1. **Microservices**: Break down monolithic API into focused services
2. **Event-Driven Architecture**: Use message queues for async processing
3. **Kubernetes**: Container orchestration for better scaling
4. **GraphQL**: More efficient data fetching for mobile clients
5. **Real-time Features**: WebSocket implementation for live updates

### Integration Possibilities
- **IoT Sensors**: Automatic ticket detection from city sensors
- **GIS Systems**: Integration with existing city geographic systems
- **SMS/WhatsApp**: Alternative reporting channels
- **Payment Gateway**: For fee-based services

This architecture ensures Civix can handle the demands of a city-wide civic platform while remaining maintainable and scalable as requirements evolve.