import React, { createContext, useContext, useEffect, useState } from 'react';
import { setAuthToken } from '@/services/api';
import { firebaseAuth } from '@/services/firebase';
import api from '@/services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  loading: boolean;
  login: (user: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = firebaseAuth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // User is logged in
        const userData = {
          _id: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email,
          role: 'citizen',
          points: 250 // Default points, would come from backend in real app
        };
        
        // SYNC WITH BACKEND: Get user details from MongoDB if available
        try {
          // Try to get user profile from backend to get actual role and data
          const backendUser = await api.user.getProfile();
          if (backendUser) {
            // Merge Firebase user with backend data
            userData.role = backendUser.role || 'citizen';
            userData.points = backendUser.points || 0;
            userData.name = backendUser.name || userData.name;
          }
        } catch (error) {
          console.log('Could not fetch user profile from backend, using Firebase data');
          // If backend is unavailable, use Firebase data as fallback
        }
        
        setUser(userData);
        setIsAuthenticated(true);
        setAuthToken(firebaseUser.uid);
      } else {
        // User is logged out
        setUser(null);
        setIsAuthenticated(false);
        setAuthToken(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

    // Comment out Firebase auth for demo
    // const unsubscribe = firebaseAuth.onAuthStateChanged(async (firebaseUser) => {
    //   if (firebaseUser) {
    //     // User is logged in
    //     const userData = {
    //       _id: firebaseUser.uid,
    //       name: firebaseUser.displayName || 'User',
    //       email: firebaseUser.email,
    //       role: 'citizen',
    //       points: 250 // Default points, would come from backend in real app
    //     };
    //     
    //     // SYNC WITH BACKEND: Get user details from MongoDB if available
    //     try {
    //       // Try to get user profile from backend to get actual role and data
    //       const backendUser = await api.user.getProfile();
    //       if (backendUser) {
    //         // Merge Firebase user with backend data
    //         userData.role = backendUser.role || 'citizen';
    //         userData.points = backendUser.points || 0;
    //         userData.name = backendUser.name || userData.name;
    //       }
    //     } catch (error) {
    //       console.log('Could not fetch user profile from backend, using Firebase data');
    //       // If backend is unavailable, use Firebase data as fallback
    //     }
    //     
    //     setUser(userData);
    //     setIsAuthenticated(true);
    //     setAuthToken(firebaseUser.uid);
    //   } else {
    //     // User is logged out
    //     setUser(null);
    //     setIsAuthenticated(false);
    //     setAuthToken(null);
    //   }
    //   setLoading(false);
    // });

    // return unsubscribe;
  // }, []);

  const login = (userData: any) => {
    setUser(userData);
    setIsAuthenticated(true);
    setAuthToken(userData._id);
  };

  const logout = async () => {
    try {
      await firebaseAuth.signOut();
      setUser(null);
      setIsAuthenticated(false);
      setAuthToken(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};