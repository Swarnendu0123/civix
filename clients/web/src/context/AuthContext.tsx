import React, { createContext, useState } from 'react';

export type UserRole = 'admin' | 'department_staff' | 'technician';

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
      return ['manage_issues', 'assign_technicians', 'view_all', 'manage_technicians'];
    case 'department_staff':
      return ['view_department_issues', 'update_issues'];
    case 'technician':
      return ['view_assigned_issues', 'update_status', 'upload_proof'];
    default:
      return [];
  }
};

const AuthContext = createContext<AuthContextType | null>(null);

export { AuthContext };

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Temporarily default to logged-in admin for demo
  const [user, setUser] = useState<User | null>({
    id: '1',
    name: 'Admin User',
    email: 'admin@civix.com',
    role: 'admin',
    permissions: getRolePermissions('admin')
  });

  const login = async (email: string, password: string) => {
    // Mock login - replace with actual API call
    console.log('Login attempt:', email, password);
    // Mock login - replace with actual API call
    const role: UserRole = email.includes('admin') ? 'admin' : 
                          email.includes('tech') ? 'technician' : 'department_staff';
    
    const mockUser: User = {
      id: '1',
      name: email.includes('admin') ? 'Admin User' : 
            email.includes('tech') ? 'Tech User' : 'Department Staff',
      email,
      role,
      department: role === 'department_staff' ? 'Water' : undefined,
      permissions: getRolePermissions(role)
    };
    setUser(mockUser);
  };

  const logout = () => {
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