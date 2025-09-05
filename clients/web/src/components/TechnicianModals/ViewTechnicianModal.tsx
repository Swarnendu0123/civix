import React from 'react';
import { 
  FiX, 
  FiUser, 
  FiPhone, 
  FiTool, 
  FiClock, 
  FiStar, 
  FiCheckCircle,
  FiTrendingUp,
  FiTrendingDown,
  FiActivity
} from 'react-icons/fi';
import type { Technician } from '../../types';

interface ViewTechnicianModalProps {
  technician: Technician | null;
  isOpen: boolean;
  onClose: () => void;
}

const ViewTechnicianModal: React.FC<ViewTechnicianModalProps> = ({ technician, isOpen, onClose }) => {
  if (!isOpen || !technician) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'on_leave':
        return 'bg-yellow-100 text-yellow-800';
      case 'on_site':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <FiCheckCircle className="h-4 w-4 mr-1" />;
      case 'on_leave':
        return <FiClock className="h-4 w-4 mr-1" />;
      case 'on_site':
        return <FiActivity className="h-4 w-4 mr-1" />;
      default:
        return <FiUser className="h-4 w-4 mr-1" />;
    }
  };

  // Sample performance data - in real app, this would come from props
  const performanceData = {
    thisMonth: {
      resolved: 12,
      avgTime: '1.8 days',
      rating: 4.7
    },
    lastMonth: {
      resolved: 8,
      avgTime: '2.1 days',
      rating: 4.5
    },
    recentTickets: [
      { id: 'TICK-001', title: 'Water leak on Main Street', resolvedAt: '2024-01-15', rating: 5 },
      { id: 'TICK-002', title: 'Street light not working', resolvedAt: '2024-01-14', rating: 4 },
      { id: 'TICK-003', title: 'Pothole near school', resolvedAt: '2024-01-12', rating: 5 },
      { id: 'TICK-004', title: 'Drain blockage', resolvedAt: '2024-01-10', rating: 4 },
      { id: 'TICK-005', title: 'Broken sidewalk', resolvedAt: '2024-01-08', rating: 5 }
    ]
  };

  const isImproving = performanceData.thisMonth.resolved > performanceData.lastMonth.resolved;
  const ratingTrend = performanceData.thisMonth.rating - performanceData.lastMonth.rating;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                    <FiUser className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl leading-6 font-bold text-gray-900">
                    {technician.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Technician ID: {technician.id}
                  </p>
                  <div className="flex items-center mt-2 space-x-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(technician.status)}`}>
                      {getStatusIcon(technician.status)}
                      {technician.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      <FiTool className="h-3 w-3 mr-1" />
                      {technician.specialization}
                    </span>
                  </div>
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
              {/* Left Column - Personal Info & Stats */}
              <div className="space-y-6">
                {/* Contact Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Contact Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <FiPhone className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-900">{technician.contact}</span>
                    </div>
                    <div className="flex items-center">
                      <FiTool className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-900">{technician.specialization}</span>
                    </div>
                  </div>
                </div>

                {/* Key Metrics */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Key Metrics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">{technician.totalResolved || 0}</div>
                      <div className="text-xs text-blue-800">Total Resolved</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">{technician.openTickets}</div>
                      <div className="text-xs text-green-800">Open Tickets</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-yellow-600 flex items-center justify-center">
                        <FiStar className="h-5 w-5 mr-1" />
                        {technician.rating?.toFixed(1) || 'N/A'}
                      </div>
                      <div className="text-xs text-yellow-800">Average Rating</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">{technician.avgResolutionTime}</div>
                      <div className="text-xs text-purple-800">Avg. Resolution</div>
                    </div>
                  </div>
                </div>

                {/* Performance Trend */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Performance Trend</h4>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">This Month</div>
                        <div className="text-xl font-semibold text-gray-900">{performanceData.thisMonth.resolved} resolved</div>
                        <div className="text-sm text-gray-500">{performanceData.thisMonth.avgTime} avg</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Last Month</div>
                        <div className="text-xl font-semibold text-gray-900">{performanceData.lastMonth.resolved} resolved</div>
                        <div className="text-sm text-gray-500">{performanceData.lastMonth.avgTime} avg</div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Performance</span>
                        <div className="flex items-center">
                          {isImproving ? (
                            <FiTrendingUp className="h-4 w-4 text-green-600 mr-1" />
                          ) : (
                            <FiTrendingDown className="h-4 w-4 text-red-600 mr-1" />
                          )}
                          <span className={`text-sm font-medium ${isImproving ? 'text-green-600' : 'text-red-600'}`}>
                            {isImproving ? 'Improving' : 'Declining'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm text-gray-600">Rating Trend</span>
                        <span className={`text-sm font-medium ${ratingTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {ratingTrend >= 0 ? '+' : ''}{ratingTrend.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Recent Activity */}
              <div className="space-y-6">
                {/* Recent Resolved Tickets */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Recent Resolved Tickets</h4>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="max-h-96 overflow-y-auto">
                      {performanceData.recentTickets.map((ticket, index) => (
                        <div key={ticket.id} className={`p-4 ${index !== performanceData.recentTickets.length - 1 ? 'border-b border-gray-200' : ''}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900 mb-1">
                                {ticket.title}
                              </div>
                              <div className="text-xs text-gray-500 mb-2">
                                Ticket ID: {ticket.id}
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="text-xs text-gray-500">
                                  Resolved: {new Date(ticket.resolvedAt).toLocaleDateString()}
                                </div>
                                <div className="flex items-center">
                                  <FiStar className="h-3 w-3 text-yellow-500 mr-1" />
                                  <span className="text-xs font-medium text-gray-900">{ticket.rating}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Additional Statistics */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Additional Statistics</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Completion Rate</span>
                      <span className="text-sm font-medium text-gray-900">
                        {technician.totalResolved && technician.openTickets ? 
                          Math.round((technician.totalResolved / (technician.totalResolved + technician.openTickets)) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Average Response Time</span>
                      <span className="text-sm font-medium text-gray-900">2.5 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Customer Satisfaction</span>
                      <span className="text-sm font-medium text-gray-900">
                        {technician.rating ? `${(technician.rating * 20).toFixed(0)}%` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Work Hours (This Month)</span>
                      <span className="text-sm font-medium text-gray-900">156 hours</span>
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
              <button className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Edit Technician
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTechnicianModal;