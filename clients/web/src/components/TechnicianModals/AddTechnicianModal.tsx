import React, { useState } from 'react';
import { FiX, FiUser, FiPhone, FiTool } from 'react-icons/fi';
import type { Technician } from '../../types';

interface AddTechnicianModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (technician: Omit<Technician, 'id' | 'openTickets' | 'totalResolved' | 'rating'>) => void;
}

const AddTechnicianModal: React.FC<AddTechnicianModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    specialization: '',
    avgResolutionTime: '',
    status: 'active' as const
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.contact.trim()) {
      newErrors.contact = 'Contact is required';
    } else if (!/^\+91\s\d{5}-\d{5}$/.test(formData.contact)) {
      newErrors.contact = 'Contact must be in format: +91 98765-43210';
    }
    
    if (!formData.specialization.trim()) {
      newErrors.specialization = 'Specialization is required';
    }
    
    if (!formData.avgResolutionTime.trim()) {
      newErrors.avgResolutionTime = 'Average resolution time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onAdd({
        ...formData
      });
      
      // Reset form
      setFormData({
        name: '',
        contact: '',
        specialization: '',
        avgResolutionTime: '',
        status: 'active'
      });
      setErrors({});
      onClose();
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                  <FiUser className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Add New Technician
                  </h3>
                  <p className="text-sm text-gray-500">
                    Enter technician details to add them to the system
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

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="px-4 pb-4 sm:px-6 sm:pb-6">
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    <FiUser className="inline h-4 w-4 mr-1" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className={`block w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter technician's full name"
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                </div>

                {/* Contact */}
                <div>
                  <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">
                    <FiPhone className="inline h-4 w-4 mr-1" />
                    Contact Number
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

                {/* Specialization */}
                <div>
                  <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
                    <FiTool className="inline h-4 w-4 mr-1" />
                    Specialization
                  </label>
                  <select
                    id="specialization"
                    value={formData.specialization}
                    onChange={(e) => handleChange('specialization', e.target.value)}
                    className={`block w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.specialization ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select specialization</option>
                    <option value="Water Supply">Water Supply</option>
                    <option value="Electricity">Electricity</option>
                    <option value="Roads">Roads</option>
                    <option value="Sanitation">Sanitation</option>
                    <option value="General">General</option>
                  </select>
                  {errors.specialization && <p className="mt-1 text-xs text-red-600">{errors.specialization}</p>}
                </div>

                {/* Average Resolution Time */}
                <div>
                  <label htmlFor="avgResolutionTime" className="block text-sm font-medium text-gray-700 mb-1">
                    Average Resolution Time
                  </label>
                  <input
                    type="text"
                    id="avgResolutionTime"
                    value={formData.avgResolutionTime}
                    onChange={(e) => handleChange('avgResolutionTime', e.target.value)}
                    className={`block w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.avgResolutionTime ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 2.5 days"
                  />
                  {errors.avgResolutionTime && <p className="mt-1 text-xs text-red-600">{errors.avgResolutionTime}</p>}
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value as 'active' | 'on_leave' | 'on_site')}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="on_leave">On Leave</option>
                    <option value="on_site">On Site</option>
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
                Add Technician
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTechnicianModal;