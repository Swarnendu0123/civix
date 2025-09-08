import React, { createContext, useState, useEffect } from 'react';
import api, { setAuthToken } from '../services/api';

export type UserRole = 'admin' | 'department_staff' | 'technician' | 'authority' | 'citizen';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
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
    case 'admin':
    case 'authority':
      return ['manage_issues', 'assign_technicians', 'view_all', 'manage_technicians', 'manage_users'];
    case 'department_staff':
      return ['view_department_issues', 'update_issues'];
    case 'technician':
      return ['view_assigned_issues', 'update_status', 'upload_proof'];
    case 'citizen':
      return ['create_issues', 'view_own_issues'];
    default:
      return [];
  }
};

const AuthContext = createContext<AuthContextType | null>(null);

export { AuthContext };

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in via stored token
    const checkStoredAuth = async () => {
      const token = localStorage.getItem('civix_auth_token');
      if (token) {
        setAuthToken(token);
        try {
          const profile = await api.user.getProfile();
          const userData: User = {
            id: profile._id,
            name: profile.name,
            email: profile.email,
            role: profile.role === 'authority' ? 'admin' : profile.role,
            permissions: getRolePermissions(profile.role === 'authority' ? 'admin' : profile.role)
          };
          setUser(userData);
        } catch (error) {
          console.error('Failed to restore session:', error);
          localStorage.removeItem('civix_auth_token');
          setAuthToken(null);
        }
      }
      setLoading(false);
    };

    checkStoredAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.auth.login(email, password);
      const userData: User = {
        id: response.user._id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role === 'authority' ? 'admin' : response.user.role,
        permissions: getRolePermissions(response.user.role === 'authority' ? 'admin' : response.user.role)
      };
      setUser(userData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      api.auth.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
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
      {loading ? (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

// Hook to use authentication context