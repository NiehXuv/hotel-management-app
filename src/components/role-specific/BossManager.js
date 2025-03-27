import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';
import { FaCalendarWeek } from 'react-icons/fa';

const BossManagerDashboard = ({ statistics }) => {
  const navigate = useNavigate();

  const styles = {
    pageContainer: {
      paddingBottom: '2em',
      padding: '0.2em',
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
  };

  const handleViewCalendar = () => {
    navigate('/calendar');
  };

  const handleViewProperties = () => {
    navigate('/properties');
  };

  const handleViewReports = () => {
    navigate('/reports');
  };

  const handleViewUsers = () => {
    navigate('/users');
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

      {/* Key Statistics */}
      <div style={styles.gridContainer}>
        <Card style={styles.metricCard}>
          <h3 style={styles.metricTitle}>Occupancy Rate</h3>
          <p style={styles.metricValue}>{statistics.occupancyRate}%</p>
          <p style={styles.metricSubtext}>
            {statistics.occupiedRooms} of {statistics.totalRooms} rooms
          </p>
        </Card>
        
        <Card style={styles.metricCard}>
          <h3 style={styles.metricTitle}>Pending Tasks</h3>
          <p style={styles.metricValue}>{statistics.pendingTasks}</p>
          <p style={styles.metricSubtext}>
            {statistics.criticalTasks} critical
          </p>
        </Card>
      </div>

      {/* Properties Overview */}
      <Card style={styles.card}>
        <h2 style={styles.sectionTitle}>Properties Overview</h2>
        <div style={styles.flexContainer}>
          <div style={styles.flexItem}>
            <h3 style={styles.metricTitle}>Total Properties</h3>
            <p style={styles.metricValue}>{statistics.totalProperties}</p>
          </div>
          <div style={styles.flexItem}>
            <h3 style={styles.metricTitle}>Total Rooms</h3>
            <p style={styles.metricValue}>{statistics.totalRooms}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={handleViewProperties}
          style={styles.button}
        >
          Property Details
        </Button>
      </Card>

      {/* Financial Overview */}
      <Card style={styles.card}>
        <h2 style={styles.sectionTitle}>Financial Overview</h2>
        <div style={styles.flexContainer}>
          <div style={styles.flexItem}>
            <h3 style={styles.metricTitle}>Monthly Revenue</h3>
            <p style={styles.metricValue}>${statistics.monthlyRevenue.toLocaleString()}</p>
          </div>
          <div style={styles.flexItem}>
            <h3 style={styles.metricTitle}>Pending Invoices</h3>
            <p style={styles.metricValue}>{statistics.pendingInvoices}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={handleViewReports}
          style={styles.button}
        >
          View Reports
        </Button>
      </Card>

      {/* Staff Section - Commented out but styled for consistency */}
      {/* <Card style={styles.card}>
        <h2 style={styles.sectionTitle}>Staff Overview</h2>
        <div style={{ ...styles.flexContainer, gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#42A5F5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              marginRight: '8px'
            }}>
              👨‍💼
            </div>
            <div>
              <h3 style={styles.metricTitle}>Managers</h3>
              <p style={styles.metricSubtext}>3 active</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              marginRight: '8px'
            }}>
              🧹
            </div>
            <div>
              <h3 style={styles.metricTitle}>Cleaners</h3>
              <p style={styles.metricSubtext}>8 active</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#3B82F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              marginRight: '8px'
            }}>
              💁‍♀️
            </div>
            <div>
              <h3 style={styles.metricTitle}>Reception</h3>
              <p style={styles.metricSubtext}>5 active</p>
            </div>
          </divcountries>
        </div>
        <Button 
          variant="outline" 
          onClick={handleViewUsers}
          style={{ width: '100%' }}
        >
          Manage Staff
        </Button>
      </Card> */}
    </div>
  );
};

export default BossManagerDashboard;