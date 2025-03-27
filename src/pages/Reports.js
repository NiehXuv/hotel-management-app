import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const Reports = () => {
  const navigate = useNavigate();
  const { currentUser, hasPermission } = useAuth();

  const [activeCategory, setActiveCategory] = useState('financial');
  const [activeReport, setActiveReport] = useState('revenue');
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    revenue: {
      title: 'Revenue Analysis',
      description: 'Revenue breakdown for all hotels',
      total: 0,
      byRoomType: [{ name: 'N/A', value: 0 }],
      byProperty: [],
    },
    occupancy: {
      title: 'Occupancy Rates',
      description: 'Room occupancy analysis for all hotels',
      overall: 0,
      byProperty: [],
      byRoomType: [{ name: 'N/A', value: 0, total: 0, occupied: 0 }],
    },
  });
  const [hotelDetails, setHotelDetails] = useState([]);
  const [dateRange, setDateRange] = useState({
    start: '2025-02-28',
    end: '2025-03-30',
  });
  const [error, setError] = useState(null);

  const styles = {
    pageContainer: {
      paddingBottom: '2em',
      padding: '1em',
      width: '100vw',
      maxWidth: '480px',
      marginBottom: '4em',
    },
    headerContainer: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '8px',
    },
    headerTitle: {
      fontSize: '22px',
      paddingLeft: '0.2em',
      fontWeight: '700',
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
    card: {
      marginBottom: '16px',
      padding: '16px',
      backgroundColor: 'white',
      borderRadius: '2em',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
    formContainer: {
      display: 'flex',
      flexDirection: 'column',
    },
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
      marginBottom: '12px',
    },
    label: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#666',
      marginBottom: '4px',
    },
    input: {
      padding: '8px 12px',
      borderRadius: '1em',
      border: '1px solid #e5e7eb',
      fontSize: '14px',
      width: '100%',
    },
    tabContainer: {
      display: 'flex',
      borderBottom: '1px solid #e5e7eb',
      marginBottom: '16px',
      overflowX: 'auto',
    },
    tabButton: {
      padding: '8px 16px',
      fontSize: '15px',
      fontWeight: '500',
      whiteSpace: 'nowrap',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#666',
    },
    tabButtonActive: {
      color: '#3b82f6',
      borderBottom: '2px solid #42A5F5',
    },
    metricsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
      marginBottom: '16px',
    },
    metricCard: {
      backgroundColor: 'white',
      borderRadius: '1.2em',
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
      fontSize: '1em',
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
    detailItem: {
      padding: '12px 0',
      borderBottom: '1px solid #e5e7eb',
    },
    detailFlex: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '4px',
    },
    detailText: {
      fontSize: '14px',
      color: '#666',
    },
    detailValue: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#111827',
    },
    progressBar: {
      width: '100%',
      height: '8px',
      backgroundColor: '#e5e7eb',
      borderRadius: '4px',
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#42A5F5',
      borderRadius: '4px',
    },
    noDataText: {
      fontSize: '14px',
      color: '#999',
      textAlign: 'center',
      padding: '8px 0',
    },
    exportButton: {
      marginLeft: 'auto',
      padding: "4px 8px",
      fontSize: "12px",
      backgroundColor: "#F04770",
      color: "white",
      border: "none",
      borderRadius: "2em",
      cursor: "pointer",
    },
    filterButton: {
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

  useEffect(() => {
    const fetchData = async () => {
      // ... (keeping the existing useEffect logic unchanged)
      try {
        setLoading(true);
        setError(null);

        const financialResponse = await fetch(
          `http://localhost:5000/financial?startDate=${dateRange.start}&endDate=${dateRange.end}`
        );
        const financialData = await financialResponse.json();

        if (!financialResponse.ok || !financialData.success) {
          throw new Error(financialData.error || 'Failed to fetch financial data');
        }

        const backendData = financialData.data;
        const hotelsResponse = await fetch('http://localhost:5000/hotels');
        const hotelsData = await hotelsResponse.json();

        if (!hotelsResponse.ok || !hotelsData.success) {
          throw new Error(hotelsData.error || 'Failed to fetch hotels list');
        }

        const hotelsList = hotelsData.data;
        const hotelDetailsPromises = hotelsList.map(async (hotel) => {
          const response = await fetch(
            `http://localhost:5000/hotels/${hotel.hotelId}?startDate=${dateRange.start}&endDate=${dateRange.end}`
          );
          const data = await response.json();
          return data.success ? data.data : null;
        });

        const hotelDetailsData = (await Promise.all(hotelDetailsPromises)).filter((data) => data !== null);

        const revenueByProperty = backendData?.detailedBreakdown?.revenueByProperty || [];
        const sortedRevenueByProperty = [...revenueByProperty].sort((a, b) => (b.revenue || 0) - (a.revenue || 0));

        setReportData({
          revenue: {
            title: 'Revenue Analysis',
            description: 'Revenue breakdown for all hotels',
            total: backendData.totalRevenue || 0,
            byRoomType: [
              { name: backendData.byRoomType?.type || 'N/A', value: backendData.byRoomType?.revenue || 0 },
            ],
            byProperty: sortedRevenueByProperty,
          },
          occupancy: {
            title: 'Occupancy Rates',
            description: 'Room occupancy analysis for all hotels',
            overall: backendData.occupancyRates?.overall || 0,
            byProperty: (backendData.detailedBreakdown?.revenueByProperty || []).map((prop, index) => {
              const hotelId = Object.keys(backendData.occupancyRates?.byProperty || {})[index] || 'unknown';
              const stats = backendData.occupancyRates?.byProperty?.[hotelId] || { total: 0, occupied: 0 };
              return {
                name: prop.property || 'Unknown',
                value: stats.total > 0 ? (stats.occupied / stats.total) * 100 : 0,
                total: stats.total,
                occupied: stats.occupied,
              };
            }),
            byRoomType: [
              { name: backendData.occupancyRates?.bestRoomType || 'N/A', value: 0, total: 0, occupied: 0 },
            ],
          },
        });

        setHotelDetails(hotelDetailsData);
      } catch (err) {
        console.error('Error fetching report data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dateRange]);

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setActiveReport(category === 'financial' ? 'revenue' : 'occupancy');
  };

  const handleReportChange = (report) => {
    setActiveReport(report);
  };

  const handleDateChange = (field, value) => {
    setDateRange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDateRangeSubmit = (e) => {
    e.preventDefault();
  };

  const formatCurrency = (value) => `$${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  const formatPercentage = (value) => `${Number(value || 0).toFixed(1)}%`;

  const renderReportVisualization = () => {
    if (error) {
      return <div style={styles.errorText}>Error: {error}</div>;
    }

    const report = reportData[activeReport];
    if (!report) {
      return <div style={styles.noDataText}>Report data not available</div>;
    }

    return (
      <div>
        <Card style={styles.card}>
          <h2 style={styles.sectionTitle}>{report.title}</h2>
          <p style={styles.detailText}>{report.description}</p>
          <div style={{ ...styles.metricsGrid, gridTemplateColumns: '1fr 1fr 1fr' }}>
            {activeReport === 'revenue' && (
              <>
                <div style={styles.metricCard}>
                  <h3 style={styles.metricTitle}>Total Revenue</h3>
                  <p style={styles.metricValue}>{formatCurrency(report.total)}</p>
                </div>
                <div style={styles.metricCard}>
                  <h3 style={styles.metricTitle}>By Room Type</h3>
                  <p style={styles.metricValue}>{formatCurrency(report.byRoomType[0].value)}</p>
                  <p style={styles.metricSubtext}>{report.byRoomType[0].name}</p>
                </div>
                <div style={styles.metricCard}>
                  <h3 style={styles.metricTitle}>Top Property</h3>
                  {report.byProperty.length > 0 ? (
                    <>
                      <p style={styles.metricValue}>{report.byProperty[0].property}</p>
                      <p style={styles.metricSubtext}>{formatCurrency(report.byProperty[0].revenue)}</p>
                    </>
                  ) : (
                    <p style={{ ...styles.metricValue, color: '#dc2626' }}>No properties found</p>
                  )}
                </div>
              </>
            )}
            {activeReport === 'occupancy' && (
              <>
                <div style={styles.metricCard}>
                  <h3 style={styles.metricTitle}>Overall Occupancy</h3>
                  <p style={styles.metricValue}>{formatPercentage(report.overall)}</p>
                </div>
                <div style={styles.metricCard}>
                  <h3 style={styles.metricTitle}>Best Property</h3>
                  {report.byProperty.length > 0 ? (
                    <>
                      <p style={styles.metricValue}>{report.byProperty[0].name}</p>
                      
                    </>
                  ) : (
                    <p style={{ ...styles.metricValue, color: '#dc2626' }}>No properties found</p>
                  )}
                </div>
                <div style={styles.metricCard}>
                  <h3 style={styles.metricTitle}>Best Room Type</h3>
                  <p style={styles.metricValue}>{report.byRoomType[0].name}</p>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    );
  };

  const renderReportDetails = () => {
    const report = reportData[activeReport];
    if (!report) return null;

    return (
      <Card style={styles.card}>
        <h3 style={styles.sectionTitle}>Detailed Breakdown</h3>
        {activeReport === 'revenue' && (
          <div>
            <h4 style={styles.metricTitle}>Revenue by Hotel</h4>
            {hotelDetails.length > 0 ? (
              hotelDetails.map((hotel, index) => (
                <div key={index} style={styles.detailItem}>
                  <div style={styles.detailFlex}>
                    <span style={styles.detailText}>{hotel.name}</span>
                    <span style={styles.detailValue}>{formatCurrency(hotel.roomStatistics.revenueInRange)}</span>
                  </div>
                  <div style={styles.progressBar}>
                    <div
                      style={{
                        ...styles.progressFill,
                        width: `${(hotel.roomStatistics.revenueInRange / (report.total || 1)) * 100}%`
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p style={styles.noDataText}>No revenue data available for hotels.</p>
            )}
          </div>
        )}
        {activeReport === 'occupancy' && (
          <div>
            <h4 style={styles.metricTitle}>Occupancy by Hotel</h4>
            {hotelDetails.length > 0 ? (
              hotelDetails.map((hotel, index) => (
                <div key={index} style={styles.detailItem}>
                  <div style={styles.detailFlex}>
                    <span style={styles.detailText}>{hotel.name}</span>
                    <span style={styles.detailValue}>
                      {formatPercentage(hotel.roomStatistics.occupancyRate)} ({Math.round(hotel.roomStatistics.occupiedRooms)}/{hotel.roomStatistics.totalRooms})
                    </span>
                  </div>
                  <div style={styles.progressBar}>
                    <div style={{ ...styles.progressFill, width: `${hotel.roomStatistics.occupancyRate}%` }} />
                  </div>
                </div>
              ))
            ) : (
              <p style={styles.noDataText}>No occupancy data available for hotels.</p>
            )}
          </div>
        )}
      </Card>
    );
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.headerContainer}>
        <h1 style={styles.headerTitle}>Reports</h1>
        <Button variant="outline" style={styles.exportButton }>
          Export Data
        </Button>
      </div>

      <Card style={styles.card}>
        <form onSubmit={handleDateRangeSubmit} style={styles.formContainer}>
          <div style={styles.gridContainer}>
            <div>
              <label style={styles.label}>Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => handleDateChange('start', e.target.value)}
                style={styles.input}
                required
              />
            </div>
            <div>
              <label style={styles.label}>End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => handleDateChange('end', e.target.value)}
                style={styles.input}
                required
              />
            </div>
          </div>
          <Button type="submit" variant="primary" style={styles.filterButton}> 
            {loading ? 'Loading...' : 'Apply Filter'}
          </Button>
        </form>
      </Card>

      <div style={styles.tabContainer}>
        <button
          style={{
            ...styles.tabButton,
            ...(activeCategory === 'financial' ? styles.tabButtonActive : {}),
          }}
          onClick={() => handleCategoryChange('financial')}
        >
          Financial
        </button>
        <button
          style={{
            ...styles.tabButton,
            ...(activeCategory === 'operational' ? styles.tabButtonActive : {}),
          }}
          onClick={() => handleCategoryChange('operational')}
        >
          Operational
        </button>
      </div>


      {loading ? (
        <div style={styles.loadingContainer}>
          <p style={styles.loadingText}>Loading report data...</p>
        </div>
      ) : (
        <div>
          {renderReportVisualization()}
          {renderReportDetails()}
        </div>
      )}
    </div>
  );
};

export default Reports;