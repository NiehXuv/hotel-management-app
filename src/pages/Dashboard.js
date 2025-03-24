import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
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
  const { currentUser, getDashboardAccess } = useAuth();
  
  // Get user's role and accessible dashboard sections
  const userRole = currentUser?.role || '';
  const dashboardAccess = getDashboardAccess();
  
  // State to hold statistics
  const [statistics, setStatistics] = useState({
    totalProperties: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    occupancyRate: 0,
    activeProperties: 10,
    pendingTasks: 8,
    criticalTasks: 2,
    monthlyRevenue: 42500,
    pendingInvoices: 5,
  });
  
  // Fetch data when the component mounts
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await fetch('http://localhost:5000/hotels');
        if (!response.ok) {
          throw new Error('Failed to fetch statistics');
        }
        const json = await response.json();
        if (json.success) {
          setStatistics(prev => ({
            ...prev,
            totalProperties: json.statistics.totalProperties,
            totalRooms: json.statistics.totalRooms,
            occupiedRooms: json.statistics.occupiedRooms,
            occupancyRate: json.statistics.occupancyRate,
          }));
        } else {
          throw new Error(json.error || 'Failed to fetch statistics');
        }
      } catch (error) {
        console.error('Error fetching statistics:', error);
      }
    };

    fetchStatistics();
  }, []); // Empty dependency array to run once on mount
  
  // Render role-specific dashboard based on user role
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
        return <BossManagerDashboard statistics={statistics} />;
    }
  };
  
  // Dynamic styles for layout
  const getContainerStyles = () => {
    const windowWidth = window.innerWidth;
    const isLargeScreen = windowWidth > 480;
  
    return {
      width: '100vw',
      maxWidth: isLargeScreen ? '480px' : '100%',
      margin: isLargeScreen ? '0 auto' : '0',
      paddingBottom: '70px', // Space for BottomNavigation
      boxSizing: 'border-box',
      minHeight: '100vh', // Full viewport height
    };
  };
  
  return (
    <div className="page-container" style={getContainerStyles()}>
      {/* Greeting Section */}
      <div className="mb-6">
        <h1 className="text-xl font-bold">Welcome, {currentUser?.name}!</h1>
        <p className="text-neutral-600">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
      
      {/* Role-specific Dashboard */}
      {renderRoleSpecificDashboard()}
    </div>
  );
};

export default Dashboard;