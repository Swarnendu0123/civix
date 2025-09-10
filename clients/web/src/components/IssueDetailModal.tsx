import React from 'react';
import { 
  FiX, 
  FiMapPin, 
  FiClock, 
  FiUser, 
  FiThumbsUp, 
  FiThumbsDown,
  FiTag,
  FiImage,
  FiCalendar
} from 'react-icons/fi';
import type { Ticket } from '../types';
import MapboxMap from './MapboxMap';

interface ticketDetailModalProps {
  ticket: Ticket;
  isOpen: boolean;
  onClose: () => void;
}

const ticketDetailModal: React.FC<ticketDetailModalProps> = ({ ticket, isOpen, onClose }) => {
  if (!isOpen || !ticket) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'in process':
        return 'bg-blue-100 text-blue-800';
      case 'open':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-2xl leading-6 font-bold text-gray-900 mb-2">
                  {ticket.ticket_name}
                </h3>
                <div className="flex items-center space-x-4 mb-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyColor(ticket.urgency)}`}>
                    {ticket.urgency} urgency
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 capitalize">
                    {ticket.ticket_category}
                  </span>
                </div>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* ticket Image */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">ticket Image</h4>
                  <div className="relative">
                    <img
                      src={ticket.image_url}
                      alt={ticket.ticket_name}
                      className="w-full h-64 object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/400x300?text=No+Image+Available';
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded">
                      <FiImage className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Description</h4>
                  <p className="text-gray-700 leading-relaxed">{ticket.ticket_description}</p>
                </div>

                {/* Tags */}
                {ticket.tags.length > 0 && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <FiTag className="h-5 w-5 mr-2" />
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {ticket.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Voting */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Community Response</h4>
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center text-green-600">
                      <FiThumbsUp className="h-5 w-5 mr-2" />
                      <span className="text-lg font-semibold">{ticket.votes.upvotes}</span>
                      <span className="ml-1 text-sm">upvotes</span>
                    </div>
                    <div className="flex items-center text-red-600">
                      <FiThumbsDown className="h-5 w-5 mr-2" />
                      <span className="text-lg font-semibold">{ticket.votes.downvotes}</span>
                      <span className="ml-1 text-sm">downvotes</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Net Score: {ticket.votes.upvotes - ticket.votes.downvotes}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Map */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <FiMapPin className="h-5 w-5 mr-2" />
                    Location
                  </h4>
                  <div className="bg-gray-100 rounded-lg p-4 mb-3">
                    <p className="text-sm text-gray-700">
                      Lat: {ticket.location.latitude}, Lng: {ticket.location.longitude}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Coordinates: {ticket.location.latitude.toFixed(6)}, {ticket.location.longitude.toFixed(6)}
                    </p>
                  </div>
                  
                  {/* Mapbox Map */}
                  <MapboxMap
                    latitude={ticket.location.latitude}
                    longitude={ticket.location.longitude}
                    address={`${ticket.location.latitude}, ${ticket.location.longitude}`}
                    className="h-64 rounded-lg"
                    markerColor="#ef4444"
                  />
                </div>

                {/* Reporter Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <FiUser className="h-5 w-5 mr-2" />
                    Reporter Information
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm">
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">{ticket.creator_name}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">User ID:</span>
                        <span className="font-mono text-xs">{ticket.creator_id}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <FiCalendar className="h-5 w-5 mr-2" />
                    Timeline
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-900">ticket Reported</span>
                          <span className="text-sm text-gray-500 flex items-center">
                            <FiClock className="h-4 w-4 mr-1" />
                            {new Date(ticket.opening_time).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">ticket was reported by {ticket.creator_name}</p>
                      </div>
                    </div>

                    {ticket.closing_time && (
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-900">ticket Resolved</span>
                            <span className="text-sm text-gray-500 flex items-center">
                              <FiClock className="h-4 w-4 mr-1" />
                              {new Date(ticket.closing_time).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">ticket was marked as resolved</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Authority Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Assigned Authority</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm">
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Authority ID:</span>
                        <span className="font-mono text-xs">{ticket.authority}</span>
                      </div>
                      {ticket.sub_authority && (
                        <div className="flex justify-between py-2">
                          <span className="text-gray-600">Sub Authority:</span>
                          <span className="font-mono text-xs">{ticket.sub_authority}</span>
                        </div>
                      )}
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
                Update Status
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ticketDetailModal;