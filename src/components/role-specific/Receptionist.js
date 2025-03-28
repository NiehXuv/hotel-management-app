import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';
import { StatusBadge } from '../common/Badge';
import { FaCalendarWeek } from 'react-icons/fa';

/**
 * Receptionist Dashboard Component
 * 
 * Specialized dashboard for front desk staff focused on guest management,
 * room status tracking, and booking operations.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.statistics - Statistics data to display on dashboard
 */
const ReceptionistDashboard = ({ statistics }) => {
  const navigate = useNavigate();
  const [hotelId, setHotelId] = useState(1); // Default hotel ID
  const [hotelData, setHotelData] = useState({
    name: '',
    totalRooms: 0,
    occupiedRooms: 0,
    availableRooms: 0,
  });

  // Styles matching BossManagerDashboard
  const styles = {
    pageContainer: {
      paddingBottom: '2em',
      width: '100%',
      maxWidth: '480px',
      marginBottom: '4em',
    },
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
      marginBottom: '16px',
    },
    card: {
      marginBottom: '16px',
      padding: '16px',
      backgroundColor: 'white',
      borderRadius: '2em',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
    metricCard: {
      backgroundColor: 'white',
      borderRadius: '1em',
      padding: '16px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
    metricTitle: {
      fontSize: '1em',
      fontWeight: '600',
      color: '#666',
      marginBottom: '8px',
    },
    metricValue: {
      fontSize: '1.6em',
      fontWeight: '700',
      color: '#111827',
      marginBottom: '4px',
    },
    metricSubtext: {
      fontSize: '12px',
      color: '#999',
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '12px',
    },
    flexContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '12px',
    },
    flexItem: {
      flex: 1,
      textAlign: 'center',
    },
    button: {
      margin: '0.4em auto',
      display: 'block',
      padding: '0.2em 0.8em',
      backgroundColor: '#FFD167',
      color: '#fff',
      border: 'none',
      borderRadius: '2em',
      fontSize: '16px',
      cursor: 'pointer',
      textAlign: 'center',
    },
    bookingItem: {
      padding: '12px 0',
      borderBottom: '1px solid #f0f0f0',
    },
    bookingHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px',
    },
    bookingGuest: {
      fontSize: '16px',
      fontWeight: '500',
      color: '#111827',
    },
    bookingDetails: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    bookingInfo: {
      fontSize: '14px',
      color: '#666',
    },
  };

  // Fetch hotel-specific data when hotelId changes
  useEffect(() => {
    const fetchHotelData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/hotels/${hotelId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch hotel data');
        }
        const json = await response.json();

        if (json.success) {
          setHotelData({
            name: json.data.name,
            totalRooms: json.data.roomStatistics.totalRooms,
            occupiedRooms: json.data.roomStatistics.occupiedRooms,
            availableRooms: json.data.roomStatistics.availableRooms,
          });
        }
      } catch (error) {
        console.error('Error fetching hotel data:', error);
      }
    };

    fetchHotelData();
  }, [hotelId]);

  // Navigation handlers
  const handleViewBooking = () => navigate('/booking');
  const handleViewCalendar = () => navigate('/calendar');
  const handleChangeHotel = () => navigate('/properties');
  const handleViewRoom = () => navigate('/properties/1/rooms');

  // Map the recent bookings to the expected fields and take the last 4
  const recentFourBookings = statistics.recentBookings
    .map(booking => ({
      id: booking.customerId + booking.bookIn,
      guest: booking.customerId,
      roomNumber: booking.roomId,
      checkIn: booking.bookIn,
      checkOut: booking.bookOut,
      status: booking.bookingStatus ? booking.bookingStatus.toLowerCase() : 'unknown',
    }))
    .slice(-4);

  // Format date helper
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div style={styles.pageContainer}>
      {/* Action Buttons */}
      <div style={styles.gridContainer}>
        <Button
          variant="outline"
          onClick={handleViewCalendar}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <FaCalendarWeek style={{ marginRight: '8px' }} />
          View Calendar
        </Button>
      </div>

      {/* Today's Statistics */}
      <div style={styles.gridContainer}>
        <Card style={styles.metricCard}>
          <h3 style={styles.metricTitle}>Check-ins Today</h3>
          <p style={styles.metricValue}>{statistics.checkinsToday}</p>
          <p style={styles.metricSubtext}>🛎️</p>
        </Card>

        <Card style={styles.metricCard}>
          <h3 style={styles.metricTitle}>Check-outs Today</h3>
          <p style={styles.metricValue}>{statistics.checkoutsToday}</p>
          <p style={styles.metricSubtext}>🔑</p>
        </Card>
      </div>

      {/* Room Status */}
      <Card style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={styles.sectionTitle}>{hotelData.name || `Hotel ${hotelId}`}</h2>
        </div>
        <div style={styles.flexContainer}>
          <div style={styles.flexItem}>
            <h3 style={styles.metricTitle}>Total Rooms</h3>
            <p style={styles.metricValue}>{hotelData.totalRooms}</p>
          </div>
          <div style={styles.flexItem}>
            <h3 style={styles.metricTitle}>Available</h3>
            <p style={styles.metricValue}>{hotelData.availableRooms}</p>
          </div>
          <div style={styles.flexItem}>
            <h3 style={styles.metricTitle}>Occupied</h3>
            <p style={styles.metricValue}>{hotelData.occupiedRooms}</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleViewRoom}
          style={styles.button}
        >
          View All Rooms
        </Button>
      </Card>

      {/* Recent Bookings */}
      <Card style={styles.card}>
        <h2 style={styles.sectionTitle}>Recent Bookings</h2>
        {recentFourBookings.length > 0 ? (
          <div>
            {recentFourBookings.map((booking) => (
              <div key={booking.id} style={styles.bookingItem}>
                <div style={styles.bookingHeader}>
                  <h3 style={styles.bookingGuest}>{booking.guest}</h3>
                  <StatusBadge status={booking.status} />
                </div>
                <div style={styles.bookingDetails}>
                  <div>
                    <span style={styles.bookingInfo}>Room {booking.roomNumber}</span>
                    <span style={{ ...styles.bookingInfo, marginLeft: '8px' }}>
                      {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                    </span>
                  </div>
                  <div>
                    {booking.status === 'pending' && (
                      <Button
                        variant="success"
                        size="sm"
                        style={{ padding: '4px 12px', fontSize: '14px' }}
                      >
                        Check In
                      </Button>
                    )}
                    {booking.status === 'confirmed' &&
                      new Date(booking.checkOut).toDateString() === new Date().toDateString() && (
                        <Button
                          variant="secondary"
                          size="sm"
                          style={{ padding: '4px 12px', fontSize: '14px' }}
                        >
                          Check Out
                        </Button>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#999', padding: '16px 0' }}>
            No recent bookings
          </p>
        )}
        <div style={{ ...styles.gridContainer, marginTop: '16px' }}>
          <Button variant="primary" style={styles.button}>
            New Booking
          </Button>
          <Button
            variant="outline"
            onClick={handleViewBooking}
            style={styles.button}
          >
            All Bookings
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ReceptionistDashboard;