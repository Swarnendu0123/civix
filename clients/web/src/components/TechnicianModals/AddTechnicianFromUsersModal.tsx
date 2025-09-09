import React, { useState, useEffect } from 'react';
import { FiX, FiUser, FiUserPlus, FiChevronRight } from 'react-icons/fi';
import api from '../../services/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'citizen' | 'technician' | 'authority';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  points?: number;
  contact?: string;
}

interface AddTechnicianFromUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPromoteSuccess: () => void;
}

const AddTechnicianFromUsersModal: React.FC<AddTechnicianFromUsersModalProps> = ({
  isOpen,
  onClose,
  onPromoteSuccess
}) => {
  const [step, setStep] = useState<'selectUser' | 'techniciansDetails'>('selectUser');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Technician details form
  const [technicianDetails, setTechnicianDetails] = useState({
    specialization: '',
    dept: '',
    contact: ''
  });

  // Available specializations
  const specializations = [
    'Electrician',
    'Plumber', 
    'Water Supply',
    'Roads & Infrastructure',
    'Sanitation',
    'Parks & Gardens',
    'Public Safety',
    'General Maintenance'
  ];

  useEffect(() => {
    if (isOpen) {
      fetchCitizenUsers();
      setStep('selectUser');
      setSelectedUser(null);
      setTechnicianDetails({ specialization: '', dept: '', contact: '' });
      setSearchTerm('');
    }
  }, [isOpen]);

  const fetchCitizenUsers = async () => {
    try {
      setLoading(true);
      const response = await api.admin.getUsers({
        role: 'citizen',
        status: 'active',
        limit: 100
      });
      setUsers(response.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setTechnicianDetails(prev => ({
      ...prev,
      contact: user.contact || user.email || ''
    }));
    setStep('techniciansDetails');
  };

  const handlePromoteToTechnician = async () => {
    if (!selectedUser || !technicianDetails.specialization) return;

    try {
      setPromoting(true);
      await api.admin.promoteUserToTechnician(selectedUser._id, {
        specialization: technicianDetails.specialization,
        dept: technicianDetails.dept || technicianDetails.specialization,
        contact: technicianDetails.contact
      });
      
      onPromoteSuccess();
      onClose();
    } catch (error) {
      console.error('Error promoting user:', error);
      alert('Failed to promote user to technician. Please try again.');
    } finally {
      setPromoting(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                {step === 'selectUser' ? 'Add Technician from Users' : 'Technician Details'}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
            
            {/* Progress indicators */}
            <div className="mt-4 flex items-center">
              <div className={`flex items-center ${step === 'selectUser' ? 'text-blue-600' : 'text-green-600'}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === 'selectUser' ? 'bg-blue-100' : 'bg-green-100'
                }`}>
                  1
                </div>
                <span className="ml-2 text-sm font-medium">Select User</span>
              </div>
              <FiChevronRight className="mx-2 h-4 w-4 text-gray-400" />
              <div className={`flex items-center ${step === 'techniciansDetails' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === 'techniciansDetails' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  2
                </div>
                <span className="ml-2 text-sm font-medium">Add Details</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {step === 'selectUser' && (
              <div>
                <p className="text-sm text-gray-500 mb-4">
                  Select a citizen user to promote to technician role. Only active citizen users are shown.
                </p>
                
                {/* Search */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Users list */}
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md">
                  {loading ? (
                    <div className="p-4 text-center text-gray-500">Loading users...</div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No citizen users found
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <button
                        key={user._id}
                        onClick={() => handleUserSelect(user)}
                        className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-blue-50"
                      >
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                            <FiUser className="h-4 w-4 text-gray-600" />
                          </div>
                          <div className="ml-3 flex-1">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            {user.points !== undefined && (
                              <div className="text-xs text-gray-400">{user.points} points</div>
                            )}
                          </div>
                          <FiChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {step === 'techniciansDetails' && selectedUser && (
              <div>
                <div className="mb-6 p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <FiUser className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{selectedUser.name}</div>
                      <div className="text-sm text-gray-500">{selectedUser.email}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Specialization *
                    </label>
                    <select
                      value={technicianDetails.specialization}
                      onChange={(e) => setTechnicianDetails(prev => ({ 
                        ...prev, 
                        specialization: e.target.value,
                        dept: e.target.value // Auto-fill department
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select specialization</option>
                      {specializations.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      value={technicianDetails.dept}
                      onChange={(e) => setTechnicianDetails(prev => ({ ...prev, dept: e.target.value }))}
                      placeholder="Department (auto-filled from specialization)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Number
                    </label>
                    <input
                      type="text"
                      value={technicianDetails.contact}
                      onChange={(e) => setTechnicianDetails(prev => ({ ...prev, contact: e.target.value }))}
                      placeholder="Contact number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-md">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">What happens next?</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• User role will be changed from "citizen" to "technician"</li>
                    <li>• User will get access to technician features in the mobile app</li>
                    <li>• User will be able to receive task assignments</li>
                    <li>• User will appear in the technicians list</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-3 flex justify-between">
            <div className="flex space-x-3">
              {step === 'techniciansDetails' && (
                <button
                  type="button"
                  onClick={() => setStep('selectUser')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back
                </button>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              
              {step === 'techniciansDetails' && (
                <button
                  type="button"
                  onClick={handlePromoteToTechnician}
                  disabled={!technicianDetails.specialization || promoting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {promoting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Promoting...
                    </>
                  ) : (
                    <>
                      <FiUserPlus className="mr-2 h-4 w-4" />
                      Promote to Technician
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTechnicianFromUsersModal;