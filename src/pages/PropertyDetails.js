import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { StatusBadge } from '../components/common/Badge';

/**
 * PropertyDetails Page Component
 * 
 * Provides an interface for viewing a specific property's details, key metrics,
 * recent activities, active issues, and room equipment across multiple tabs.
 * 
 * @module Pages/PropertyDetails
 */
const PropertyDetails = () => {
  // Define styles object
  const styles = {
    pageContainer: {
      paddingBottom: '2em',
      padding:'1em',
      width: '100vw',
      maxWidth: '480px',
      marginBottom: '4em',
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '48px 0',
    },
    loadingText: {
      color: '#666',
    },
    errorContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '48px 0',
    },
    errorText: {
      color: '#dc2626',
      marginBottom: '16px',
    },
    headerContainer: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '8px',
    },
    backButton: {
      marginRight: '1em',
      padding: '0.5empx',
      borderRadius: '1em',
      cursor: 'pointer',
      border: 'none',
      backgroundColor: 'transparent',
    },
    backButtonHover: {
      backgroundColor: '#e5e7eb',
    },
    headerTitle: {
      fontSize: '20px',
      fontWeight: '700',
    },
    editButton: {
      display: 'block',
      padding: '0.4em 0.8em',
      backgroundColor: '#FFD167',
      color: '#fff',
      border: 'none',
      borderRadius: '2em',
      fontSize: '14px',
      cursor: 'pointer',
      textAlign: 'center',
    },
    viewRoomButton: {
      padding: '0.4em 0.8em',
      backgroundColor: '#FFD167',
      color: '#fff',
      border: 'none',
      borderRadius: '2em',
      fontSize: '16px',
      cursor: 'pointer',
      textAlign: 'center',
      width: 'fit-content', // Ensures the button only takes the width of its content
      margin: '0 auto', // Centers the button horizontally
      display: 'block', // Still works with margin: '0 auto' for centering
    },
    detailsCard: {
      marginBottom: '16px',
      padding: '16px',
      display: 'flex',
      justifyContent: 'space-between', // Ensures left and right sections are spaced apart
      alignItems: 'center',
    },
    detailsLeft: {
      display: 'flex',
      flexDirection: 'column',
    },
    addressText: {
      fontSize: '14px',
      color: '#666',
      marginBottom: '4px',
    },
    statusContainer: {
      fontSize: '18px',
      display: 'flex',
      alignItems: 'center',
      marginTop: '4px',
    },
    roomCountText: {
      fontSize: '12px',
      color: '#999',
      marginLeft: '8px',
    },
    
    tabContainer: {
      display: 'flex',
      borderBottom: '1px solid #e5e7eb',
      marginBottom: '16px',
      overflowX: 'auto',
    },
    tabButton: {
      padding: '8px 16px',
      fontSize:  '15px',
      fontWeight: '500',
      whiteSpace: 'nowrap',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#666',
    },
    tabButtonActive: {
      color: '#3b82f6',
      borderBottom: '2px #42A5F5',

    },
    tabButtonHover: {
      color: '#111827',
    },
    metricsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
      marginBottom: '16px',
    },
    metricCard: {
      backgroundColor: 'white',
      borderRadius: '1em',
      padding: '16px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
    metricTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#666',
      marginBottom: '8px',
    },
    metricValue: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#111827',
      marginBottom: '4px',
    },
    metricSubtext: {
      fontSize: '12px',
      color: '#999',
    },
    roomStatusCard: {
      marginBottom: '16px',
      padding: '16px',
      backgroundColor: 'white',
      borderRadius: '1em',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
    roomStatusTitle: {
      fontSize: '16px',
      fontWeight: '600',
      marginBottom: '12px',
    },
    roomStatusGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '8px',
      marginBottom: '1em',
    },
    statusBox: {
      textAlign: 'center',
      padding: '0.2em',
      paddingTop: '1em',
      backgroundColor: '#fff',
      borderRadius: '0.5em',
      border: '1px solid #e5e7eb',
    },
    statusValue: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#111827',
    },
    statusLabel: {
      fontSize: '12px',
      color: '#666',
    },
    sectionCard: {
      marginBottom: '2em',
      padding: '16px',
      backgroundColor: 'rgba(226, 223, 195, 0.1)',
      borderRadius: '2em',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '12px',
      paddingLeft: '1em',
    },
    
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px',
    },

    activityCard: {
      borderRadius: '2em',
      backgroundColor: 'rgba(21, 228, 149, 0.27)',
      padding: '0.3em',
      paddingLeft: '1.5em',
      marginBottom: '1em',
      color: 'black',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
    activityDetails: {
      fontSize: '14px',
      margin: '0 0 0.1em 0',
    },
    activityFooter: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
      fontSize: '12px',
      color: 'black',
    },
    activityUser: {
      fontSize: '16px',
      fontWeight: '600',
      marginBottom: '0.5em',
      color: 'black',
    },
    activityTime: {
      color: 'black',
    },
    
    activityDetails: {
      fontSize: '16px',
      margin: '0 0 4px 0',
    },
    activityFooter: {
      display: 'flex',
      gap: '12px',
      fontSize: '14px',
      color: '#666',
      alignItems: 'center',
    },
    activityUser: {
      fontWeight: '500',
    },
    activityTime: {},
    issueItem: {
      padding: '12px 0',
      borderBottom: '1px solid #e5e7eb',
    },
    issueLastItem: {
      paddingLeft: '1em',
    },
    issueCard: {
      borderRadius: '2em',
      backgroundColor: 'rgba(240, 75, 10, 0.32)',
      padding: '0.3em',
      paddingLeft: '1.5em',
      marginBottom: '1em',
      color: 'black',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
    issueRoom: {
      fontSize: '16px',
      fontWeight: '600',
      marginBottom: '0.5em',
    },
    issueDescription: {
      fontSize: '14px',
      margin: '0 0 0.1em 0',
    },
    issueFooter: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
      fontSize: '12px',
    },
    issueDate: {
    },
  };

  // Extract hotel ID from route parameters
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  
  // Component state initialization
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  /**
   * Fetches property details from the API
   */
  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`http://localhost:5000/hotels/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch property details');
        }
        
        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || 'Failed to load property details');
        }
        
        setProperty(result.data);
      } catch (err) {
        setError('Failed to load property details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPropertyDetails();
  }, [id]);
  
  /**
   * Changes active tab
   * @param {string} tabId - Identifier for the tab to display
   */
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };
  
  /**
   * Formats currency values with proper separators
   * @param {number} value - Numeric value to format
   * @returns {string} Formatted currency string
   */
  const formatCurrency = (value) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };
  
  /**
   * Formats date for display
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  /**
   * Formats time for display
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted time
   */
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * Refreshes property data after a CRUD operation
   */
  const refreshPropertyData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/hotels/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch property details');
      }
      const result = await response.json();
      if (result.success) {
        setProperty(result.data);
      } else {
        throw new Error(result.error || 'Failed to load property details');
      }
    } catch (err) {
      setError('Failed to refresh property details');
      console.error(err);
    }
  };

  /**
   * Handles creating a new issue
   */
  const handleCreateTask = async () => {
    const description = prompt("Enter issue description:");
    const priority = prompt("Enter priority (High/Medium/Low):");
    if (description) {
      try {
        const roomNumber = prompt("Enter room number:");
        if (!roomNumber) return;

        const response = await fetch(
          `http://localhost:5000/hotels/${id}/rooms/${roomNumber}/issues`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              description,
              priority: priority || 'empty',
            }),
          }
        );
        const result = await response.json();
        if (result.success) {
          await refreshPropertyData();
        } else {
          alert('Failed to create issue: ' + result.error);
        }
      } catch (error) {
        alert('Error creating issue: ' + error.message);
      }
    }
  };

  /**
   * Handles updating an issue
   * @param {string} roomNumber - Room number of the issue
   * @param {string} issueId - ID of the issue to update
   */
  const handleUpdateIssue = async (roomNumber, issueId) => {
    const newStatus = prompt('Enter new status (Pending/in-progress/Resolved):');
    if (newStatus) {
      try {
        const response = await fetch(
          `http://localhost:5000/hotels/${id}/rooms/${roomNumber}/issues/${issueId}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
          }
        );
        const result = await response.json();
        if (result.success) {
          await refreshPropertyData();
        } else {
          alert('Failed to update issue: ' + result.error);
        }
      } catch (error) {
        alert('Error updating issue: ' + error.message);
      }
    }
  };

  /**
   * Handles deleting an issue
   * @param {string} roomNumber - Room number of the issue
   * @param {string} issueId - ID of the issue to delete
   */
  const handleDeleteIssue = async (roomNumber, issueId) => {
    if (window.confirm('Are you sure you want to delete this issue?')) {
      try {
        const response = await fetch(
          `http://localhost:5000/hotels/${id}/rooms/${roomNumber}/issues/${issueId}`,
          {
            method: 'DELETE',
          }
        );
        const result = await response.json();
        if (result.success) {
          await refreshPropertyData();
        } else {
          alert('Failed to delete issue: ' + result.error);
        }
      } catch (error) {
        alert('Error deleting issue: ' + error.message);
      }
    }
  };

  /**
   * Handles deleting an activity
   * @param {string} roomNumber - Room number of the activity
   * @param {string} activityId - ID of the activity to delete
   */
  const handleDeleteActivity = async (roomNumber, activityId) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        const response = await fetch(
          `http://localhost:5000/hotels/${id}/rooms/${roomNumber}/activities/${activityId}`,
          {
            method: 'DELETE',
          }
        );
        const result = await response.json();
        if (result.success) {
          await refreshPropertyData();
        } else {
          alert('Failed to delete activity: ' + result.error);
        }
      } catch (error) {
        alert('Error deleting activity: ' + error.message);
      }
    }
  };

  /**
   * Handles adding new equipment
   */
  const handleAddEquipment = async () => {
    const roomNumber = prompt('Enter room number:');
    const name = prompt('Enter equipment name:');
    const status = prompt('Enter status (Operational/Needs Repair):');
    if (roomNumber && name) {
      try {
        const response = await fetch(
          `http://localhost:5000/hotels/${id}/rooms/${roomNumber}/equipment`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, status: status || 'empty' }),
          }
        );
        const result = await response.json();
        if (result.success) {
          await refreshPropertyData();
        } else {
          alert('Failed to add equipment: ' + result.error);
        }
      } catch (error) {
        alert('Error adding equipment: ' + error.message);
      }
    }
  };

  /**
   * Handles updating equipment
   * @param {string} roomNumber - Room number of the equipment
   * @param {string} equipmentId - ID of the equipment to update
   */
  const handleUpdateEquipment = async (roomNumber, equipmentId) => {
    const newStatus = prompt('Enter new status (Operational/Needs Repair):');
    if (newStatus) {
      try {
        const response = await fetch(
          `http://localhost:5000/hotels/${id}/rooms/${roomNumber}/equipment/${equipmentId}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
          }
        );
        const result = await response.json();
        if (result.success) {
          await refreshPropertyData();
        } else {
          alert('Failed to update equipment: ' + result.error);
        }
      } catch (error) {
        alert('Error updating equipment: ' + error.message);
      }
    }
  };

  /**
   * Handles deleting equipment
   * @param {string} roomNumber - Room number of the equipment
   * @param {string} equipmentId - ID of the equipment to delete
   */
  const handleDeleteEquipment = async (roomNumber, equipmentId) => {
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      try {
        const response = await fetch(
          `http://localhost:5000/hotels/${id}/rooms/${roomNumber}/equipment/${equipmentId}`,
          {
            method: 'DELETE',
          }
        );
        const result = await response.json();
        if (result.success) {
          await refreshPropertyData();
        } else {
          alert('Failed to delete equipment: ' + result.error);
        }
      } catch (error) {
        alert('Error deleting equipment: ' + error.message);
      }
    }
  };

  /**
   * Renders view based on loading/error state
   */
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={{ textAlign: 'center' }}>
          <p style={styles.loadingText}>Loading property details...</p>
        </div>
      </div>
    );
  }
  
  if (error || !property) {
    return (
      <div style={styles.errorContainer}>
        <div style={{ textAlign: 'center' }}>
          <p style={styles.errorText}>{error || 'Property not found'}</p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/properties')}
          >
            Back to Properties
          </Button>
        </div>
      </div>
    );
  }
  
  /**
   * Renders the Overview tab content with key metrics and room equipment
   * @returns {JSX.Element} Overview dashboard
   */
  const renderOverviewTab = () => {
    const averageStay = '3.2 days'; // Placeholder, compute if needed

    return (
      <div>
        {/* Key Metrics */}
        <div style={styles.metricsGrid}>
          <Card style={styles.metricCard}>
            <h3 style={styles.metricTitle}>Occupancy Rate</h3>
            <p style={styles.metricValue}>{property.roomStatistics.occupancyRate}%</p>
            <p style={styles.metricSubtext}>
              {property.roomStatistics.occupiedRooms} of {property.roomStatistics.totalRooms} rooms
            </p>
          </Card>
          
          <Card style={styles.metricCard}>
            <h3 style={styles.metricTitle}>Daily Revenue</h3>
            <p style={styles.metricValue}>{formatCurrency(property.roomStatistics.dailyRevenue)}</p>
            <p style={styles.metricSubtext}>Average stay: {averageStay}</p>
          </Card>
        </div>
        
        {/* Room Status Summary */}
        <Card style={styles.roomStatusCard}>
          <h3 style={styles.roomStatusTitle}>Room Status</h3>
          
          <div style={styles.roomStatusGrid}>
            <div style={styles.statusBox}>
              <p style={styles.statusValue}>{property.roomStatistics.occupiedRooms}</p>
              <p style={styles.statusLabel}>Occupied</p>
            </div>
            
            <div style={styles.statusBox}>
              <p style={styles.statusValue}>{property.roomStatistics.availableRooms}</p>
              <p style={styles.statusLabel}>Available</p>
            </div>

            <div style={styles.statusBox}>
              <p style={styles.statusValue}>{property.roomStatistics.needsCleaning}</p>
              <p style={styles.statusLabel}>Needs Cleaning</p>
            </div>

            <div style={styles.statusBox}>
              <p style={styles.statusValue}>{property.roomStatistics.maintenance}</p>
              <p style={styles.statusLabel}>Maintenance</p>
            </div>
          </div>


          
          <Link to={`/properties/${property.hotelId}/rooms`}>
            <Button variant="outline" style={styles.viewRoomButton}>
              View All Rooms
            </Button>
          </Link>
        </Card>

        
      </div>
    );
  };

  /**
   * Renders the Issue tab content with active issues
   * @returns {JSX.Element} Issue dashboard
   */
  const renderIssueTab = () => {
    return (
      <div>
        <h3 style={styles.sectionTitle}>Active Issues</h3>
        {property.issues && property.issues.length > 0 ? (
          property.issues.map((issue) => (
            <Card key={issue.id} style={styles.issueCard}>
              <div>
                <div style={styles.issueHeader}>
                  <span style={styles.issueRoom}>Room {issue.roomNumber}</span>
                </div>
                <p style={styles.issueDescription}>{issue.Description}</p>
                
                <StatusBadge status={issue.Status.toLowerCase()} />
                
                <div style={styles.issueFooter}>
                  <span style={styles.issueDate}>
                    Reported {formatDate(issue.ReportedAt)}
                  </span>
                  {hasPermission('canManageProperties') && (
                    <Button
                      variant="text"
                      onClick={() => handleDeleteIssue(issue.roomNumber, issue.id)}
      
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <p
            style={{
              textAlign: 'center',
              padding: '8px 0',
              color: '#999',
              fontSize: '14px',
            }}
          >
            No active issues
          </p>
        )}
      </div>
    );
  };

  /**
   * Renders the Activity tab content with recent activities
   * @returns {JSX.Element} Activity dashboard
   */
  const renderActivityTab = () => {
    return (
      <div>
        <h3 style={styles.sectionTitle}>Recent Activity</h3>
        {property.activities && property.activities.length > 0 ? (
          property.activities.map((activity) => (
            <Card key={activity.id} style={styles.activityCard}>
              <div>
                <div style={styles.issueHeader}>
                  <span style={styles.activityUser}>{activity.User}</span>
                </div>
                <p style={styles.activityDetails}>{activity.Details}</p>
                <div style={styles.activityFooter}>
                  <span style={styles.activityTime}>
                    {formatTime(activity.Timestamp)}
                  </span>
                  {hasPermission('canManageProperties') && (
                    <Button
                      variant="text"
                      onClick={() =>
                        handleDeleteActivity(activity.roomNumber, activity.id)
                      }
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <p
            style={{
              textAlign: 'center',
              padding: '8px 0',
              color: '#999',
              fontSize: '14px',
            }}
          >
            No recent activity
          </p>
        )}
      </div>
    );
  };

  /**
   * Renders the Financial tab content (placeholder)
   * @returns {JSX.Element} Financial dashboard
   */
  const renderFinancialTab = () => {
    return (
      <div>
        {/* Property Performance */}
        <Card style={styles.sectionCard}>
          <h3 style={styles.sectionTitle}>Property Performance</h3>
          <div style={styles.metricsGrid}>
            <div style={styles.metricCard}>
              <h4 style={styles.metricTitle}>Occupancy Rate</h4>
              <p style={styles.metricValue}>
                {property.roomStatistics.occupancyRate}%
              </p>
            </div>
            <div style={styles.metricCard}>
              <h4 style={styles.metricTitle}>Avg. Rating</h4>
              <p style={{ ...styles.metricValue, display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '4px' }}>
                  {property.roomStatistics.averageRating || 'N/A'}
                </span>
                {property.roomStatistics.averageRating ? (
                  <span style={{ fontSize: '16px', color: '#FFD700' }}>★</span>
                ) : null}
              </p>
            </div>
            <div style={styles.metricCard}>
              <h4 style={styles.metricTitle}>Price Range</h4>
              <p style={styles.metricValue}>{property.roomStatistics.priceRange}</p>
            </div>
            <div style={styles.metricCard}>
              <h4 style={styles.metricTitle}>Avg. Stay</h4>
              <p style={styles.metricValue}>
                {property.roomStatistics.averageStayDuration > 0
                  ? `${property.roomStatistics.averageStayDuration} days`
                  : 'N/A'}
              </p>
            </div>
          </div>
        </Card>
  
        {/* Revenue Overview */}
        <Card style={styles.sectionCard}>
          <h3 style={styles.sectionTitle}>Revenue Overview</h3>
          <div style={styles.metricsGrid}>
            <div style={styles.metricCard}>
              <h4 style={styles.metricTitle}>Daily Revenue</h4>
              <p style={styles.metricValue}>
                {formatCurrency(property.roomStatistics.dailyRevenue)}
              </p>
            </div>
            <div style={styles.metricCard}>
              <h4 style={styles.metricTitle}>Weekly Revenue</h4>
              <p style={styles.metricValue}>
                {formatCurrency(property.roomStatistics.weeklyRevenue)}
              </p>
            </div>
            <div style={styles.metricCard}>
              <h4 style={styles.metricTitle}>Monthly Revenue</h4>
              <p style={styles.metricValue}>
                {formatCurrency(property.roomStatistics.monthlyRevenue)}
              </p>
            </div>
            <div style={styles.metricCard}>
              <h4 style={styles.metricTitle}>Year-to-Date</h4>
              <p style={styles.metricValue}>
                {formatCurrency(property.roomStatistics.yearToDateRevenue)}
              </p>
            </div>
          </div>
          <Button variant="outline" style={styles.viewRoomButton}>
            View Detailed Reports
          </Button>
        </Card>
      </div>
    );
  };

  return (
    <div style={styles.pageContainer}>
      {/* Property Header */}
      <div style={styles.headerContainer}>
        <button 
          style={styles.backButton}
          onClick={() => navigate('/properties')}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = styles.backButtonHover.backgroundColor}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = styles.backButton.backgroundColor}
          aria-label="Back to properties"
        >
          ←
        </button>
        
      <h1 style={styles.headerTitle}>{property.name}</h1>
      </div>
      
      {/* Property Information in Card */}
      <Card style={styles.detailsCard}>
        
        <div style={styles.detailsLeft}>
          <p style={styles.addressText}>Location: {property.location}</p>
          <p style={styles.addressText}>Email: {property.email}</p>
          <p style={styles.addressText}>Contact Number:{property.phoneNumber}</p>

          <div style={styles.statusContainer}>
            <h3 
              status={property.status === 'Active' ? 'active' : 'pending'}
            >
              {property.status}
            </h3>
            <p style={styles.roomCountText}>
              {property.roomStatistics.totalRooms} Rooms
            </p>
          </div>
        </div>
        {hasPermission('canManageProperties') && (
            <Button
              variant="outline"
              style={styles.editButton}
            >
              Edit Property
            </Button>
          
        )}
      </Card>
      
      {/* Tab Navigation */}
      <div style={styles.tabContainer}>
        {['overview', 'issue', 'activity', 'financial'].map((tab) => (
          <button
            key={tab}
            style={{
              ...styles.tabButton,
              ...(activeTab === tab ? styles.tabButtonActive : {}),
            }}
            onClick={() => handleTabChange(tab)}
            onMouseOver={(e) => activeTab !== tab && (e.currentTarget.style.color = styles.tabButtonHover.color)}
            onMouseOut={(e) => activeTab !== tab && (e.currentTarget.style.color = styles.tabButton.color)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      {activeTab === 'overview' && renderOverviewTab()}
      {activeTab === 'issue' && renderIssueTab()}
      {activeTab === 'activity' && renderActivityTab()}
      {activeTab === 'financial' && renderFinancialTab()}
    </div>
  );
};

export default PropertyDetails;