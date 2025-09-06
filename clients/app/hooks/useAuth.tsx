import React, { createContext, useContext, useEffect, useState } from 'react';
import { setAuthToken } from '@/services/api';
import { firebaseAuth } from '@/services/firebase';

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
    const unsubscribe = firebaseAuth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        // User is logged in
        const userData = {
          _id: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email,
          role: 'citizen',
          points: 250 // Default points, would come from backend in real app
        };
        
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