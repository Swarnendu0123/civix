# Vercel Deployment Guide

This document explains the Vercel deployment configuration for the Civix server.

## Key Changes for Serverless Compatibility

### 1. File Upload Handling
- **Local Environment**: Uses disk storage with files saved to `uploads/` directory
- **Serverless Environment**: Uses memory storage with base64 data URLs

### 2. Environment Detection
The server automatically detects if it's running in a serverless environment:
```javascript
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
```

### 3. Vercel Configuration (`vercel.json`)
```json
{
    "version": 2,
    "builds": [
        {
            "src": "index.js",
            "use": "@vercel/node",
            "config": {
                "includeFiles": ["config/**", "models/**", "services/**"]
            }
        }
    ],
    "routes": [
        {
            "src": "/(.*)",
            "dest": "/index.js",
            "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
                "Access-Control-Allow-Headers": "X-Requested-With, Content-Type, Accept, Origin, Authorization, X-Auth-Token",
                "Access-Control-Allow-Credentials": "true"
            }
        }
    ]
}
```

### 4. Image Handling in Serverless
- Images are converted to base64 data URLs in serverless environments
- This eliminates the need for file system operations
- For production, consider using external storage (AWS S3, Cloudinary, etc.)

### 5. Database Connection
- The server gracefully falls back to in-memory storage if MongoDB is unavailable
- Configure MongoDB connection string via environment variables for production

## Environment Variables
Set these environment variables in Vercel dashboard:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT token signing
- `GOOGLE_AI_API_KEY` - For intent recognition service

## Deployment
1. Push changes to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy automatically on push

## Testing
- Local: `npm start` or `node index.js`
- Serverless mode: `VERCEL=1 node index.js`