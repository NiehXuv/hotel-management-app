import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { StatusBadge } from '../components/common/Badge';

// Import role-specific dashboard components
import BossManagerDashboard from '../components/role-specific/BossManager';
import SalesDashboard from '../components/role-specific/Sales';
import AccountantDashboard from '../components/role-specific/Accountant';
import ReceptionistDashboard from '../components/role-specific/Receptionist';
import CleanerDashboard from '../components/role-specific/Cleaner';

/**
 * Dashboard Page Component
 * Shows role-specific dashboard with relevant widgets and statistics
 */
const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser, getDashboardAccess } = useAuth();
  
  // Get user's role and accessible dashboard sections
  const userRole = currentUser?.role || '';
  const dashboardAccess = getDashboardAccess();
  
  // Mock data for dashboard
  const statistics = {
    totalProperties: 12,
    activeProperties: 10,
    totalRooms: 87,
    occupiedRooms: 64,
    occupancyRate: 73.6,
    pendingTasks: 8,
    criticalTasks: 2,
    monthlyRevenue: 42500,
    pendingInvoices: 5,
  };
  
  // Mock tasks data
  const recentTasks = [
    { id: 1, title: 'Clean room 304', property: 'Sunrise Hotel', priority: 'high', status: 'pending', dueDate: '2025-03-03' },
    { id: 2, title: 'Restock toiletries', property: 'Mountain View Lodge', priority: 'normal', status: 'pending', dueDate: '2025-03-02' },
    { id: 3, title: 'Fix shower in room 202', property: 'Riverside Resort', priority: 'critical', status: 'assigned', dueDate: '2025-03-02' },
    { id: 4, title: 'Replace bedsheets in room 101', property: 'Sunrise Hotel', priority: 'normal', status: 'completed', dueDate: '2025-03-01' },
  ];
  
  // Mock notifications
  const notifications = [
    { id: 1, message: 'New booking for Mountain View Lodge', time: '10 minutes ago', isRead: false },
    { id: 2, message: 'Task assigned: Clean room 304', time: '1 hour ago', isRead: false },
    { id: 3, message: 'Monthly report ready for review', time: '3 hours ago', isRead: true },
  ];
  
  // Handle navigation to task details
  const navigateToTask = (taskId) => {
    navigate(`/tasks/${taskId}`);
  };
  
  // Handle navigation to all tasks
  const navigateToAllTasks = () => {
    navigate('/tasks');
  };
  
  // Handle navigation to notifications
  const navigateToNotifications = () => {
    navigate('/notifications');
  };
  
  // Render role-specific dashboard
  const renderRoleSpecificDashboard = () => {
    switch (userRole) {
      case 'boss':
      case 'manager':
        return <BossManagerDashboard statistics={statistics} />;
      case 'sales':
        return <SalesDashboard statistics={statistics} />;
      case 'accountant':
        return <AccountantDashboard statistics={statistics} />;
      case 'receptionist':
        return <ReceptionistDashboard statistics={statistics} />;
      case 'cleaner':
      case 'host':
        return <CleanerDashboard statistics={statistics} />;
      default:
        return null;
    }
  };
  
  // Check if user has access to a specific dashboard section
  const hasAccess = (section) => {
    return dashboardAccess.includes(section);
  };
  
  return (
    <div className="page-container pb-6">
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-xl font-bold">Welcome, {currentUser?.name}!</h1>
        <p className="text-neutral-600">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
      
      {/* Role-specific Dashboard */}
      {renderRoleSpecificDashboard()}
      
      {/* Tasks Section */}
      {hasAccess('tasks') && (
        <Card
          header={
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Recent Tasks</h2>
              {recentTasks.length > 0 && (
                <Button 
                  variant="text" 
                  size="sm"
                  onClick={navigateToAllTasks}
                >
                  View All
                </Button>
              )}
            </div>
          }
        >
          {recentTasks.length > 0 ? (
            <div>
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="py-3 border-b border-neutral-100 last:border-0"
                  onClick={() => navigateToTask(task.id)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium">{task.title}</h3>
                    <StatusBadge status={task.status} />
                  </div>
                  <p className="text-sm text-neutral-600 mb-1">{task.property}</p>
                  <div className="flex justify-between items-center">
                    <StatusBadge status={task.priority} size="sm" />
                    <span className="text-xs text-neutral-500">Due: {task.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-4 text-neutral-500">No tasks available</p>
          )}
        </Card>
      )}
      
      {/* Notifications Section */}
      <Card
        header={
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Recent Notifications</h2>
            {notifications.length > 0 && (
              <Button 
                variant="text" 
                size="sm"
                onClick={navigateToNotifications}
              >
                View All
              </Button>
            )}
          </div>
        }
        className="mt-4"
      >
        {notifications.length > 0 ? (
          <div>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`py-3 border-b border-neutral-100 last:border-0 ${
                  !notification.isRead ? 'bg-primary-color/5' : ''
                }`}
              >
                <div className="flex items-start">
                  {!notification.isRead && (
                    <span className="h-2 w-2 mt-1.5 rounded-full bg-primary-color flex-shrink-0 mr-2"></span>
                  )}
                  <div className="flex-1">
                    <p className={`${!notification.isRead ? 'font-medium' : ''}`}>
                      {notification.message}
                    </p>
                    <span className="text-xs text-neutral-500">{notification.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-4 text-neutral-500">No notifications</p>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;