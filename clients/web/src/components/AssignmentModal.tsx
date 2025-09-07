import React, { useState, useEffect } from 'react';
import { 
  FiX, 
  FiUser, 
  FiCheck, 
  FiAlertTriangle,
  FiLoader
} from 'react-icons/fi';
import type { Ticket } from '../types';
import api from '../services/api';

interface AssignmentModalProps {
  ticket: Ticket;
  isOpen: boolean;
  onClose: () => void;
  onAssignmentComplete: () => void;
  mode: 'manual' | 'approve' | 'assign'; // Different modes for different scenarios
}

interface Technician {
  _id: string;
  name: string;
  specialization: string;
  status: string;
  openTickets: number;
  rating: number;
  totalResolved: number;
}

const AssignmentModal: React.FC<AssignmentModalProps> = ({ 
  ticket, 
  isOpen, 
  onClose, 
  onAssignmentComplete,
  mode 
}) => {
  const [loading, setLoading] = useState(false);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selectedTechnician, setSelectedTechnician] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [issueCategory, setIssueCategory] = useState(ticket.issue_category);
  const [suggestedTechnician, setSuggestedTechnician] = useState<Technician | null>(null);

  const categories = ['sanitation', 'electricity', 'water', 'road', 'other'];

  useEffect(() => {
    if (isOpen) {
      fetchTechnicians();
      if (mode === 'approve') {
        // For approval mode, we might have suggested technician data
        // This would come from the notification data
        fetchSuggestedTechnician();
      }
    }
  }, [isOpen, issueCategory, mode]);

  const fetchTechnicians = async () => {
    try {
      setLoading(true);
      const response = await api.technicians.getFiltered(issueCategory);
      setTechnicians(response.technicians || []);
    } catch (error) {
      console.error('Failed to fetch technicians:', error);
      setTechnicians([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestedTechnician = async () => {
    try {
      const suggestions = await api.tickets.getTechnicianSuggestions(ticket._id);
      if (suggestions.suggestions && suggestions.suggestions.length > 0) {
        setSuggestedTechnician(suggestions.suggestions[0]);
        setSelectedTechnician(suggestions.suggestions[0]._id);
      }
    } catch (error) {
      console.error('Failed to fetch suggested technician:', error);
    }
  };

  const handleManualAssignment = async () => {
    if (!selectedTechnician) {
      alert('Please select a technician');
      return;
    }

    try {
      setLoading(true);
      
      await api.admin.manualAssign(ticket._id, {
        technicianId: selectedTechnician,
        issueCategory: issueCategory !== ticket.issue_category ? issueCategory : undefined,
        notes
      });

      onAssignmentComplete();
      onClose();
    } catch (error) {
      console.error('Failed to assign ticket:', error);
      alert('Failed to assign ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAssignment = async (approved: boolean) => {
    try {
      setLoading(true);
      
      await api.admin.approveAssignment(ticket._id, {
        technicianId: selectedTechnician,
        approved,
        notes
      });

      onAssignmentComplete();
      onClose();
    } catch (error) {
      console.error('Failed to process approval:', error);
      alert('Failed to process approval. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getModalTitle = () => {
    switch (mode) {
      case 'approve':
        return 'Approve AI Assignment';
      case 'manual':
        return 'Manual Assignment';
      case 'assign':
        return 'Assign Technician';
      default:
        return 'Assign Technician';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl leading-6 font-bold text-gray-900 mb-2">
                  {getModalTitle()}
                </h3>
                <p className="text-sm text-gray-600">
                  Issue: {ticket.issue_name}
                </p>
                <p className="text-xs text-gray-500">
                  Location: {ticket.location?.address}
                </p>
              </div>
              <button
                onClick={onClose}
                className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ml-4"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 pb-4 sm:px-6 sm:pb-6">
            {mode === 'manual' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Category
                </label>
                <select
                  value={issueCategory}
                  onChange={(e) => setIssueCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {mode === 'approve' && suggestedTechnician && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="text-sm font-medium text-blue-900 mb-1">AI Suggested Assignment</h4>
                <div className="flex items-center space-x-3">
                  <FiUser className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">{suggestedTechnician.name}</p>
                    <p className="text-xs text-blue-600">
                      {suggestedTechnician.specialization} • {suggestedTechnician.openTickets} open tasks • Rating: {suggestedTechnician.rating || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Technician
              </label>
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <FiLoader className="h-5 w-5 animate-spin text-blue-600" />
                  <span className="ml-2 text-sm text-gray-600">Loading technicians...</span>
                </div>
              ) : technicians.length === 0 ? (
                <div className="flex items-center py-4 text-amber-600">
                  <FiAlertTriangle className="h-5 w-5 mr-2" />
                  <span className="text-sm">No available technicians for this category</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {technicians.map((technician) => (
                    <div
                      key={technician._id}
                      className={`p-3 border rounded-md cursor-pointer transition-colors ${
                        selectedTechnician === technician._id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedTechnician(technician._id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{technician.name}</p>
                          <p className="text-sm text-gray-600">{technician.specialization}</p>
                          <p className="text-xs text-gray-500">
                            {technician.openTickets} open tasks • Rating: {technician.rating || 'N/A'}
                          </p>
                        </div>
                        <div className={`h-3 w-3 rounded-full ${
                          technician.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'
                        }`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this assignment..."
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            {mode === 'approve' ? (
              <>
                <button
                  onClick={() => handleApproveAssignment(true)}
                  disabled={loading || !selectedTechnician}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {loading ? <FiLoader className="h-4 w-4 animate-spin mr-2" /> : <FiCheck className="h-4 w-4 mr-2" />}
                  Approve Assignment
                </button>
                <button
                  onClick={() => handleApproveAssignment(false)}
                  disabled={loading}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Reject & Manual Assign
                </button>
              </>
            ) : (
              <button
                onClick={handleManualAssignment}
                disabled={loading || !selectedTechnician}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {loading ? <FiLoader className="h-4 w-4 animate-spin mr-2" /> : <FiUser className="h-4 w-4 mr-2" />}
                Assign Technician
              </button>
            )}
            <button
              onClick={onClose}
              disabled={loading}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentModal;