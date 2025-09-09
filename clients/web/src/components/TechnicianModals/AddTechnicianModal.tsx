import React, { useState, useEffect } from 'react';
import { FiX, FiUser, FiPhone, FiTool, FiArrowLeft } from 'react-icons/fi';
import api from '../../services/api';
import type { Technician } from '../../types';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  contact?: string;
}

interface AddTechnicianModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (technician: Omit<Technician, 'id' | 'openTickets' | 'totalResolved' | 'rating'>) => void;
}

const AddTechnicianModal: React.FC<AddTechnicianModalProps> = ({ isOpen, onClose, onAdd }) => {
  // State management
  const [step, setStep] = useState<'select-user' | 'technician-details'>('select-user');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form data for technician details
  const [formData, setFormData] = useState({
    specialization: '',
    dept: '',
    contact: '',
    avgResolutionTime: '2-3 days',
    status: 'active' as const
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch non-technician users when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchNonTechnicianUsers();
    }
  }, [isOpen]);

  const fetchNonTechnicianUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.admin.getUsers({ role: 'citizen' });
      setUsers(response.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset modal state when closed
  useEffect(() => {
    if (!isOpen) {
      setStep('select-user');
      setSelectedUser(null);
      setFormData({
        specialization: '',
        dept: '',
        contact: '',
        avgResolutionTime: '2-3 days',
        status: 'active'
      });
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateTechnicianDetails = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.specialization.trim()) {
      newErrors.specialization = 'Specialization is required';
    }
    
    if (!formData.dept.trim()) {
      newErrors.dept = 'Department is required';
    }
    
    if (!formData.contact.trim()) {
      newErrors.contact = 'Contact is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    // Pre-fill contact if available
    setFormData(prev => ({
      ...prev,
      contact: user.contact || ''
    }));
    setStep('technician-details');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) return;
    
    if (validateTechnicianDetails()) {
      try {
        // Promote user to technician via API
        const updatedUser = await api.admin.promoteUserToTechnician(selectedUser._id, {
          specialization: formData.specialization,
          dept: formData.dept,
          contact: formData.contact
        });
        
        // Transform for UI (use the actual updated user data)
        const uiTechnician = {
          name: updatedUser.name,
          contact: updatedUser.contact,
          specialization: updatedUser.specialization,
          avgResolutionTime: updatedUser.avgResolutionTime,
          status: updatedUser.status,
          openTickets: updatedUser.openTickets,
          totalResolved: updatedUser.totalResolved,
          rating: updatedUser.rating
        };
        
        onAdd(uiTechnician);
        
        // Reset and close
        setStep('select-user');
        setSelectedUser(null);
        setFormData({
          specialization: '',
          dept: '',
          contact: '',
          avgResolutionTime: '2-3 days',
          status: 'active'
        });
        setErrors({});
        onClose();
      } catch (error) {
        console.error('Error promoting user to technician:', error);
        setError(error instanceof Error ? error.message : 'Failed to create technician. Please try again.');
      }
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBack = () => {
    setStep('select-user');
    setSelectedUser(null);
    setErrors({});
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                {step === 'technician-details' && (
                  <button
                    onClick={handleBack}
                    className="mr-3 p-2 rounded-md hover:bg-gray-100"
                  >
                    <FiArrowLeft className="h-5 w-5 text-gray-600" />
                  </button>
                )}
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                  <FiUser className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {step === 'select-user' ? 'Select User to Add as Technician' : 'Add Technician Details'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {step === 'select-user' 
                      ? 'Choose a registered user who is not yet a technician' 
                      : `Adding ${selectedUser?.name} as a technician`}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Step 1: User Selection */}
          {step === 'select-user' && (
            <div className="px-4 pb-4 sm:px-6 sm:pb-6">
              <div className="space-y-4">
                <div className="text-sm text-gray-600 mb-4">
                  Select a user from the list below to promote them to a technician role:
                </div>
                
                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No eligible users found. All users are already technicians or authorities.</p>
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                    {users.map((user) => (
                      <div
                        key={user._id}
                        onClick={() => handleUserSelect(user)}
                        className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <FiUser className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            {user.contact && (
                              <p className="text-sm text-gray-400">{user.contact}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {user.role}
                          </span>
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            Select →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Technician Details Form */}
          {step === 'technician-details' && selectedUser && (
            <form onSubmit={handleSubmit}>
              <div className="px-4 pb-4 sm:px-6 sm:pb-6">
                <div className="space-y-4">
                  {/* Selected User Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center">
                        <FiUser className="h-5 w-5 text-blue-700" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-900">Selected User: {selectedUser.name}</p>
                        <p className="text-sm text-blue-700">{selectedUser.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Specialization */}
                  <div>
                    <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
                      <FiTool className="inline h-4 w-4 mr-1" />
                      Specialization *
                    </label>
                    <select
                      id="specialization"
                      value={formData.specialization}
                      onChange={(e) => handleChange('specialization', e.target.value)}
                      className={`block w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.specialization ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select primary specialization</option>
                      <option value="Water Supply">Water Supply & Plumbing</option>
                      <option value="Electricity">Electrical & Power Systems</option>
                      <option value="Roads">Road Maintenance & Infrastructure</option>
                      <option value="Sanitation">Sanitation & Waste Management</option>
                      <option value="Parks">Parks & Recreation</option>
                      <option value="General">General Municipal Services</option>
                    </select>
                    {errors.specialization && <p className="mt-1 text-xs text-red-600">{errors.specialization}</p>}
                  </div>

                  {/* Department */}
                  <div>
                    <label htmlFor="dept" className="block text-sm font-medium text-gray-700 mb-1">
                      Department *
                    </label>
                    <input
                      type="text"
                      id="dept"
                      value={formData.dept}
                      onChange={(e) => handleChange('dept', e.target.value)}
                      className={`block w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.dept ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="e.g., Public Works, Utilities, Infrastructure"
                    />
                    {errors.dept && <p className="mt-1 text-xs text-red-600">{errors.dept}</p>}
                  </div>

                  {/* Contact */}
                  <div>
                    <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">
                      <FiPhone className="inline h-4 w-4 mr-1" />
                      Contact Number *
                    </label>
                    <input
                      type="text"
                      id="contact"
                      value={formData.contact}
                      onChange={(e) => handleChange('contact', e.target.value)}
                      className={`block w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.contact ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="+91 98765-43210"
                    />
                    {errors.contact && <p className="mt-1 text-xs text-red-600">{errors.contact}</p>}
                  </div>

                  {/* Status */}
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Initial Status
                    </label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => handleChange('status', e.target.value as 'active' | 'on_leave' | 'on_site')}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="active">Active - Ready for assignments</option>
                      <option value="on_site">On Site - Currently deployed</option>
                      <option value="on_leave">On Leave - Temporarily unavailable</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Add as Technician
                </button>
                <button
                  type="button"
                  onClick={handleBack}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Back to User Selection
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddTechnicianModal;