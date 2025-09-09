# Installation Guide

This comprehensive installation guide covers everything you need to deploy Civix in various environments, from local development to production deployment.

## System Requirements

### Minimum Requirements
- **CPU**: 2 cores, 2.4 GHz
- **RAM**: 4 GB (8 GB recommended)
- **Storage**: 10 GB free space
- **Network**: Stable internet connection

### Recommended Requirements
- **CPU**: 4+ cores, 3.0+ GHz
- **RAM**: 8+ GB
- **Storage**: 50+ GB SSD
- **Network**: High-speed internet (1+ Mbps)

## Software Dependencies

### Required Software

#### Node.js & npm
```bash
# Install Node.js (v18 or higher)
# Download from: https://nodejs.org/

# Verify installation
node --version  # Should be v18+
npm --version   # Should be v8+
```

#### Git
```bash
# Install Git
# Download from: https://git-scm.com/

# Verify installation
git --version
```

### Optional but Recommended

#### MongoDB
```bash
# Install MongoDB Community Edition
# Download from: https://www.mongodb.com/try/download/community

# Start MongoDB service
# macOS/Linux:
sudo systemctl start mongod

# Windows:
net start MongoDB
```

#### Visual Studio Code
Recommended IDE with useful extensions:
- ES7+ React/Redux/React-Native snippets
- TypeScript Hero
- Prettier
- ESLint
- MongoDB for VS Code

## Environment Setup

### 1. Clone and Navigate
```bash
git clone https://github.com/swrno/civix.git
cd civix
```

### 2. Install Dependencies

#### Method A: All Components (Recommended)
```bash
# Install all dependencies in sequence
./scripts/install-all.sh  # If script exists, or manual:

# Documentation (fastest)
cd docs && npm install && cd ..

# Web client
cd clients/web && npm install && cd ../..

# Mobile app (slowest)
cd clients/app && npm install && cd ../..

# Server (minimal dependencies)
cd server && npm install && cd ..
```

#### Method B: Individual Components
Choose this if you only need specific components:

```bash
# For documentation only
cd docs && npm install

# For web development only  
cd clients/web && npm install

# For mobile development only
cd clients/app && npm install

# For backend development only
cd server && npm install
```

### 3. Environment Configuration

#### Server Environment (.env)
Create `server/.env`:
```bash
cd server
cp .env.example .env  # If exists, or create manually
```

Edit `server/.env`:
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/civix
DB_NAME=civix

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3000
NODE_ENV=development

# External APIs (Optional)
GOOGLE_AI_API_KEY=your-google-ai-api-key
MAPBOX_ACCESS_TOKEN=your-mapbox-token

# Security
BCRYPT_ROUNDS=10
MAX_FILE_SIZE=10485760  # 10MB

# Rate Limiting
RATE_LIMIT_WINDOW=900000  # 15 minutes
RATE_LIMIT_MAX=100        # requests per window
```

#### Firebase Configuration
For authentication and file storage, configure Firebase:

1. **Create Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create new project
   - Enable Authentication (Email/Password)
   - Enable Storage

2. **Get Configuration**:
   - Project Settings → General → Your apps
   - Copy the config object

3. **Update Web Client** (`clients/web/src/config.ts`):
```typescript
export const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

4. **Update Mobile App** (`clients/app/services/firebase.ts`):
```typescript
const firebaseConfig = {
  // Same configuration as above
};
```

## Development Environment

### Quick Start Development
Run all components simultaneously:

```bash
# Terminal 1: Backend
cd server && npm run dev

# Terminal 2: Web Client  
cd clients/web && npm run dev

# Terminal 3: Mobile App (Web Mode)
cd clients/app && npx expo start --web

# Terminal 4: Documentation
cd docs && npm run docs:dev
```

### Individual Component Development

#### Backend Server
```bash
cd server

# Development with auto-reload
npm run dev

# Production mode
npm start

# Run tests
npm test

# Seed database with sample data
npm run seed
```

#### Web Client
```bash
cd clients/web

# Development server
npm run dev           # http://localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Fix linting issues
npm run lint -- --fix
```

#### Mobile App
```bash
cd clients/app

# Start Expo development server
npx expo start

# Web development
npx expo start --web    # http://localhost:8081

# Android development
npx expo start --android

# iOS development
npx expo start --ios

# Run linter
npm run lint
```

#### Documentation
```bash
cd docs

# Development server
npm run docs:dev      # http://localhost:5173

# Build documentation
npm run docs:build

# Preview built docs
npm run docs:preview
```

## Database Setup

### MongoDB Installation

#### macOS (using Homebrew)
```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb/brew/mongodb-community
```

#### Ubuntu/Debian
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### Windows
1. Download MongoDB from [official website](https://www.mongodb.com/try/download/community)
2. Run the installer
3. Choose "Complete" installation
4. Install MongoDB as a Service
5. Start the MongoDB service

### Database Configuration

#### Create Database and User
```bash
# Connect to MongoDB
mongosh

# Create database
use civix

# Create user with appropriate permissions
db.createUser({
  user: "civix_user",
  pwd: "secure_password",
  roles: [
    { role: "readWrite", db: "civix" }
  ]
})
```

#### Seed Database with Sample Data
```bash
cd server
npm run seed
```

This creates:
- Sample users (citizens, technicians, administrators)
- Sample civic issues
- Sample authorities and departments
- Geographic test data

### Database Fallback
If MongoDB is not available, the system automatically falls back to in-memory storage with sample data, allowing you to test all features without database setup.

## Production Deployment

### Backend Deployment

#### Using Vercel
```bash
cd server

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Using DigitalOcean/AWS/GCP
1. Create a new server instance
2. Install Node.js and MongoDB
3. Clone repository and install dependencies
4. Configure environment variables
5. Use PM2 for process management:

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start index.js --name civix-api

# Save PM2 configuration
pm2 save
pm2 startup
```

### Frontend Deployment

#### Web Client (Vercel)
```bash
cd clients/web

# Build application
npm run build

# Deploy to Vercel
vercel --prod
```

#### Mobile App Deployment

##### Build for Production
```bash
cd clients/app

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios

# Build for both platforms
eas build --platform all
```

##### App Store Deployment
1. Configure app.json with store details
2. Create app store developer accounts
3. Use EAS Submit for store submission:

```bash
# Submit to Google Play Store
eas submit --platform android

# Submit to Apple App Store
eas submit --platform ios
```

### Documentation Deployment

#### Using Vercel
```bash
cd docs

# Build documentation
npm run docs:build

# Deploy
vercel --prod
```

#### Using GitHub Pages
```bash
# Configure .vitepress/config.mts
export default defineConfig({
  base: '/civix/',  # Repository name
  // ... other config
})

# Build and deploy
npm run docs:build
npm run docs:deploy  # If script exists
```

## Environment-Specific Configuration

### Development
```env
NODE_ENV=development
DEBUG=true
LOG_LEVEL=debug
MONGODB_URI=mongodb://localhost:27017/civix_dev
```

### Testing
```env
NODE_ENV=test
MONGODB_URI=mongodb://localhost:27017/civix_test
JWT_SECRET=test-secret-key
```

### Production
```env
NODE_ENV=production
DEBUG=false
LOG_LEVEL=info
MONGODB_URI=mongodb://your-production-db/civix
JWT_SECRET=your-super-secure-production-secret
```

## Performance Optimization

### Database Indexing
```javascript
// The following indexes are automatically created
db.users.createIndex({ email: 1 }, { unique: true })
db.tickets.createIndex({ "location.coordinates": "2dsphere" })
db.tickets.createIndex({ status: 1, created_at: -1 })
```

### Caching Strategy
```javascript
// Redis configuration (optional)
REDIS_URL=redis://localhost:6379
REDIS_TTL=3600  // 1 hour
```

### CDN Configuration
For production, configure CDN for static assets:
- Images: Firebase Storage with CDN
- CSS/JS: Vercel Edge Network
- Documentation: GitHub Pages CDN

## Security Checklist

### Pre-Production Security
- [ ] Change all default passwords and secrets
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure firewall rules
- [ ] Set up rate limiting
- [ ] Enable security headers
- [ ] Validate all environment variables
- [ ] Review database permissions
- [ ] Test authentication flows
- [ ] Verify file upload restrictions

### Production Security
```bash
# Generate secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Use strong database passwords
# Enable MongoDB authentication
# Configure reverse proxy (nginx/Apache)
# Set up monitoring and logging
```

## Monitoring and Logging

### Application Monitoring
```javascript
// PM2 monitoring
pm2 monit

// Log management
pm2 logs civix-api

// Performance monitoring
pm2 install pm2-server-monit
```

### Database Monitoring
```bash
# MongoDB monitoring
mongostat
mongotop

# Database backup
mongodump --db civix --out /backup/$(date +%Y%m%d)
```

## Troubleshooting

### Common Installation Issues

#### Node.js Version Mismatch
```bash
# Use Node Version Manager
nvm install 18
nvm use 18
```

#### Permission Errors
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
```

#### Port Conflicts
```bash
# Kill processes on specific ports
npx kill-port 3000 5173 8081
```

#### MongoDB Connection Issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod
```

### Build Errors

#### TypeScript Errors
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache
npx tsc --build --clean
```

#### Expo/React Native Issues
```bash
# Clear Expo cache
npx expo install --fix
rm -rf node_modules
npm install
```

### Getting Support

- **GitHub Issues**: [Report bugs](https://github.com/swrno/civix/issues)
- **Documentation**: Browse this comprehensive guide
- **Community**: Join discussions on GitHub
- **Email**: Contact the development team

This installation guide ensures you can get Civix running in any environment, from local development to production deployment.