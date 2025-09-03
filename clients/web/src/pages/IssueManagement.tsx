import React, { useState, useMemo } from 'react';
import { 
  FiSearch, 
  FiMapPin, 
  FiThumbsUp, 
  FiClock,
  FiX
} from 'react-icons/fi';
import { sampleIssues } from '../data/sampleIssues';
import type { Issue } from '../types';

const IssueManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'upvotes' | 'priority'>('createdAt');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredAndSortedIssues = useMemo(() => {
    return sampleIssues
      .filter(issue => {
        if (statusFilter !== 'all' && issue.status !== statusFilter) return false;
        if (categoryFilter !== 'all' && issue.category !== categoryFilter) return false;
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            issue.title.toLowerCase().includes(query) ||
            issue.description.toLowerCase().includes(query) ||
            issue.location.address.toLowerCase().includes(query)
          );
        }
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'createdAt':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'upvotes':
            return b.upvotes - a.upvotes;
          case 'priority':
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
          default:
            return 0;
        }
      });
  }, [searchQuery, statusFilter, categoryFilter, sortBy]);

  const openModal = (issue: Issue) => {
    setSelectedIssue(issue);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedIssue(null);
    setIsModalOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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

  const categories = [...new Set(sampleIssues.map(issue => issue.category))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Issue Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track municipal issues reported by citizens
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
        {/* Search */}
        <div className="flex-1 min-w-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'createdAt' | 'upvotes' | 'priority')}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="createdAt">Sort by Date</option>
            <option value="upvotes">Sort by Upvotes</option>
            <option value="priority">Sort by Priority</option>
          </select>
        </div>
      </div>

      {/* Issues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedIssues.map((issue) => (
          <div
            key={issue.id}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200 cursor-pointer"
            onClick={() => openModal(issue)}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {issue.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                    {issue.description}
                  </p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                  {issue.status.replace('_', ' ')}
                </span>
              </div>

              {/* Location */}
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <FiMapPin className="mr-2 h-4 w-4" />
                <span className="truncate">{issue.location.address}</span>
              </div>

              {/* Footer */}
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <FiThumbsUp className="mr-1 h-4 w-4" />
                    <span>{issue.upvotes}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <FiClock className="mr-1 h-4 w-4" />
                    <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(issue.priority)}`}>
                    {issue.priority}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {issue.category}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && selectedIssue && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal}></div>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  onClick={closeModal}
                  className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    {selectedIssue.title}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900">Description</h4>
                      <p className="text-gray-600">{selectedIssue.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900">Status</h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedIssue.status)}`}>
                          {selectedIssue.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Priority</h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(selectedIssue.priority)}`}>
                          {selectedIssue.priority}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900">Location</h4>
                      <p className="text-gray-600">{selectedIssue.location.address}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900">Reported By</h4>
                      <p className="text-gray-600">
                        {selectedIssue.createdBy.name}
                        {selectedIssue.createdBy.contact && (
                          <span className="block text-sm">{selectedIssue.createdBy.contact}</span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center text-sm text-gray-500">
                        <FiThumbsUp className="mr-1 h-4 w-4" />
                        <span>{selectedIssue.upvotes} upvotes</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(selectedIssue.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueManagement;