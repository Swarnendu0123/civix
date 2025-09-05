import React, { useState } from 'react';
import { FiX, FiEdit3, FiPlus, FiTrash2 } from 'react-icons/fi';
import type { Technician } from '../../types';

interface EditTechnicianModalProps {
  technician: Technician | null;
  isOpen: boolean;
  onClose: () => void;
  onAssignTicket: (technicianId: string, ticketId: string) => void;
}

const EditTechnicianModal: React.FC<EditTechnicianModalProps> = ({ 
  technician, 
  isOpen, 
  onClose, 
  onAssignTicket 
}) => {
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);

  if (!isOpen || !technician) return null;

  // Sample active tickets - in real app, this would come from props
  const availableTickets = [
    {
      id: 'TICK-101',
      title: 'Water leak on Park Avenue',
      category: 'Water Supply',
      priority: 'high',
      location: 'Park Avenue, Sector 12',
      reportedAt: '2024-01-16T10:30:00Z'
    },
    {
      id: 'TICK-102', 
      title: 'Street light not working',
      category: 'Electricity',
      priority: 'medium',
      location: 'Main Street, Block A',
      reportedAt: '2024-01-16T09:15:00Z'
    },
    {
      id: 'TICK-103',
      title: 'Pothole near market',
      category: 'Roads',
      priority: 'high',
      location: 'Market Road, Area 5',
      reportedAt: '2024-01-16T08:45:00Z'
    },
    {
      id: 'TICK-104',
      title: 'Drain blockage',
      category: 'Sanitation',
      priority: 'high',
      location: 'Green Lane, Colony 3',
      reportedAt: '2024-01-16T07:20:00Z'
    },
    {
      id: 'TICK-105',
      title: 'Broken sidewalk',
      category: 'General',
      priority: 'low',
      location: 'Oak Street, Residential Area',
      reportedAt: '2024-01-15T16:30:00Z'
    }
  ];

  // Sample currently assigned tickets
  const currentlyAssigned = [
    {
      id: 'TICK-201',
      title: 'Water pressure issue',
      category: 'Water Supply',
      priority: 'medium',
      location: 'Elm Street, Unit 45',
      assignedAt: '2024-01-15T14:30:00Z'
    },
    {
      id: 'TICK-202',
      title: 'Electrical fault in building',
      category: 'Electricity', 
      priority: 'high',
      location: 'Tower Complex, Floor 8',
      assignedAt: '2024-01-15T11:20:00Z'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleTicketToggle = (ticketId: string) => {
    setSelectedTickets(prev => 
      prev.includes(ticketId) 
        ? prev.filter(id => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  const handleAssignSelected = () => {
    selectedTickets.forEach(ticketId => {
      onAssignTicket(technician.id, ticketId);
    });
    setSelectedTickets([]);
    // In a real app, you might want to show a success message here
  };

  const filteredTickets = availableTickets.filter(ticket => 
    technician.specialization === 'General' || 
    ticket.category === technician.specialization
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                  <FiEdit3 className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Assign Tickets to {technician.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Specialization: {technician.specialization} • Currently has {technician.openTickets} open tickets
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

          {/* Content */}
          <div className="px-4 pb-4 sm:px-6 sm:pb-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Available Tickets */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900">Available Tickets</h4>
                  <span className="text-sm text-gray-500">
                    {filteredTickets.length} tickets match specialization
                  </span>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="max-h-96 overflow-y-auto">
                    {filteredTickets.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No tickets available for this specialization
                      </div>
                    ) : (
                      filteredTickets.map((ticket) => (
                        <div 
                          key={ticket.id} 
                          className={`p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${
                            selectedTickets.includes(ticket.id) ? 'bg-blue-50 border-blue-200' : ''
                          }`}
                          onClick={() => handleTicketToggle(ticket.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start">
                              <input
                                type="checkbox"
                                checked={selectedTickets.includes(ticket.id)}
                                onChange={() => handleTicketToggle(ticket.id)}
                                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <div className="ml-3 flex-1">
                                <div className="text-sm font-medium text-gray-900 mb-1">
                                  {ticket.title}
                                </div>
                                <div className="text-xs text-gray-500 mb-2">
                                  {ticket.id} • {ticket.location}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                                    {ticket.priority}
                                  </span>
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                    {ticket.category}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  Reported: {new Date(ticket.reportedAt).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Assign Button */}
                {selectedTickets.length > 0 && (
                  <div className="mt-4">
                    <button
                      onClick={handleAssignSelected}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FiPlus className="h-4 w-4 mr-2" />
                      Assign {selectedTickets.length} Ticket{selectedTickets.length > 1 ? 's' : ''}
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column - Currently Assigned */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900">Currently Assigned</h4>
                  <span className="text-sm text-gray-500">
                    {currentlyAssigned.length} active tickets
                  </span>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="max-h-96 overflow-y-auto">
                    {currentlyAssigned.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No tickets currently assigned
                      </div>
                    ) : (
                      currentlyAssigned.map((ticket) => (
                        <div key={ticket.id} className="p-4 border-b border-gray-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900 mb-1">
                                {ticket.title}
                              </div>
                              <div className="text-xs text-gray-500 mb-2">
                                {ticket.id} • {ticket.location}
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                                  {ticket.priority}
                                </span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                  {ticket.category}
                                </span>
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                Assigned: {new Date(ticket.assignedAt).toLocaleString()}
                              </div>
                            </div>
                            <button
                              className="ml-2 text-red-600 hover:text-red-800 p-1"
                              title="Unassign ticket"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Workload Summary */}
                <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Workload Summary</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Current Open Tickets:</span>
                      <span className="font-medium">{technician.openTickets}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Average Resolution Time:</span>
                      <span className="font-medium">{technician.avgResolutionTime}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium ${
                        technician.status === 'active' ? 'text-green-600' : 
                        technician.status === 'on_site' ? 'text-blue-600' : 'text-yellow-600'
                      }`}>
                        {technician.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Close
              </button>
              <button className="bg-green-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTechnicianModal;