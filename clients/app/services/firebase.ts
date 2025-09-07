// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { Platform } from 'react-native';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || ""
};

// Check if Firebase is configured
const isFirebaseConfigured = firebaseConfig.apiKey && firebaseConfig.projectId;

let app: any = null;
let auth: any = null;

if (isFirebaseConfigured) {
  try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    
    // Initialize Firebase Auth
    auth = getAuth(app);
    
    // Set up persistence for web
    if (Platform.OS === 'web') {
      setPersistence(auth, browserLocalPersistence);
    } else {
      // For React Native, we'll use AsyncStorage with dynamic import
      import('@react-native-async-storage/async-storage').then((AsyncStorage) => {
        import('firebase/auth').then(({ getReactNativePersistence, initializeAuth }) => {
          try {
            initializeAuth(app, {
              persistence: getReactNativePersistence(AsyncStorage.default)
            });
          } catch (error: any) {
            // Auth already initialized, which is fine
            console.log('Auth already initialized');
          }
        });
      });
    }
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
  }
}

// Firebase authentication service
export const firebaseAuth = {
  async signIn(email: string, password: string) {
    if (!isFirebaseConfigured || !auth) {
      // Fallback mode - simulate successful auth for demo
      console.log('Firebase not configured, using demo mode');
      return {
        user: {
          uid: 'demo-user-' + Date.now(),
          email: email,
          displayName: email.split('@')[0],
        },
        success: true
      };
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return {
        user: userCredential.user,
        success: true
      };
    } catch (error: any) {
      return {
        user: null,
        success: false,
        error: error.message
      };
    }
  },

  async signUp(email: string, password: string, name: string) {
    if (!isFirebaseConfigured || !auth) {
      // Fallback mode - simulate successful auth for demo
      console.log('Firebase not configured, using demo mode');
      return {
        user: {
          uid: 'demo-user-' + Date.now(),
          email: email,
          displayName: name,
        },
        success: true
      };
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's display name
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: name
        });
      }
      
      return {
        user: userCredential.user,
        success: true
      };
    } catch (error: any) {
      return {
        user: null,
        success: false,
        error: error.message
      };
    }
  },

  async signOut() {
    if (!isFirebaseConfigured || !auth) {
      // Fallback mode
      console.log('Firebase not configured, using demo mode');
      return { success: true };
    }

    try {
      await signOut(auth);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  async updateUserProfile(updates: { displayName?: string; photoURL?: string }) {
    if (!isFirebaseConfigured || !auth) {
      // Fallback mode
      console.log('Firebase not configured, using demo mode');
      return { success: true };
    }

    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, updates);
        return { success: true };
      }
      return { success: false, error: 'No user logged in' };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  getCurrentUser() {
    if (!isFirebaseConfigured || !auth) {
      return null;
    }
    return auth.currentUser;
  },

  onAuthStateChanged(callback: (user: any) => void) {
    if (!isFirebaseConfigured || !auth) {
      // For demo mode, don't set up listener
      return () => {};
    }
    return auth.onAuthStateChanged(callback);
  }
};

export { auth };
export default firebaseAuth;