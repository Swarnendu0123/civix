# Quick Start Guide

Get up and running with Civix in under 10 minutes! This guide will help you set up the entire platform for development or testing.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download here](https://git-scm.com/)
- **MongoDB** (optional - fallback storage available) - [Download here](https://www.mongodb.com/try/download/community)

For mobile development:
- **Android Studio** (for Android) - [Download here](https://developer.android.com/studio)
- **Xcode** (for iOS, macOS only) - Available in Mac App Store

## 1. Clone the Repository

```bash
git clone https://github.com/swrno/civix.git
cd civix
```

## 2. Bootstrap All Components

Install dependencies for all components in the correct order:

```bash
# Install documentation dependencies (10 seconds)
cd docs && npm install && cd ..

# Install web client dependencies (45 seconds)
cd clients/web && npm install && cd ../..

# Install mobile app dependencies (60 seconds)
cd clients/app && npm install && cd ../..

# Server dependencies are minimal - already included
```

## 3. Environment Configuration

### Backend Configuration
Create environment file for the server:

```bash
cd server
cp .env.example .env  # If example exists, or create new
```

Edit `.env` with your configuration:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/civix

# JWT
JWT_SECRET=your-super-secret-jwt-key-here

# Google AI (optional)
GOOGLE_AI_API_KEY=your-google-ai-key

# Server
PORT=3000
NODE_ENV=development
```

### Firebase Configuration (Optional)
For full authentication features, configure Firebase:

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication and Storage
3. Get your configuration and update:
   - `clients/web/src/config.ts`
   - `clients/app/services/firebase.ts`

## 4. Start Development Servers

Open 4 terminal windows/tabs and run each component:

### Terminal 1: Backend Server
```bash
cd server
npm start
# Server runs on http://localhost:3000
```

### Terminal 2: Web Dashboard
```bash
cd clients/web
npm run dev
# Dashboard runs on http://localhost:5173
```

### Terminal 3: Mobile App (Web Mode)
```bash
cd clients/app
npx expo start --web
# Mobile app runs on http://localhost:8081
```

### Terminal 4: Documentation
```bash
cd docs
npm run docs:dev
# Documentation runs on http://localhost:5173 (different port auto-assigned)
```

## 5. Verify Installation

### Test Backend API
```bash
curl http://localhost:3000/api/health
# Should return: {"status":"ok","timestamp":"..."}
```

### Test Web Dashboard
1. Open http://localhost:5173 in your browser
2. You should see the Civix admin dashboard
3. Test login functionality (if Firebase is configured)

### Test Mobile App
1. Open http://localhost:8081 in your browser
2. You should see the mobile app interface
3. Navigate through tabs: Home, Map, Raise Issue, etc.

### Test Documentation
1. Open the documentation URL (check terminal output)
2. Browse through the comprehensive documentation
3. Test search functionality

## 6. Quick Feature Test

### Report an Issue (Mobile App)
1. Go to the "Raise Issue" tab
2. Fill in issue details
3. Add a photo (if camera permissions available)
4. Submit the issue

### View Issues (Web Dashboard)
1. Navigate to the issues section
2. See the reported issue appear
3. Test assignment to a technician

## Build and Production Testing

### Build All Components
Test that everything builds correctly for production:

```bash
# Build web client
cd clients/web && npm run build

# Lint mobile app (no build needed for Expo)
cd ../app && npm run lint

# Build documentation
cd ../../docs && npm run docs:build
```

All builds should complete without errors.

## What You Get Out of the Box

### 🚀 Fully Functional Platform
- **Backend API**: Complete REST API with authentication
- **Admin Dashboard**: React-based web interface for managing issues
- **Mobile App**: React Native app for citizens to report issues
- **Documentation**: This comprehensive documentation site

### 🗄️ Database Ready
- **MongoDB Schemas**: User, Ticket, Authority, ResolveRequest models
- **Sample Data**: Automatic fallback data for testing without MongoDB
- **Indexing**: Optimized database indexes for performance

### 🔐 Security Features
- **Authentication**: JWT-based auth with role management
- **Password Security**: bcrypt hashing
- **API Security**: Rate limiting, CORS, Helmet.js protection
- **Input Validation**: Comprehensive data validation

### 📱 Modern UI/UX
- **Responsive Design**: Works on all device sizes
- **Interactive Maps**: Mapbox integration for geographic data
- **Real-time Updates**: Live status updates across components
- **Accessibility**: Following modern accessibility standards

## Next Steps

Now that you have Civix running locally, here are some suggested next steps:

### For Developers
1. **Explore the Codebase**: Check out [Component Overview](../components/overview.md)
2. **Understand the API**: Review [API Documentation](../api/overview.md)
3. **Development Workflow**: Read [Development Setup](../development/setup.md)

### For Administrators
1. **User Management**: Learn about [Administrator Guide](../user-guides/administrators.md)
2. **Analytics**: Understand the dashboard analytics features
3. **Configuration**: Customize the platform for your city

### For Citizens
1. **Issue Reporting**: Check out [Citizen Guide](../user-guides/citizens.md)
2. **Mobile App Features**: Explore all available features
3. **Tracking Issues**: Learn how to track your reported issues

## Troubleshooting

### Common Issues

#### Port Conflicts
If you get port conflict errors:
```bash
# Kill processes on conflicting ports
npx kill-port 3000 5173 8081
```

#### Module Not Found Errors
```bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Expo/React Native Issues
```bash
# Clear Expo cache
npx expo install --fix
npx expo start --clear
```

#### MongoDB Connection Issues
The system automatically falls back to in-memory storage if MongoDB is unavailable, so you can still test all features.

### Getting Help

- **Issues**: Report bugs on [GitHub Issues](https://github.com/swrno/civix/issues)
- **Discussions**: Join discussions on [GitHub Discussions](https://github.com/swrno/civix/discussions)
- **Documentation**: Browse this comprehensive documentation
- **Code Examples**: Check the demo.html file for feature examples

## Performance Notes

### Build Times
- **Web Client**: ~3 seconds
- **Documentation**: ~5 seconds
- **Mobile App**: No build needed for development (Expo handles it)

### Install Times
- **Documentation**: ~10 seconds
- **Web Client**: ~45 seconds
- **Mobile App**: ~60 seconds

### Memory Usage
- **Development**: ~500MB RAM total for all services
- **Production**: Significantly lower memory footprint

Congratulations! You now have a fully functional civic issue reporting platform running locally. The platform is ready for customization, development, or deployment to production environments.