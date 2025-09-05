import React, { createContext, useContext, useEffect, useState } from 'react';
import { setAuthToken } from '@/services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  login: (user: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Auto-login with a default user for demo purposes
    // In a real app, you would check for stored credentials
    const defaultUser = {
      _id: 'user-001',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'citizen',
      points: 250
    };
    
    // Set the auth token to the user ID for API calls
    setAuthToken(defaultUser._id);
    setUser(defaultUser);
    setIsAuthenticated(true);
  }, []);

  const login = (userData: any) => {
    setUser(userData);
    setIsAuthenticated(true);
    setAuthToken(userData._id);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
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