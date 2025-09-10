import React, { useState, useEffect } from 'react';
import { 
  FiAlertCircle, 
  FiCheckCircle, 
  FiClock,
  FiMapPin,
  FiFileText
} from 'react-icons/fi';
import StatCard from '../components/Dashboard/StatCard';
import api from '../services/api';

const Dashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState({
    activeTickets: 0,
    resolvedToday: 0,
    inProgress: 0,
    totalTickets: 0,
    totalUsers: 0,
    totalTechnicians: 0
  });
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch analytics data
        const analyticsData = await api.analytics.getAnalytics();
        setAnalytics(analyticsData);
        
        // Fetch recent tickets for display
        const ticketsResponse = await api.tickets.getTickets();
        const allTickets = ticketsResponse.tickets || [];
        // Get the 5 most recent tickets for dashboard
        setTickets(allTickets.slice(0, 5));
        
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate category stats from tickets
  const categories = ['Water', 'Electricity', 'Roads', 'Sanitation'];
  const categoryStats = categories.map(category => ({
    name: category,
    count: tickets.filter((ticket: any) => 
      ticket.issue_category?.toLowerCase() === category.toLowerCase()
    ).length
  }));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <FiAlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Overview of municipal issues and system performance
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Issues"
          value={analytics.totalTickets}
          helpText="All reported issues"
          icon={<FiFileText className="h-6 w-6" />}
          trend={{ value: 12, label: "from last month", isPositive: true }}
        />
        <StatCard
          title="Active Issues"
          value={analytics.activeTickets}
          helpText="Open and in-progress issues"
          icon={<FiAlertCircle className="h-6 w-6" />}
          trend={{ value: -5, label: "from last week", isPositive: false }}
        />
        <StatCard
          title="In Progress"
          value={analytics.inProgress}
          helpText="Currently being resolved"
          icon={<FiClock className="h-6 w-6" />}
          trend={{ value: 8, label: "from yesterday", isPositive: true }}
        />
        <StatCard
          title="Resolved Today"
          value={analytics.resolvedToday}
          helpText="Completed issues"
          icon={<FiCheckCircle className="h-6 w-6" />}
          trend={{ value: 15, label: "from yesterday", isPositive: true }}
        />
      </div>

      {/* Charts and Data Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Issues by Category
            </h3>
            <div className="space-y-4">
              {categoryStats.map((category, index) => {
                const percentage = analytics.totalTickets > 0 ? (category.count / analytics.totalTickets) * 100 : 0;
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500'];
                return (
                  <div key={category.name} className="flex items-center">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-900">{category.name}</span>
                        <span className="text-gray-500">{category.count} issues</span>
                      </div>
                      <div className="mt-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`${colors[index]} h-2 rounded-full transition-all duration-300`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Issues */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Issues
            </h3>
            <div className="space-y-4">
              {tickets.map((ticket: any) => (
                <div key={ticket._id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      ticket.urgency === 'critical' 
                        ? 'bg-red-100 text-red-800'
                        : ticket.urgency === 'moderate'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {ticket.urgency}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {ticket.issue_name}
                    </p>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <FiMapPin className="mr-1 h-3 w-3" />
                      <span className="truncate">{ticket.location.address}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      ticket.status === 'resolved'
                        ? 'bg-green-100 text-green-800'
                        : ticket.status === 'in process'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Performance Metrics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-semibold text-blue-600">2.5</div>
              <div className="text-sm text-gray-500">Avg Resolution Time (days)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-green-600">94%</div>
              <div className="text-sm text-gray-500">Satisfaction Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-purple-600">18</div>
              <div className="text-sm text-gray-500">Active Technicians</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;