# Introduction to Civix

Civix is a comprehensive civic ticket reporting platform designed to bridge the gap between citizens and local governments. Developed for Smart India Hackathon (SIH) 2025, this platform enables efficient reporting, tracking, and resolution of civic tickets through a modern, user-friendly interface.

## What is Civix?

Civix transforms how civic tickets are reported and managed by providing:

- **Citizen Mobile App**: A React Native application that allows citizens to quickly report tickets with photos, GPS location, and detailed descriptions
- **Administrative Web Dashboard**: A React-based web application for city administrators to manage tickets, track progress, and analyze data
- **Intelligent Assignment System**: Automated technician assignment based on expertise, location, and workload
- **Real-Time Tracking**: Live updates on ticket status and resolution progress

## Key Problems Solved

### 1. Inefficient ticket Reporting
- **Problem**: Traditional methods (phone calls, office visits) are time-consuming and inefficient
- **Solution**: Quick mobile reporting with photo evidence and automatic location detection

### 2. Poor ticket Tracking
- **Problem**: Citizens have no visibility into ticket status or resolution progress
- **Solution**: Real-time status updates and transparent tracking system

### 3. Suboptimal Resource Allocation
- **Problem**: Manual assignment leads to poor distribution of work and delayed responses
- **Solution**: Intelligent assignment algorithm considering multiple factors

### 4. Lack of Data Insights
- **Problem**: No analytics on ticket patterns, response times, or service quality
- **Solution**: Comprehensive dashboard with analytics and reporting

## Target Users

### Citizens
- Report civic tickets (potholes, streetlight failures, water problems, etc.)
- Track ticket status and resolution progress
- Vote on ticket priority and severity
- Receive notifications about updates

### City Administrators
- Monitor all reported tickets on a centralized dashboard
- Assign tickets to appropriate technicians
- Track performance metrics and analytics
- Manage user accounts and system settings

### Technicians
- Receive assigned tickets based on specialization
- Update ticket status and progress
- Submit resolution requests with photo evidence
- Manage personal workload and availability

## Core Features

### Mobile Application (React Native + Expo)
- **ticket Reporting**: Camera integration, GPS location, category selection
- **User Authentication**: Secure login/registration with Firebase
- **ticket Tracking**: View personal reported tickets and their status
- **Task Management**: For technicians to manage assigned work
- **Profile Management**: User settings and preferences

### Web Dashboard (React + TypeScript)
- **ticket Management**: Comprehensive view of all reported tickets
- **Geographic Visualization**: Interactive maps showing ticket distribution
- **Analytics Dashboard**: Performance metrics and trend analysis
- **User Management**: Manage citizens, technicians, and administrators
- **Assignment System**: Manual and automatic ticket assignment

### Backend Server (Node.js + MongoDB)
- **RESTful API**: Comprehensive API for all platform operations
- **Authentication**: JWT-based secure authentication
- **Database Management**: MongoDB with optimized schemas
- **File Upload**: Secure image upload and storage
- **Real-Time Features**: WebSocket support for live updates

## Technology Stack

### Frontend
- **Web Client**: React 19, TypeScript, Vite 7, Tailwind CSS
- **Mobile App**: React Native 0.79, Expo 53, NativeWind
- **State Management**: React Hooks, Context API
- **Maps Integration**: Mapbox GL JS

### Backend
- **Runtime**: Node.js with Express.js framework
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt password hashing
- **File Storage**: Firebase Storage integration
- **API Documentation**: Comprehensive REST API

### DevOps & Tools
- **Build Tools**: Vite, Expo CLI
- **Code Quality**: ESLint, TypeScript
- **Documentation**: VitePress
- **Version Control**: Git with GitHub
- **Deployment**: Vercel-ready configuration

## Platform Benefits

### For Citizens
- **Convenience**: Report tickets anytime, anywhere with just a smartphone
- **Transparency**: Full visibility into ticket status and resolution process
- **Engagement**: Active participation in civic improvement

### For Governments
- **Efficiency**: Streamlined ticket management and resolution workflow
- **Data-Driven Decisions**: Analytics for better resource allocation
- **Citizen Satisfaction**: Improved response times and service quality

### For Society
- **Accountability**: Transparent process builds trust in local government
- **Community Building**: Citizens actively participate in civic improvement
- **Quality of Life**: Faster resolution of civic tickets improves living standards

## Success Metrics

The platform tracks several key performance indicators:

- **Response Time**: Average time from ticket report to first response
- **Resolution Time**: Average time from report to ticket resolution
- **Citizen Satisfaction**: User ratings and feedback on service quality
- **System Adoption**: Number of registered users and active reports
- **Technician Efficiency**: Workload distribution and performance metrics

## Next Steps

Ready to get started with Civix? Continue to our [Getting Started Guide](./getting-started.md) to set up the platform, or explore the [Architecture Overview](./architecture.md) to understand the system design.

For developers interested in contributing, check out our [Development Setup](../development/setup.md) and [Contributing Guidelines](../development/contributing.md).