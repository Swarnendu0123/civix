# Civix - Civic ticket Reporting Platform

Civix is a platform that enables citizens to quickly report civic tickets with photos and location data, while providing local governments with a real-time dashboard to track, assign, and resolve problems efficiently. The project consists of multiple components: a React web client for city administrators, a React Native/Expo mobile app for citizens, a Node.js backend server, and VitePress documentation.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Quick Start - Bootstrap All Components
Bootstrap the entire project by installing dependencies for all components:

```bash
# Install web client dependencies (takes ~45 seconds)
cd clients/web && npm install

# Install mobile app dependencies (takes ~60 seconds) 
cd ../app && npm install

# Install documentation dependencies (takes ~10 seconds)
cd ../../docs && npm install

# Server has minimal dependencies - no installation needed
```

### Web Client (React + Vite + TypeScript)
- **Location**: `clients/web/`
- **Technology**: React 19, Vite 7, TypeScript, ESLint
- **Build and run commands**:
  - `npm run build` -- **NEVER CANCEL**: Build takes ~3 seconds. Set timeout to 30+ seconds.
  - `npm run lint` -- Linting takes ~5 seconds
  - `npm run dev` -- Starts development server on http://localhost:5173/
  - `npm run preview` -- Preview production build

### Mobile App (React Native + Expo)
- **Location**: `clients/app/`
- **Technology**: React Native 0.79, Expo ~53, TypeScript, file-based routing
- **Build and run commands**:
  - `npm run start` or `npx expo start` -- Starts Expo development server
  - `npm run web` or `npx expo start --web` -- Runs on web at http://localhost:8081/
  - `npm run android` or `npx expo start --android` -- For Android development
  - `npm run ios` or `npx expo start --ios` -- For iOS development
  - `npm run lint` -- ESLint validation takes ~5 seconds

### Documentation Site (VitePress)
- **Location**: `docs/`
- **Technology**: VitePress 2.0, Vue-based documentation
- **Build and run commands**:
  - `npm run docs:build` -- **NEVER CANCEL**: Build takes ~5 seconds. Set timeout to 30+ seconds.
  - `npm run docs:dev` -- Starts dev server on http://localhost:5173/
  - `npm run docs:preview` -- Preview built documentation

### Server (Node.js - Minimal)
- **Location**: `server/`
- **Status**: Currently minimal implementation with empty index.js
- **No build or installation required** - server component is placeholder

## Validation

### Always Run These Validation Steps
Before making changes and after implementing features:

1. **Build all components** to ensure no compilation errors:
   ```bash
   cd clients/web && npm run build
   cd ../app && npm run lint  # No build script, lint validates code
   cd ../../docs && npm run docs:build
   ```

2. **Run all linters** to ensure code quality:
   ```bash
   cd clients/web && npm run lint
   cd ../app && npm run lint
   ```

### Manual Validation Scenarios
**CRITICAL**: Always manually test functionality after making changes:

#### Web Client Validation
1. Start dev server: `cd clients/web && npm run dev`
2. Navigate to http://localhost:5173/
3. **Test basic functionality**: Click the counter button and verify it increments
4. **Expected behavior**: Page displays "Vite + React" with functional counter

#### Mobile App Validation  
1. Start web version: `cd clients/app && npx expo start --web`
2. Navigate to http://localhost:8081/
3. **Test navigation**: Click between "Home" and "Explore" tabs
4. **Expected behavior**: Tab navigation works, shows welcome screen and feature list

#### Documentation Validation
1. Start dev server: `cd docs && npm run docs:dev`
2. Navigate to http://localhost:5173/
3. **Test navigation**: Click "Examples" link in navigation
4. **Expected behavior**: Clean VitePress documentation site with proper navigation

### Timing and Performance
- **NEVER CANCEL builds or long-running commands**
- **Web client**: npm install (45s), build (3s), dev startup (5s)
- **Mobile app**: npm install (60s), expo start (10-15s), web mode startup (5s)
- **Documentation**: npm install (10s), build (5s), dev startup (3s)
- **Always use timeouts of 60+ seconds for install commands, 30+ seconds for builds**

## Common Tasks

### Development Workflow
1. **Start development servers for active development**:
   ```bash
   # Terminal 1: Web client
   cd clients/web && npm run dev

   # Terminal 2: Mobile app  
   cd clients/app && npx expo start --web

   # Terminal 3: Documentation (if needed)
   cd docs && npm run docs:dev
   ```

2. **Before committing changes**:
   ```bash
   # Always run linting for both client applications
   cd clients/web && npm run lint
   cd ../app && npm run lint
   
   # Build to ensure no compilation errors
   cd clients/web && npm run build
   cd ../../docs && npm run docs:build
   ```

### Key Project Files and Locations

#### Repository Structure
```
├── clients/
│   ├── app/          # React Native/Expo mobile app
│   │   ├── app/      # File-based routing (Expo Router)
│   │   ├── components/
│   │   ├── package.json
│   │   └── app.json  # Expo configuration
│   └── web/          # React web client  
│       ├── src/
│       ├── package.json
│       └── vite.config.ts
├── server/           # Node.js backend (minimal)
│   ├── index.js
│   └── package.json
├── docs/             # VitePress documentation
│   ├── .vitepress/
│   ├── package.json
│   └── *.md files
└── README.md
```

#### Important Configuration Files
- `clients/web/vite.config.ts` - Vite configuration for web client
- `clients/app/app.json` - Expo app configuration  
- `clients/app/tsconfig.json` - TypeScript configuration for mobile
- `clients/web/tsconfig.json` - TypeScript configuration for web
- `clients/*/eslint.config.js` - ESLint configurations

### Troubleshooting

#### Common tickets and Solutions
- **Port conflicts**: Web client and docs both use port 5173 by default - run only one at a time
- **Mobile app won't start**: Ensure you're using `npx expo start --web` for web testing
- **Build failures**: Always check TypeScript errors first, then dependency tickets
- **Networking disabled in Expo**: This is normal in CI environments, app still functions

#### When Things Don't Work
1. **Clear node_modules and reinstall**: `rm -rf node_modules package-lock.json && npm install`
2. **Check for TypeScript errors**: Run `npx tsc --noEmit` in component directory
3. **Verify all dependencies are installed**: Ensure `npm install` completed without errors
4. **Check for port conflicts**: Only run one application per port at a time

## Project Context

### Purpose and Architecture
- **Citizens use the mobile app** to report civic tickets with photos and GPS location
- **City administrators use the web client** to track, assign, and resolve reported tickets
- **Backend server** will handle API requests and data storage (currently minimal)
- **Documentation site** provides project information and API documentation

### Development Standards  
- **TypeScript is used throughout** for type safety
- **ESLint is configured** for code quality enforcement
- **Modern React patterns** with functional components and hooks
- **Mobile-first approach** with responsive web design
- **File-based routing** in the mobile app using Expo Router

### Testing Notes
- **No test framework is currently configured** - add tests carefully if needed
- **Manual testing is required** for all functionality changes
- **Always test cross-component interactions** when making API or data structure changes
- **Server component requires development** before full system integration testing