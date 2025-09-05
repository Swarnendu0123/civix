# Firebase Authentication Setup

This web application now uses Firebase Authentication for admin login. Follow these steps to configure Firebase:

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Authentication service
4. Go to Authentication > Sign-in method
5. Enable "Email/Password" authentication method

## 2. Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and select "Web app" (</>) 
4. Register your app and copy the configuration object

## 3. Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Firebase configuration in `.env`:
   ```
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

## 4. Create Admin Users

1. Go to Firebase Console > Authentication > Users
2. Click "Add user" to create admin accounts
3. Use email/password authentication

## 5. Test Authentication

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:5173/`
3. You should see the login page
4. Use the email/password of users created in Firebase Console

## Security Notes

- Never commit your `.env` file to version control
- The `.env.example` file shows the required variables without actual values
- All authenticated users are currently treated as admins
- Consider implementing role-based authentication for production use

## Route Protection

All routes except `/login` are protected and require authentication:
- `/dashboard` - Admin dashboard
- `/issues` - Issue management
- `/technicians` - Technician management
- `/map` - Map view (placeholder)

Users are automatically redirected to `/login` if not authenticated.