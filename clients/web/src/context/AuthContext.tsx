import React, { createContext, useState, useEffect } from 'react';
import api, { setAuthToken } from '../services/api';

export type UserRole = 'authority' | 'technician' | 'citizen';

interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  specialization?: string;
  contact?: string;
  points?: number;
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
}

const getRolePermissions = (role: UserRole): string[] => {
  switch (role) {
    case 'authority':
      return ['manage_issues', 'assign_technicians', 'view_all', 'manage_technicians'];
    case 'technician':
      return ['view_assigned_issues', 'update_status', 'upload_proof'];
    case 'citizen':
      return ['create_issues', 'view_own_issues', 'vote_issues'];
    default:
      return [];
  }
};

const AuthContext = createContext<AuthContextType | null>(null);

export { AuthContext };

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for existing auth token on app load
    const token = localStorage.getItem('civix_auth_token');
    if (token) {
      // Set the token and try to get user profile
      setAuthToken(token);
      
      // For demo purposes, auto-login with authority user
      // In production, you would validate the token with the backend
      const defaultUser: User = {
        _id: 'auth-001',
        name: 'Municipal Authority',
        email: 'admin@authority.gov',
        role: 'authority',
        permissions: getRolePermissions('authority')
      };
      setUser(defaultUser);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.auth.login(email, password);
      
      const userData: User = {
        _id: response.user._id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role as UserRole,
        specialization: response.user.specialization,
        contact: response.user.contact,
        points: response.user.points,
        permissions: getRolePermissions(response.user.role as UserRole)
      };
      
      setUser(userData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    api.auth.logout();
    setUser(null);
  };

  const hasPermission = (permission: string) => {
    return user?.permissions.includes(permission) || false;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated: !!user,
      hasPermission 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use authentication context