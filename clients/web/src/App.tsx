import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import IssueManagement from './pages/IssueManagement';
import TechnicianManagement from './pages/TechnicianManagement';
import './App.css';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// App Component
const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="issues" element={<IssueManagement />} />
              <Route path="technicians" element={<TechnicianManagement />} />
              {/* Placeholder for Map route */}
              <Route 
                path="map" 
                element={
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900">Map View</h2>
                    <p className="mt-2 text-gray-500">Coming Soon - Map visualization of issues</p>
                  </div>
                } 
              />
            </Route>
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
