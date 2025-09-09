# Development Setup

This guide covers setting up a complete development environment for contributing to Civix. Whether you're fixing bugs, adding features, or improving documentation, this guide will get you up and running quickly.

## Prerequisites

### Required Software
- **Node.js** v18+ and npm v8+
- **Git** for version control
- **Code Editor** (VS Code recommended)
- **MongoDB** (optional - fallback storage available)

### Recommended Tools
- **MongoDB Compass** - Database management GUI
- **Postman** - API testing and development
- **React Developer Tools** - Browser extension for React debugging
- **Expo Go** - Mobile app for testing React Native development

## Repository Setup

### Clone and Install
```bash
# Clone the repository
git clone https://github.com/swrno/civix.git
cd civix

# Install dependencies for all components
npm run install:all  # If available, or install manually:

# Documentation
cd docs && npm install && cd ..

# Web client
cd clients/web && npm install && cd ../..

# Mobile app  
cd clients/app && npm install && cd ../..

# Server
cd server && npm install && cd ..
```

### Environment Configuration

#### Server Environment
Create `server/.env`:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/civix_dev
NODE_ENV=development
PORT=3000

# Authentication
JWT_SECRET=development_secret_key_change_in_production
JWT_EXPIRES_IN=24h

# External APIs (optional for development)
GOOGLE_AI_API_KEY=your_development_key
MAPBOX_ACCESS_TOKEN=your_mapbox_token

# Development settings
DEBUG=true
LOG_LEVEL=debug
```

#### Firebase Configuration (Optional)
For full authentication testing:

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication and Storage
3. Copy config to:
   - `clients/web/src/config.ts`
   - `clients/app/services/firebase.ts`

## Development Workflow

### Starting Development Servers

#### Option 1: All Components (4 terminals)
```bash
# Terminal 1: Backend API
cd server && npm run dev

# Terminal 2: Web Dashboard
cd clients/web && npm run dev

# Terminal 3: Mobile App (Web mode)
cd clients/app && npx expo start --web

# Terminal 4: Documentation
cd docs && npm run docs:dev
```

#### Option 2: Focused Development
Choose based on what you're working on:

```bash
# Backend development only
cd server && npm run dev

# Frontend web development
cd clients/web && npm run dev

# Mobile app development
cd clients/app && npx expo start

# Documentation updates
cd docs && npm run docs:dev
```

### Development URLs
- **Backend API**: http://localhost:3000
- **Web Dashboard**: http://localhost:5173
- **Mobile App (Web)**: http://localhost:8081
- **Documentation**: http://localhost:5173 (different port auto-assigned)

## Code Quality and Standards

### Linting and Formatting

#### Run Linters
```bash
# Web client
cd clients/web && npm run lint

# Mobile app
cd clients/app && npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

#### TypeScript Checking
```bash
# Type checking without emitting files
cd clients/web && npx tsc --noEmit
cd clients/app && npx tsc --noEmit
```

### Building for Production

#### Build All Components
```bash
# Web client
cd clients/web && npm run build

# Documentation
cd docs && npm run docs:build

# Mobile app (Expo handles builds)
cd clients/app && npm run lint  # Validate code quality
```

## Testing

### API Testing

#### Using cURL
```bash
# Health check
curl http://localhost:3000/api/health

# Register test user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com", 
    "password": "testpassword123",
    "role": "citizen"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "testpassword123"}'
```

#### Using Postman
1. Import the Civix collection from `docs/assets/` (if available)
2. Set environment variables for base URL and auth token
3. Test all API endpoints systematically

### Frontend Testing

#### Manual Testing Workflow
1. **Web Dashboard**:
   - Register/login functionality
   - Issue management interface
   - Map visualization
   - Analytics dashboard

2. **Mobile App**:
   - Tab navigation
   - Issue reporting flow
   - Camera integration
   - Profile management

### Database Testing

#### With MongoDB
```bash
# Start MongoDB
mongod

# Connect with Mongo shell
mongosh civix_dev

# View collections
show collections

# Sample data queries
db.users.find().limit(5)
db.tickets.find({status: "open"}).limit(5)
```

#### Without MongoDB (Fallback)
The system automatically creates in-memory sample data for testing when MongoDB is unavailable.

## Debugging

### Backend Debugging

#### Console Logging
```javascript
// Enhanced logging in development
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', debugData);
}
```

#### Node.js Debugger
```bash
# Start server with debugger
cd server && node --inspect index.js

# Connect Chrome DevTools
# Go to chrome://inspect in Chrome browser
```

### Frontend Debugging

#### React Developer Tools
1. Install browser extension
2. Open browser developer tools
3. Use React tab to inspect component state and props

#### Network Debugging
1. Open browser developer tools
2. Check Network tab for API calls
3. Verify request/response data

#### Mobile App Debugging
```bash
# Start with debugging enabled
cd clients/app && npx expo start --dev-client

# View logs
npx expo logs
```

## Git Workflow

### Branch Strategy
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add new feature description"

# Push and create pull request
git push origin feature/your-feature-name
```

### Commit Convention
Follow conventional commit format:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test additions/changes
- `chore:` - Build/tooling changes

## Performance Optimization

### Development Performance

#### Hot Reload and Fast Refresh
- **Web client**: Vite provides instant HMR
- **Mobile app**: Expo Fast Refresh for React Native
- **Documentation**: VitePress hot reload

#### Build Optimization
```bash
# Analyze bundle size (web client)
cd clients/web && npm run build -- --analyze

# Check for unused dependencies
npx depcheck

# Clean node_modules if needed
rm -rf node_modules package-lock.json && npm install
```

### Database Performance

#### Index Monitoring
```javascript
// Check index usage
db.tickets.getIndexes()
db.tickets.explain("executionStats").find({status: "open"})
```

#### Query Optimization
```javascript
// Use proper indexes for queries
db.tickets.find({status: "open", issue_category: "Electric"})
  .hint({status: 1, issue_category: 1})
```

## VSCode Setup

### Recommended Extensions
```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss", 
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json",
    "mongodb.mongodb-vscode"
  ]
}
```

### Workspace Settings
Create `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

### Debug Configuration
Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/server/index.js",
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

## Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Kill processes on common ports
npx kill-port 3000 5173 8081

# Find process using specific port
lsof -ti:3000 | xargs kill -9
```

#### Module Resolution Errors
```bash
# Clear all node_modules
find . -name "node_modules" -type d -exec rm -rf {} +

# Reinstall all dependencies
npm run install:all
```

#### TypeScript Errors
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache

# Rebuild TypeScript projects
npx tsc --build --clean
npx tsc --build
```

#### Expo/React Native Issues
```bash
# Clear Expo cache
npx expo install --fix
npx expo start --clear

# Reset Metro bundler cache
npx expo start --reset-cache
```

### Database Issues

#### MongoDB Connection
```bash
# Check MongoDB status
brew services list | grep mongodb  # macOS
sudo systemctl status mongod       # Linux

# Restart MongoDB
brew services restart mongodb-community  # macOS
sudo systemctl restart mongod            # Linux
```

#### Database Reset
```bash
# Drop development database
mongosh civix_dev --eval "db.dropDatabase()"

# Reseed with sample data
cd server && npm run seed
```

## Contributing Guidelines

### Before Submitting PRs
1. **Run all linters** and fix issues
2. **Test affected functionality** manually
3. **Update documentation** if needed
4. **Write descriptive** commit messages
5. **Keep PRs focused** on single features/fixes

### Code Review Process
1. **Self-review** your changes before submitting
2. **Address feedback** promptly and constructively
3. **Test reviewer suggestions** before implementing
4. **Update PR description** if scope changes

### Documentation Updates
- **Update relevant docs** when adding features
- **Include code examples** for new APIs
- **Add screenshots** for UI changes
- **Update API documentation** for backend changes

This development setup ensures you can contribute effectively to the Civix platform while maintaining code quality and consistency.