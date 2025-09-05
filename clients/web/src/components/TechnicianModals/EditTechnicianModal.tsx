import React, { useState, useEffect } from 'react';
import { FiX, FiEdit3, FiSave, FiTrash2 } from 'react-icons/fi';
import api from '../../services/api';
import type { Technician } from '../../types';

interface EditTechnicianModalProps {
  technician: Technician | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedTechnician: Technician) => void;
  onDelete?: (technicianId: string) => void;
}

const EditTechnicianModal: React.FC<EditTechnicianModalProps> = ({ 
  technician, 
  isOpen, 
  onClose, 
  onUpdate,
  onDelete
}) => {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    specialization: '',
    dept: '',
    status: 'active' as 'active' | 'inactive' | 'on_leave' | 'on_site'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (technician) {
      setFormData({
        name: technician.name || '',
        contact: technician.contact || '',
        specialization: technician.specialization || '',
        dept: technician.specialization || '', // Using specialization as dept
        status: technician.status || 'active'
      });
    }
  }, [technician]);

  if (!isOpen || !technician) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.contact.trim() || !formData.specialization.trim()) {
      setError('Name, contact, and specialization are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const updatedTechnician = await api.technicians.updateTechnician(technician.id, formData);
      const uiTechnician = api.transformers.apiTechnicianToUI(updatedTechnician);
      onUpdate(uiTechnician);
      onClose();
    } catch (err) {
      console.error('Error updating technician:', err);
      setError(err instanceof Error ? err.message : 'Failed to update technician');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this technician? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await api.technicians.deleteTechnician(technician.id);
      onDelete?.(technician.id);
      onClose();
    } catch (err) {
      console.error('Error deleting technician:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete technician');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <FiEdit3 className="h-6 w-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">
              Edit Technician
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter technician's full name"
              />
            </div>

            <div>
              <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number *
              </label>
              <input
                type="tel"
                id="contact"
                name="contact"
                required
                value={formData.contact}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter contact number"
              />
            </div>

            <div>
              <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
                Specialization *
              </label>
              <select
                id="specialization"
                name="specialization"
                required
                value={formData.specialization}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select specialization</option>
                <option value="Water Supply">Water Supply</option>
                <option value="Electricity">Electricity</option>
                <option value="Roads">Roads</option>
                <option value="Sanitation">Sanitation</option>
                <option value="Public Safety">Public Safety</option>
                <option value="Parks & Recreation">Parks & Recreation</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Active</option>
                <option value="on_leave">On Leave</option>
                <option value="on_site">On Site</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Current Stats (Read-only) */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Current Performance</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-blue-600">{technician.openTickets}</div>
                <div className="text-xs text-gray-500">Open Tickets</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-green-600">{technician.totalResolved || 0}</div>
                <div className="text-xs text-gray-500">Total Resolved</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-yellow-600">{technician.rating?.toFixed(1) || 'N/A'}</div>
                <div className="text-xs text-gray-500">Rating</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              <FiTrash2 className="h-4 w-4 mr-2" />
              Delete Technician
            </button>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <FiSave className="h-4 w-4 mr-2" />
                )}
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTechnicianModal;