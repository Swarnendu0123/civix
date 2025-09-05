import React, { useState } from 'react';
import { FiEye, FiEdit, FiUsers, FiClock, FiCheckCircle, FiFilter, FiSearch } from 'react-icons/fi';
import { sampleTechnicians } from '../data/sampleTechnicians';
import { AddTechnicianModal, ViewTechnicianModal, EditTechnicianModal } from '../components/TechnicianModals';
import StatCard from '../components/Dashboard/StatCard';
import type { Technician } from '../types';

const TechnicianManagement: React.FC = () => {
  const [technicians, setTechnicians] = useState<Technician[]>(sampleTechnicians);
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'avgResolutionTime' | 'openTickets'>('rating');
  const [filterBy, setFilterBy] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const totalTechnicians = technicians.length;
  const activeTechnicians = technicians.filter(tech => tech.status === 'active').length;
  const avgOpenTickets = Math.round(
    technicians.reduce((sum, tech) => sum + tech.openTickets, 0) / totalTechnicians * 10
  ) / 10;

  // Handlers for modals
  const handleAddTechnician = (newTechnician: Omit<Technician, 'id' | 'openTickets' | 'totalResolved' | 'rating'>) => {
    const technician: Technician = {
      ...newTechnician,
      id: `TECH-${Date.now()}`,
      openTickets: 0,
      totalResolved: 0,
      rating: 0
    };
    setTechnicians(prev => [...prev, technician]);
  };

  const handleViewTechnician = (technician: Technician) => {
    setSelectedTechnician(technician);
    setIsViewModalOpen(true);
  };

  const handleEditTechnician = (technician: Technician) => {
    setSelectedTechnician(technician);
    setIsEditModalOpen(true);
  };

  const handleAssignTicket = (technicianId: string, ticketId: string) => {
    // In a real app, this would make an API call
    console.log(`Assigning ticket ${ticketId} to technician ${technicianId}`);
  };

  // Filtering and sorting logic
  const filteredAndSortedTechnicians = technicians
    .filter(tech => {
      const matchesSearch = tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tech.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterBy === 'all' || tech.specialization === filterBy;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'avgResolutionTime': {
          // Parse resolution time for sorting (assuming format like "1.5 days")
          const parseTime = (time: string) => parseFloat(time.split(' ')[0]);
          return parseTime(a.avgResolutionTime) - parseTime(b.avgResolutionTime);
        }
        case 'openTickets':
          return a.openTickets - b.openTickets;
        default:
          return 0;
      }
    });

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

  const specializations = [...new Set(technicians.map(tech => tech.specialization).filter(Boolean))];



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Technician Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage technician assignments and track performance
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Technician
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Technicians"
          value={totalTechnicians}
          helpText="Registered technicians"
          icon={<FiUsers className="h-6 w-6" />}
        />
        <StatCard
          title="Active on Duty"
          value={activeTechnicians}
          helpText="Currently working"
          icon={<FiCheckCircle className="h-6 w-6" />}
        />
        <StatCard
          title="Avg. Open Tickets"
          value={avgOpenTickets}
          helpText="Per technician"
          icon={<FiClock className="h-6 w-6" />}
        />
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search technicians by name or specialization..."
                />
              </div>
            </div>

            {/* Filters and Sort */}
            <div className="flex space-x-4">
              {/* Filter by Specialization */}
              <div className="flex items-center space-x-2">
                <FiFilter className="h-4 w-4 text-gray-500" />
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Specializations</option>
                  {specializations.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'rating' | 'avgResolutionTime' | 'openTickets')}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="rating">Best Rated</option>
                  <option value="avgResolutionTime">Fastest Resolve Time</option>
                  <option value="openTickets">Most Available</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Technicians Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Technician List
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Overview of all registered technicians and their current status
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Technician
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specialization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Open Tickets
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedTechnicians.map((technician) => (
                <tr key={technician.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <FiUsers className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {technician.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {technician.id}
                        </div>
                        <div className="text-sm text-gray-500">
                          {technician.contact}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {technician.specialization}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {technician.openTickets}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FiCheckCircle className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-sm font-medium text-gray-900">
                        {technician.rating?.toFixed(1) || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(technician.status)}`}>
                      {technician.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleViewTechnician(technician)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <FiEye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEditTechnician(technician)}
                        className="text-green-600 hover:text-green-900"
                        title="Assign Tickets"
                      >
                        <FiEdit className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Performance Summary
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-semibold text-blue-600">
                {technicians.reduce((sum: number, tech) => sum + (tech.totalResolved || 0), 0)}
              </div>
              <div className="text-sm text-gray-500">Total Tickets Resolved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-green-600">
                {(technicians.reduce((sum, tech) => sum + (tech.rating || 0), 0) / technicians.length).toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-purple-600">
                {Math.round(activeTechnicians / totalTechnicians * 100)}%
              </div>
              <div className="text-sm text-gray-500">Currently Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-orange-600">2.1</div>
              <div className="text-sm text-gray-500">Avg. Resolution Time (days)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddTechnicianModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddTechnician}
      />

      <ViewTechnicianModal
        technician={selectedTechnician}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
      />

      <EditTechnicianModal
        technician={selectedTechnician}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onAssignTicket={handleAssignTicket}
      />
    </div>
  );
};

export default TechnicianManagement;