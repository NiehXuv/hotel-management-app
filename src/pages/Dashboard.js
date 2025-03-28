import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import BossManagerDashboard from '../components/role-specific/BossManager';
import SalesDashboard from '../components/role-specific/Sales';
import ReceptionistDashboard from '../components/role-specific/Receptionist';

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
    activeProperties: 0,
    pendingTasks: 0,
    criticalTasks: 0,
    monthlyRevenue: 0,
    pendingInvoices: 0,
    topProperty: { name: 'N/A', revenue: 0 },
    checkinsToday: 0,
    checkoutsToday: 0,
    recentBookings: [],
  });

  // State for error handling and loading
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Date range for financial data (default to last 30 days)
  const [dateRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    };
  });

  // Fetch booking and hotel data (no dependency on dateRange)
  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        const url = new URL('http://localhost:5000/booking/list');

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch booking data: ${response.status} ${response.statusText}`);
        }
        const json = await response.json();

        console.log('Booking data response:', json);

        // Check if the response has the expected structure
        if (!json.bookings) {
          throw new Error('Invalid response structure: bookings field missing');
        }

        // Convert the bookings object to an array of booking objects
        const bookings = Object.values(json.bookings);

        setStatistics(prev => ({
          ...prev,
          recentBookings: bookings,
          checkinsToday: json.checkinsToday || 0,
          checkoutsToday: json.checkoutsToday || 0,
        }));
        setError(null);
      } catch (error) {
        console.error('Error fetching booking data:', error.message);
        setError(`Failed to load booking data: ${error.message}. Please try again later.`);
      }
    };

    const fetchHotelData = async () => {
      try {
        const response = await fetch('http://localhost:5000/hotels');
        if (!response.ok) {
          throw new Error(`Failed to fetch hotel statistics: ${response.status} ${response.statusText}`);
        }
        const json = await response.json();

        console.log('Hotel data response:', json);

        if (json.success) {
          setStatistics(prev => ({
            ...prev,
            totalProperties: json.statistics.totalProperties,
            totalRooms: json.statistics.totalRooms,
            occupiedRooms: json.statistics.occupiedRooms,
            occupancyRate: json.statistics.occupancyRate,
            activeProperties: json.statistics.totalProperties,
          }));
          setError(null);
        } else {
          throw new Error(json.error || 'Failed to fetch hotel statistics');
        }
      } catch (error) {
        console.error('Error fetching hotel statistics:', error.message);
        setError(`Failed to load hotel statistics: ${error.message}. Please try again later.`);
      }
    };

    const fetchAll = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchBookingData(), fetchHotelData()]);
      } catch (error) {
        console.error('Error in fetchAll:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []); // No dependencies, runs once on mount

  // Fetch financial data (depends on dateRange)
  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        const url = new URL('http://localhost:5000/financial');
        url.searchParams.append('startDate', dateRange.startDate);
        url.searchParams.append('endDate', dateRange.endDate);

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch financial data: ${response.status} ${response.statusText}`);
        }
        const json = await response.json();

        console.log('Financial data response:', json);

        if (json.success) {
          setStatistics(prev => ({
            ...prev,
            monthlyRevenue: json.data.totalRevenue,
            topProperty: json.data.topProperty,
          }));
          setError(null);
        } else {
          throw new Error(json.error || 'Failed to fetch financial data');
        }
      } catch (error) {
        console.error('Error fetching financial data:', error.message);
        setError(`Failed to load financial data: ${error.message}. Please try again later.`);
      }
    };

    fetchFinancialData();
  }, [dateRange]); // Dependency on dateRange

  // Render role-specific dashboard based on user role
  const renderRoleSpecificDashboard = () => {
    switch (userRole) {
      case 'boss':
      case 'manager':
        return <BossManagerDashboard statistics={statistics} />;
      case 'sales':
        return <SalesDashboard statistics={statistics} />;
      case 'receptionist':
        return <ReceptionistDashboard statistics={statistics} />;
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
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Loading Indicator */}
      {loading ? (
        <div className="text-center py-4">
          <p className="text-neutral-600">Loading dashboard...</p>
        </div>
      ) : (
        <>
          {/* Greeting Section */}
          <div className="mb-6">
            <h1 className="text-xl font-bold">Welcome, {currentUser?.name}!</h1>
            <p className="text-neutral-600">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          {/* Role-specific Dashboard */}
          {renderRoleSpecificDashboard()}
        </>
      )}
    </div>
  );
};

export default Dashboard;