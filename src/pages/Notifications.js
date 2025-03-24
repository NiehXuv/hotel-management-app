import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

/**
 * Notifications Page Component
 * 
 * Centralized interface for displaying, filtering, and managing system notifications 
 * including task assignments, announcements, alerts, and reminders.
 * 
 * @module Pages/Notifications
 */
const Notifications = () => {
  const navigate = useNavigate();
  const { currentUser, hasPermission } = useAuth();
  
  // Component state declarations with explicit typing via JSDoc
  /**
   * @typedef {Object} Notification
   * @property {number} id - Unique identifier
   * @property {string} type - Notification category (task, announcement, alert, reminder)
   * @property {string} title - Brief notification title
   * @property {string} message - Detailed notification content
   * @property {string} timestamp - ISO timestamp of notification creation
   * @property {boolean} isRead - Whether notification has been read
   * @property {string} [priority] - Optional priority level (high, normal, low)
   * @property {Object} [metadata] - Optional related data (taskId, propertyId, etc.)
   */
  
  /** @type {[Notification[], function]} - State for notifications list */
  const [notifications, setNotifications] = useState([]);
  
  /** @type {[boolean, function]} - Loading state tracker */
  const [loading, setLoading] = useState(true);
  
  /** @type {[string, function]} - Active filter for notification type */
  const [filter, setFilter] = useState('all');

  /**
   * Fetches notifications from simulated API endpoint
   * In production this would connect to a real-time notification service
   */
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock notifications data with comprehensive structure
        const mockNotifications = [
          {
            id: 1,
            type: 'task',
            title: 'New Task Assigned',
            message: 'You have been assigned to clean room 304 at Sunrise Hotel by Emily Johnson.',
            timestamp: '2025-03-02T09:15:00',
            isRead: false,
            priority: 'high',
            metadata: {
              taskId: 1,
              propertyId: 1,
              propertyName: 'Sunrise Hotel',
              roomNumber: '304',
              assignedBy: 'Emily Johnson'
            }
          },
          {
            id: 2,
            type: 'announcement',
            title: 'Staff Meeting Reminder',
            message: 'Monthly staff meeting scheduled for March 5th, 2025 at 10:00 AM in the Conference Room. Attendance is mandatory.',
            timestamp: '2025-03-01T14:30:00',
            isRead: false,
            priority: 'normal',
            metadata: {
              eventDate: '2025-03-05T10:00:00',
              location: 'Conference Room'
            }
          },
          {
            id: 3,
            type: 'alert',
            title: 'Maintenance Issue Reported',
            message: 'A maintenance issue has been reported in Room 202 at Riverside Resort. Please check the task details for more information.',
            timestamp: '2025-03-01T10:45:00',
            isRead: true,
            priority: 'high',
            metadata: {
              taskId: 3,
              propertyId: 3,
              propertyName: 'Riverside Resort',
              roomNumber: '202',
              issueType: 'plumbing'
            }
          },
          {
            id: 4,
            type: 'reminder',
            title: 'Complete Your Timesheet',
            message: 'Please remember to submit your timesheet for the week ending March 1st, 2025.',
            timestamp: '2025-03-01T08:00:00',
            isRead: true,
            priority: 'normal',
            metadata: {
              dueDate: '2025-03-03T23:59:59'
            }
          },
          {
            id: 5,
            type: 'task',
            title: 'Task Status Updated',
            message: 'Task "Restock toiletries" has been marked as in progress.',
            timestamp: '2025-02-28T16:20:00',
            isRead: false,
            priority: 'normal',
            metadata: {
              taskId: 2,
              propertyId: 2,
              propertyName: 'Mountain View Lodge',
              status: 'in-progress',
              updatedBy: 'Maria Garcia'
            }
          },
          {
            id: 6,
            type: 'announcement',
            title: 'New Cleaning Protocol',
            message: 'Updated cleaning procedures for guest rooms are now available in the staff manual. Please review the changes before your next shift.',
            timestamp: '2025-02-28T11:15:00',
            isRead: false,
            priority: 'high',
            metadata: {
              documentId: 'CM-2025-03',
              documentUrl: '/documents/cleaning-manual-2025-03'
            }
          },
          {
            id: 7,
            type: 'alert',
            title: 'System Maintenance',
            message: 'The hotel management system will be undergoing maintenance on March 4th from 02:00 AM to 04:00 AM. Some features may be unavailable during this time.',
            timestamp: '2025-02-27T15:30:00',
            isRead: true,
            priority: 'normal',
            metadata: {
              maintenanceStart: '2025-03-04T02:00:00',
              maintenanceEnd: '2025-03-04T04:00:00',
              affectedSystems: ['bookings', 'payments']
            }
          },
          {
            id: 8,
            type: 'reminder',
            title: 'Training Session',
            message: 'Customer service training session scheduled for March 6th at 2:00 PM.',
            timestamp: '2025-02-27T09:45:00',
            isRead: true,
            priority: 'low',
            metadata: {
              eventDate: '2025-03-06T14:00:00',
              location: 'Training Room',
              duration: 90, // minutes
              trainer: 'External Consultant'
            }
          }
        ];
        
        setNotifications(mockNotifications);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, []);
  
  /**
   * Marks a notification as read and updates state
   * @param {number} notificationId - ID of notification to mark as read
   */
  const markAsRead = (notificationId) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true } 
          : notification
      )
    );
  };
  
  /**
   * Marks all notifications as read
   */
  const markAllAsRead = () => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => ({ ...notification, isRead: true }))
    );
  };
  
  /**
   * Handles notification click based on type and metadata
   * Routes to relevant pages or surfaces related content
   * 
   * @param {Notification} notification - The clicked notification
   */
  const handleNotificationClick = (notification) => {
    // Mark as read immediately
    markAsRead(notification.id);
    
    // Handle navigation based on notification type
    if (notification.type === 'task' && notification.metadata?.taskId) {
      navigate(`/tasks/${notification.metadata.taskId}`);
    } else if (notification.type === 'alert' && notification.metadata?.taskId) {
      navigate(`/tasks/${notification.metadata.taskId}`);
    } else if (notification.type === 'announcement' && notification.metadata?.documentUrl) {
      // In a real app, this might open a document viewer or redirect to a document
      console.log('Would navigate to document:', notification.metadata.documentUrl);
    }
  };
  
  /**
   * Applies filter to notifications list
   * @returns {Notification[]} Filtered notifications
   */
  const getFilteredNotifications = () => {
    if (filter === 'all') {
      return notifications;
    } else if (filter === 'unread') {
      return notifications.filter(notification => !notification.isRead);
    } else {
      return notifications.filter(notification => notification.type === filter);
    }
  };
  
  // Get filtered and sorted notifications (newest first)
  const filteredNotifications = getFilteredNotifications().sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );
  
  /**
   * Gets the count of unread notifications
   * @returns {number} Count of unread notifications
   */
  const getUnreadCount = () => {
    return notifications.filter(notification => !notification.isRead).length;
  };
  
  /**
   * Formats relative time for notification display
   * @param {string} timestamp - ISO timestamp string
   * @returns {string} Human-readable relative time
   */
  const formatRelativeTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 0) {
      return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    }
    if (diffHour > 0) {
      return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    }
    if (diffMin > 0) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    }
    return 'Just now';
  };
  
  /**
   * Renders the appropriate icon for a notification type
   * @param {string} type - Notification type
   * @returns {string} Emoji icon representation
   */
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task':
        return '✓';
      case 'announcement':
        return '📢';
      case 'alert':
        return '⚠️';
      case 'reminder':
        return '🔔';
      default:
        return '📄';
    }
  };
  
  /**
   * Determines background color class based on notification properties
   * @param {Notification} notification - Notification object
   * @returns {string} CSS class name for background styling
   */
  const getNotificationClass = (notification) => {
    if (!notification.isRead) {
      return 'bg-primary-color/5';
    }
    return '';
  };
  
  return (
    <div className="page-container pb-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Notifications</h1>
        
        {getUnreadCount() > 0 && (
          <Button 
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
          >
            Mark All Read
          </Button>
        )}
      </div>
      
      {/* Filter Tab Navigation */}
      <div className="flex border-b border-neutral-200 mb-4 overflow-x-auto">
        <button
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
            filter === 'all' 
              ? 'text-primary-color border-b-2 border-primary-color' 
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
          onClick={() => setFilter('all')}
        >
          All
          {notifications.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-neutral-200 rounded-full">
              {notifications.length}
            </span>
          )}
        </button>
        
        <button
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
            filter === 'unread' 
              ? 'text-primary-color border-b-2 border-primary-color' 
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
          onClick={() => setFilter('unread')}
        >
          Unread
          {getUnreadCount() > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary-color/20 text-primary-color rounded-full">
              {getUnreadCount()}
            </span>
          )}
        </button>
        
        <button
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
            filter === 'task' 
              ? 'text-primary-color border-b-2 border-primary-color' 
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
          onClick={() => setFilter('task')}
        >
          Tasks
        </button>
        
        <button
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
            filter === 'announcement' 
              ? 'text-primary-color border-b-2 border-primary-color' 
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
          onClick={() => setFilter('announcement')}
        >
          Announcements
        </button>
        
        <button
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
            filter === 'alert' 
              ? 'text-primary-color border-b-2 border-primary-color' 
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
          onClick={() => setFilter('alert')}
        >
          Alerts
        </button>
      </div>
      
      {/* Notifications List */}
      <div>
        {loading ? (
          <div className="text-center py-8">
            <p className="text-neutral-600">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length > 0 ? (
          <Card>
            {filteredNotifications.map((notification) => (
              <div 
                key={notification.id}
                className={`py-3 px-1 border-b border-neutral-100 last:border-0 ${getNotificationClass(notification)}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start">
                  {/* Notification status indicator */}
                  {!notification.isRead && (
                    <span className="h-2 w-2 mt-2 rounded-full bg-primary-color flex-shrink-0 mr-2"></span>
                  )}
                  
                  {/* Notification icon */}
                  <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center mr-3 flex-shrink-0">
                    <span role="img" aria-label={notification.type}>
                      {getNotificationIcon(notification.type)}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    {/* Notification header */}
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`font-medium ${!notification.isRead ? 'text-neutral-900' : 'text-neutral-700'}`}>
                        {notification.title}
                      </h3>
                      <span className="text-xs text-neutral-500 ml-2 whitespace-nowrap">
                        {formatRelativeTime(notification.timestamp)}
                      </span>
                    </div>
                    
                    {/* Notification message */}
                    <p className={`text-sm mb-1 ${!notification.isRead ? 'text-neutral-800' : 'text-neutral-600'}`}>
                      {notification.message}
                    </p>
                    
                    {/* Notification metadata - conditional rendering */}
                    {notification.metadata && (
                      <div className="text-xs text-neutral-500">
                        {notification.metadata.propertyName && (
                          <span className="mr-3">📍 {notification.metadata.propertyName}</span>
                        )}
                        {notification.metadata.roomNumber && (
                          <span className="mr-3">🚪 Room {notification.metadata.roomNumber}</span>
                        )}
                        {notification.metadata.eventDate && (
                          <span className="mr-3">
                            📅 {new Date(notification.metadata.eventDate).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        )}
                        {notification.metadata.dueDate && (
                          <span className="mr-3">
                            ⏰ Due: {new Date(notification.metadata.dueDate).toLocaleDateString('en-US')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </Card>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="text-4xl mb-4">🔔</div>
            <h3 className="text-lg font-medium text-neutral-800 mb-2">No notifications</h3>
            <p className="text-neutral-600">
              {filter === 'all' 
                ? 'You don\'t have any notifications at the moment.' 
                : `You don't have any ${filter === 'unread' ? 'unread' : filter} notifications.`}
            </p>
            {filter !== 'all' && (
              <Button 
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setFilter('all')}
              >
                View All Notifications
              </Button>
            )}
          </div>
        )}
      </div>
      
      {/* Create Announcement - For Managers and Bosses */}
      {hasPermission('canCreateTasks') && (
        <div className="mt-6">
          <Button 
            variant="primary"
            fullWidth
          >
            Create Announcement
          </Button>
        </div>
      )}
    </div>
  );
};

export default Notifications;