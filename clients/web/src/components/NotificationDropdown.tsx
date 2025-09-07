import React, { useState, useRef, useEffect } from 'react';
import { 
  FiBell, 
  FiX, 
  FiAlertCircle, 
  FiClock,
  FiUsers
} from 'react-icons/fi';
import api from '../services/api';

interface Notification {
  _id: string;
  type: 'ticket' | 'user' | 'system' | 'issue_unclassified' | 'llm_assignment_pending' | 'no_technicians_available' | 'manual_assignment_required';
  title: string;
  message: string;
  data: any;
  read: boolean;
  actionable?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
}

const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await api.admin.getNotifications({ limit: 10 });
        setNotifications(response.notifications || []);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        // Keep notifications as empty array if error
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'ticket':
        return <FiAlertCircle className="h-5 w-5 text-red-500" />;
      case 'user':
        return <FiUsers className="h-5 w-5 text-blue-500" />;
      case 'system':
        return <FiClock className="h-5 w-5 text-gray-500" />;
      case 'issue_unclassified':
        return <FiAlertCircle className="h-5 w-5 text-orange-500" />;
      case 'llm_assignment_pending':
        return <FiUser className="h-5 w-5 text-purple-500" />;
      case 'no_technicians_available':
        return <FiUsers className="h-5 w-5 text-red-600" />;
      case 'manual_assignment_required':
        return <FiAlertCircle className="h-5 w-5 text-amber-500" />;
      default:
        return <FiBell className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffMs = now.getTime() - notifTime.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffHours / 24;

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h ago`;
    } else if (diffDays < 7) {
      return `${Math.floor(diffDays)}d ago`;
    } else {
      return notifTime.toLocaleDateString();
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.admin.markNotificationRead(id);
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Mark all notifications as read
      await Promise.all(
        notifications
          .filter(n => !n.read)
          .map(n => api.admin.markNotificationRead(n._id))
      );
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n._id !== id));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
      >
        <FiBell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <FiBell className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
                <p className="mt-1 text-sm text-gray-500">All caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-4 ${getPriorityBorderColor(notification.priority, notification.actionable)} ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => markAsRead(notification._id)}
                  >
  const getPriorityBorderColor = (priority: string | undefined, actionable: boolean | undefined) => {
    if (actionable) {
      switch (priority) {
        case 'critical':
          return 'border-l-red-600';
        case 'high':
          return 'border-l-orange-500';
        case 'medium':
          return 'border-l-blue-500';
        case 'low':
          return 'border-l-green-500';
        default:
          return 'border-l-blue-400';
      }
    }
    return 'border-l-blue-400';
  };
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <p className={`text-sm font-medium ${
                          !notification.read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </p>
                        <p className={`text-sm ${
                          !notification.read ? 'text-gray-700' : 'text-gray-500'
                        }`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTimestamp(notification.createdAt)}
                        </p>
                        {notification.actionable && (
                          <div className="mt-2 flex space-x-2">
                            {notification.type === 'issue_unclassified' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Handle manual classification
                                  window.location.href = `/issues/${notification.data.ticketId}`;
                                }}
                                className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                              >
                                Classify & Assign
                              </button>
                            )}
                            {notification.type === 'llm_assignment_pending' && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle assignment approval
                                    window.location.href = `/issues/${notification.data.ticketId}?action=approve`;
                                  }}
                                  className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle assignment rejection
                                    window.location.href = `/issues/${notification.data.ticketId}?action=manual`;
                                  }}
                                  className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700"
                                >
                                  Manual
                                </button>
                              </>
                            )}
                            {(notification.type === 'no_technicians_available' || notification.type === 'manual_assignment_required') && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Handle manual assignment
                                  window.location.href = `/issues/${notification.data.ticketId}?action=assign`;
                                }}
                                className="text-xs bg-orange-600 text-white px-2 py-1 rounded hover:bg-orange-700"
                              >
                                Assign Manually
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="ml-2 flex-shrink-0 flex items-center space-x-2">
                        {!notification.read && (
                          <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification._id);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <FiX className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 text-center">
              <button className="text-sm text-blue-600 hover:text-blue-800">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;