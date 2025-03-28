import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';

/**
 * Sales Dashboard Component
 * Shows sales-focused widgets and statistics
 * 
 * @param {Object} props - Component props
 * @param {Object} props.statistics - Statistics data for dashboard
 */
const SalesDashboard = ({ statistics }) => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [salesData, setSalesData] = useState({
    daily: 0,
    weekly: 0,
    monthly: statistics.monthlyRevenue || 0,
    topProperties: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sales targets (defined as constants for now)
  const salesTargets = {
    daily: 1500,
    weekly: 10000,
    monthly: 45000,
  };

  // Fetch sales data when component mounts
  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get today's date and format it as YYYY-MM-DD
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0]; // e.g., "2025-03-28"

        // Calculate the start date for the weekly range (7 days ago)
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        const weekAgoStr = weekAgo.toISOString().split('T')[0]; // e.g., "2025-03-22"

        // Calculate the start date for the monthly range (30 days ago)
        const monthAgo = new Date(today);
        monthAgo.setDate(today.getDate() - 30);
        const monthAgoStr = monthAgo.toISOString().split('T')[0]; // e.g., "2025-02-26"

        // Fetch daily revenue (today only)
        const dailyUrl = new URL('http://localhost:5000/financial');
        dailyUrl.searchParams.append('startDate', todayStr);
        dailyUrl.searchParams.append('endDate', todayStr);
        const dailyResponse = await fetch(dailyUrl);
        if (!dailyResponse.ok) {
          throw new Error(`Failed to fetch daily revenue: ${dailyResponse.status}`);
        }
        const dailyData = await dailyResponse.json();
        if (!dailyData.success) {
          throw new Error(dailyData.error || 'Failed to fetch daily revenue');
        }
        console.log('Daily financial data:', dailyData);

        // Fetch weekly revenue (last 7 days)
        const weeklyUrl = new URL('http://localhost:5000/financial');
        weeklyUrl.searchParams.append('startDate', weekAgoStr);
        weeklyUrl.searchParams.append('endDate', todayStr);
        const weeklyResponse = await fetch(weeklyUrl);
        if (!weeklyResponse.ok) {
          throw new Error(`Failed to fetch weekly revenue: ${weeklyResponse.status}`);
        }
        const weeklyData = await weeklyResponse.json();
        if (!weeklyData.success) {
          throw new Error(weeklyData.error || 'Failed to fetch weekly revenue');
        }
        console.log('Weekly financial data:', weeklyData);

        // Fetch monthly revenue for top properties if weekly data is empty
        let topProperties = weeklyData.data.revenueByProperty || weeklyData.data.detailedBreakdown?.revenueByProperty || [];
        // Map "property" to "name" to match expected structure
        topProperties = topProperties.map(prop => ({
          name: prop.property,
          revenue: prop.revenue,
        }));

        if (topProperties.length === 0) {
          console.warn('No top properties in weekly data, fetching monthly data...');
          const monthlyUrl = new URL('http://localhost:5000/financial');
          monthlyUrl.searchParams.append('startDate', monthAgoStr);
          monthlyUrl.searchParams.append('endDate', todayStr);
          const monthlyResponse = await fetch(monthlyUrl);
          if (!monthlyResponse.ok) {
            throw new Error(`Failed to fetch monthly revenue for top properties: ${monthlyResponse.status}`);
          }
          const monthlyData = await monthlyResponse.json();
          if (!monthlyData.success) {
            throw new Error(monthlyData.error || 'Failed to fetch monthly revenue for top properties');
          }
          console.log('Monthly financial data (for top properties):', monthlyData);
          topProperties = monthlyData.data.revenueByProperty || monthlyData.data.detailedBreakdown?.revenueByProperty || [];
          topProperties = topProperties.map(prop => ({
            name: prop.property,
            revenue: prop.revenue,
          }));
        }

        // Update sales data
        setSalesData({
          daily: dailyData.data.totalRevenue || 0,
          weekly: weeklyData.data.totalRevenue || 0,
          monthly: statistics.monthlyRevenue || 0,
          topProperties,
        });
      } catch (err) {
        console.error('Error fetching sales data:', err.message);
        setError(`Failed to load sales data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [statistics.monthlyRevenue]);

  // Calculate progress percentages
  const calculateProgress = (actual, target) => {
    const percentage = (actual / target) * 100;
    return Math.min(percentage, 100); // Cap at 100%
  };

  // Mock file upload handler (unchanged for now)
  const handleFileUpload = (e) => {
    if (!e.target.files.length) return;

    setIsUploading(true);

    // Simulate upload delay
    setTimeout(() => {
      setIsUploading(false);
      alert('Sales data uploaded successfully!');
    }, 1500);
  };

  // Navigate to reports page
  const handleViewReports = () => {
    navigate('/reports');
  };

  // Styles matching ReceptionistDashboard (aligned with BossManagerDashboard)
  const styles = {
    pageContainer: {
      paddingBottom: '2em',
      width: '100%',
      maxWidth: '480px',
      marginBottom: '4em',
    },
    card: {
      marginBottom: '16px',
      padding: '16px',
      backgroundColor: 'white',
      borderRadius: '2em',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
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
    progressBar: {
      height: '8px',
      width: '80%',
      margin: 'auto',
      backgroundColor: '#e0e0e0',
      borderRadius: '4px',
      overflow: 'hidden',
      marginTop: '4px',
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#FFD167', // Matching the button color for consistency
      transition: 'width 0.3s ease-in-out',
    },
    propertyItem: {
      padding: '12px 0',
      borderBottom: '1px solid #f0f0f0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    propertyRank: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      backgroundColor: '#FFD167',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      marginRight: '8px',
    },
    propertyName: {
      fontSize: '16px',
      fontWeight: '500',
      color: '#111827',
    },
    propertyRevenue: {
      fontSize: '16px',
      fontWeight: '700',
      color: '#111827',
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
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
      marginTop: '16px',
    },
    errorMessage: {
      color: '#dc2626',
      marginTop: '1rem',
      textAlign: 'center',
    },
    loadingText: {
      marginTop: '1rem',
      textAlign: 'center',
      color: '#6b7280',
    },
  };

  return (
    <div style={styles.pageContainer}>
      {/* Error Message */}
      {error && <p style={styles.errorMessage}>{error}</p>}

      {/* Loading State */}
      {loading && <p style={styles.loadingText}>Loading sales data...</p>}

      {/* Revenue Statistics */}
      {!loading && !error && (
        <Card style={styles.card}>
          <h2 style={styles.sectionTitle}>Revenue Overview</h2>
          <div style={styles.flexContainer}>
            <div style={styles.flexItem}>
              <h3 style={styles.metricTitle}>Daily</h3>
              <p style={styles.metricValue}>${salesData.daily.toLocaleString()}</p>
              <div style={styles.progressBar}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${calculateProgress(salesData.daily, salesTargets.daily)}%`,
                  }}
                ></div>
              </div>
              <p style={styles.metricSubtext}>Target: ${salesTargets.daily.toLocaleString()}</p>
            </div>
            <div style={styles.flexItem}>
              <h3 style={styles.metricTitle}>Weekly</h3>
              <p style={styles.metricValue}>${salesData.weekly.toLocaleString()}</p>
              <div style={styles.progressBar}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${calculateProgress(salesData.weekly, salesTargets.weekly)}%`,
                  }}
                ></div>
              </div>
              <p style={styles.metricSubtext}>Target: ${salesTargets.weekly.toLocaleString()}</p>
            </div>
            <div style={styles.flexItem}>
              <h3 style={styles.metricTitle}>Monthly</h3>
              <p style={styles.metricValue}>${salesData.monthly.toLocaleString()}</p>
              <div style={styles.progressBar}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${calculateProgress(salesData.monthly, salesTargets.monthly)}%`,
                  }}
                ></div>
              </div>
              <p style={styles.metricSubtext}>Target: ${salesTargets.monthly.toLocaleString()}</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleViewReports}
            style={styles.button}
          >
            View Detailed Reports
          </Button>
        </Card>
      )}

      {/* Top Performing Properties */}
      {!loading && !error && (
        <Card style={styles.card}>
          <h2 style={styles.sectionTitle}>Top Performing Properties</h2>
          {salesData.topProperties.length > 0 ? (
            salesData.topProperties.map((property, index) => (
              <div key={index} style={styles.propertyItem}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={styles.propertyRank}>{index + 1}</div>
                  <span style={styles.propertyName}>{property.name}</span>
                </div>
                <span style={styles.propertyRevenue}>${property.revenue.toLocaleString()}</span>
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', color: '#999', padding: '16px 0' }}>
              No properties data available
            </p>
          )}
        </Card>
      )}

      {/* Data Upload Section */}
      {!loading && !error && (
        <Card style={styles.card}>
          <h2 style={styles.sectionTitle}>Upload Sales Data</h2>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
            Upload your sales data files for processing and report generation.
          </p>
          <div style={{ marginBottom: '16px' }}>
            <Input
              id="sales-file"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              helperText="Supported formats: CSV, Excel (XLSX, XLS)"
              disabled={isUploading}
            />
          </div>
          <div style={styles.gridContainer}>
            <Button
              variant="primary"
              disabled={isUploading}
              style={styles.button}
            >
              {isUploading ? 'Uploading...' : 'Upload Sales Data'}
            </Button>
            <Button
              variant="outline"
              onClick={handleViewReports}
              style={styles.button}
            >
              Generate Reports
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SalesDashboard;