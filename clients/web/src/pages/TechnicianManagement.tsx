import React from 'react';
import { FiEye, FiEdit, FiUsers, FiClock, FiCheckCircle } from 'react-icons/fi';
import { sampleWorkers } from '../data/sampleWorkers';
import StatCard from '../components/Dashboard/StatCard';

const TechnicianManagement: React.FC = () => {
  const totalTechnicians = sampleWorkers.length;
  const activeTechnicians = sampleWorkers.filter(worker => worker.issues_assigned.length > 0).length;
  const avgOpenTickets = Math.round(
    sampleWorkers.reduce((sum, worker) => sum + worker.issues_assigned.length, 0) / totalTechnicians * 10
  ) / 10;



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
                  Worker
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Issues
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pull Requests
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
              {sampleWorkers.map((worker) => (
                <tr key={worker._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <FiUsers className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {worker.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {worker._id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      worker.dept === 'plumber' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {worker.dept}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {worker.issues_assigned.length}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {worker.pulls_created.length}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      worker.issues_assigned.length > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {worker.issues_assigned.length > 0 ? 'Active' : 'Available'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <FiEye className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
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
                {sampleWorkers.reduce((sum: number, worker) => sum + worker.pulls_created.length, 0)}
              </div>
              <div className="text-sm text-gray-500">Total Pull Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-green-600">
                4.6
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
    </div>
  );
};

export default TechnicianManagement;