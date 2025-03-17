import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

/**
 * Reports Page Component
 * 
 * Provides comprehensive business intelligence dashboards with financial,
 * operational, and performance metrics for management decision-making.
 * 
 * @module Pages/Reports
 */
const Reports = () => {
  const navigate = useNavigate();
  const { currentUser, hasPermission } = useAuth();
  
  // Component state initialization
  const [activeCategory, setActiveCategory] = useState('financial');
  const [activeReport, setActiveReport] = useState('revenue');
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({});
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  
  /**
   * Fetches report data from simulated API
   * In production, this would connect to a BI or analytics service
   */
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate current month and year for default date range
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        // Format dates for date inputs (YYYY-MM-DD)
        const formatDateForInput = (date) => {
          return date.toISOString().split('T')[0];
        };
        
        // Set default date range to current month
        setDateRange({
          start: formatDateForInput(firstDayOfMonth),
          end: formatDateForInput(lastDayOfMonth)
        });
        
        // Mock report data with comprehensive analytics structure
        const mockReportData = {
          // Financial Reports
          revenue: {
            title: 'Revenue Analysis',
            description: 'Revenue breakdown by property, room type, and time period',
            total: 328500,
            previousPeriodTotal: 305000,
            percentChange: 7.7,
            byProperty: [
              { name: 'Sunrise Hotel', value: 128000, percentage: 39 },
              { name: 'Mountain View Lodge', value: 102500, percentage: 31 },
              { name: 'Riverside Resort', value: 98000, percentage: 30 }
            ],
            byRoomType: [
              { name: 'Standard', value: 105000, percentage: 32 },
              { name: 'Deluxe', value: 118500, percentage: 36 },
              { name: 'Suite', value: 85000, percentage: 26 },
              { name: 'Penthouse', value: 20000, percentage: 6 }
            ],
            dailyTrend: [
              { date: '2025-03-01', value: 10500 },
              { date: '2025-03-02', value: 11200 },
              { date: '2025-03-03', value: 9800 },
              { date: '2025-03-04', value: 10300 },
              { date: '2025-03-05', value: 12500 },
              { date: '2025-03-06', value: 14200 },
              { date: '2025-03-07', value: 15300 }
            ]
          },
          expenses: {
            title: 'Expense Tracking',
            description: 'Detailed breakdown of operational expenses',
            total: 187200,
            previousPeriodTotal: 179500,
            percentChange: 4.3,
            byCategory: [
              { name: 'Staff Salaries', value: 96000, percentage: 51 },
              { name: 'Maintenance', value: 28500, percentage: 15 },
              { name: 'Utilities', value: 24200, percentage: 13 },
              { name: 'Supplies', value: 19500, percentage: 10 },
              { name: 'Marketing', value: 12000, percentage: 7 },
              { name: 'Other', value: 7000, percentage: 4 }
            ],
            byProperty: [
              { name: 'Sunrise Hotel', value: 72500, percentage: 39 },
              { name: 'Mountain View Lodge', value: 58200, percentage: 31 },
              { name: 'Riverside Resort', value: 56500, percentage: 30 }
            ],
            monthlyTrend: [
              { month: 'Jan', value: 182000 },
              { month: 'Feb', value: 179500 },
              { month: 'Mar', value: 187200 }
            ]
          },
          profitMargin: {
            title: 'Profit Margin Analysis',
            description: 'Profit margins across properties and time periods',
            overall: 43,
            previousPeriod: 41,
            percentChange: 4.9,
            byProperty: [
              { name: 'Sunrise Hotel', revenue: 128000, expenses: 72500, margin: 43.4 },
              { name: 'Mountain View Lodge', revenue: 102500, expenses: 58200, margin: 43.2 },
              { name: 'Riverside Resort', revenue: 98000, expenses: 56500, margin: 42.3 }
            ],
            quarterlyTrend: [
              { quarter: 'Q1 2024', value: 39 },
              { quarter: 'Q2 2024', value: 41 },
              { quarter: 'Q3 2024', value: 40 },
              { quarter: 'Q4 2024', value: 42 },
              { quarter: 'Q1 2025', value: 43 }
            ]
          },
          
          // Operational Reports
          occupancy: {
            title: 'Occupancy Rates',
            description: 'Room occupancy analysis across properties',
            overall: 68,
            previousPeriod: 64,
            percentChange: 6.3,
            byProperty: [
              { name: 'Sunrise Hotel', value: 75, total: 24, occupied: 18 },
              { name: 'Mountain View Lodge', value: 73, total: 30, occupied: 22 },
              { name: 'Riverside Resort', value: 57, total: 42, occupied: 24 }
            ],
            byRoomType: [
              { name: 'Standard', value: 82, total: 48, occupied: 39 },
              { name: 'Deluxe', value: 72, total: 25, occupied: 18 },
              { name: 'Suite', value: 52, total: 19, occupied: 10 },
              { name: 'Penthouse', value: 25, total: 4, occupied: 1 }
            ],
            weeklyTrend: [
              { week: 'Week 1', value: 61 },
              { week: 'Week 2', value: 63 },
              { week: 'Week 3', value: 65 },
              { week: 'Week 4', value: 68 }
            ]
          },
          maintenance: {
            title: 'Maintenance Metrics',
            description: 'Maintenance requests, resolution times, and costs',
            totalIssues: 42,
            resolvedIssues: 37,
            averageResolutionTime: 18, // hours
            byPriority: [
              { name: 'Critical', count: 5, avgResolution: 4.2 }, // hours
              { name: 'High', count: 12, avgResolution: 9.5 },
              { name: 'Normal', count: 18, avgResolution: 22.3 },
              { name: 'Low', count: 7, avgResolution: 32.1 }
            ],
            byProperty: [
              { name: 'Sunrise Hotel', count: 14, resolved: 12, pending: 2 },
              { name: 'Mountain View Lodge', count: 15, resolved: 13, pending: 2 },
              { name: 'Riverside Resort', count: 13, resolved: 12, pending: 1 }
            ],
            byIssueType: [
              { name: 'Plumbing', count: 12, percentage: 29 },
              { name: 'Electrical', count: 8, percentage: 19 },
              { name: 'Furniture', count: 6, percentage: 14 },
              { name: 'HVAC', count: 9, percentage: 21 },
              { name: 'Other', count: 7, percentage: 17 }
            ]
          },
          cleaning: {
            title: 'Cleaning Performance',
            description: 'Room cleaning efficiency and quality metrics',
            totalCleanings: 186,
            averageCleaningTime: 42, // minutes
            qualityScore: 4.7, // out of 5
            byStaffMember: [
              { name: 'Maria Garcia', count: 68, avgTime: 38, score: 4.9 },
              { name: 'John Smith', count: 63, avgTime: 43, score: 4.6 },
              { name: 'Sarah Johnson', count: 55, avgTime: 45, score: 4.5 }
            ],
            byRoomType: [
              { name: 'Standard', avgTime: 35, count: 112 },
              { name: 'Deluxe', avgTime: 45, count: 48 },
              { name: 'Suite', avgTime: 58, count: 21 },
              { name: 'Penthouse', avgTime: 90, count: 5 }
            ],
            qualityTrend: [
              { week: 'Week 1', value: 4.5 },
              { week: 'Week 2', value: 4.6 },
              { week: 'Week 3', value: 4.7 },
              { week: 'Week 4', value: 4.7 }
            ]
          },
          
          // Guest Satisfaction Reports
          ratings: {
            title: 'Guest Satisfaction',
            description: 'Guest ratings and feedback analysis',
            overall: 4.6,
            previousPeriod: 4.5,
            percentChange: 2.2,
            totalReviews: 285,
            byProperty: [
              { name: 'Sunrise Hotel', value: 4.7, reviews: 112 },
              { name: 'Mountain View Lodge', value: 4.5, reviews: 98 },
              { name: 'Riverside Resort', value: 4.4, reviews: 75 }
            ],
            byCategory: [
              { name: 'Cleanliness', value: 4.8 },
              { name: 'Service', value: 4.7 },
              { name: 'Comfort', value: 4.5 },
              { name: 'Location', value: 4.6 },
              { name: 'Value', value: 4.3 }
            ],
            sentimentAnalysis: {
              positive: 78,
              neutral: 15,
              negative: 7
            }
          },
          complaints: {
            title: 'Complaint Resolution',
            description: 'Analysis of guest complaints and resolution metrics',
            totalComplaints: 38,
            resolvedComplaints: 36,
            resolutionRate: 95,
            averageResolutionTime: 3.2, // hours
            byCategory: [
              { name: 'Noise', count: 12, percentage: 32 },
              { name: 'Cleanliness', count: 8, percentage: 21 },
              { name: 'Amenities', count: 6, percentage: 16 },
              { name: 'Staff', count: 5, percentage: 13 },
              { name: 'Other', count: 7, percentage: 18 }
            ],
            byProperty: [
              { name: 'Sunrise Hotel', count: 14, resolved: 13, pending: 1 },
              { name: 'Mountain View Lodge', count: 13, resolved: 12, pending: 1 },
              { name: 'Riverside Resort', count: 11, resolved: 11, pending: 0 }
            ],
            monthlyTrend: [
              { month: 'Jan', value: 42 },
              { month: 'Feb', value: 40 },
              { month: 'Mar', value: 38 }
            ]
          }
        };
        
        setReportData(mockReportData);
      } catch (err) {
        console.error('Error fetching report data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReportData();
  }, []);
  
  /**
   * Updates currently selected report category
   * @param {string} category - Report category to select
   */
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    
    // Set default active report for each category
    switch (category) {
      case 'financial':
        setActiveReport('revenue');
        break;
      case 'operational':
        setActiveReport('occupancy');
        break;
      case 'satisfaction':
        setActiveReport('ratings');
        break;
      default:
        setActiveReport('revenue');
    }
  };
  
  /**
   * Updates currently selected report
   * @param {string} report - Report to select
   */
  const handleReportChange = (report) => {
    setActiveReport(report);
  };
  
  /**
   * Handles date range input changes
   * @param {string} field - Field to update (start or end)
   * @param {string} value - New date value
   */
  const handleDateChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  /**
   * Handles form submission for date range filter
   * @param {Event} e - Form submit event
   */
  const handleDateRangeSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would refetch data with the new date range
    console.log('Filter by date range:', dateRange);
    setLoading(true);
    
    // Simulate loading delay
    setTimeout(() => {
      setLoading(false);
    }, 800);
  };
  
  /**
   * Formats currency values with proper separators
   * @param {number} value - Numeric value to format
   * @returns {string} Formatted currency string
   */
  const formatCurrency = (value) => {
    return `$${value.toLocaleString()}`;
  };
  
  /**
   * Formats percentage values with proper precision
   * @param {number} value - Numeric percentage value
   * @returns {string} Formatted percentage string
   */
  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };
  
  /**
   * Renders the current report's data visualization
   * This would typically use charts/graphs in a real application
   * @returns {JSX.Element} Report visualization
   */
  const renderReportVisualization = () => {
    const report = reportData[activeReport];
    
    if (!report) {
      return (
        <div className="text-center py-8">
          <p className="text-neutral-600">Report data not available</p>
        </div>
      );
    }
    
    return (
      <div>
        <Card className="mb-4">
          <h2 className="text-lg font-semibold mb-1">{report.title}</h2>
          <p className="text-sm text-neutral-600 mb-4">{report.description}</p>
          
          {/* Key Metrics Summary - Varies by report type */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {activeReport === 'revenue' && (
              <>
                <div className="text-center">
                  <h3 className="text-sm font-medium text-neutral-600">Total Revenue</h3>
                  <p className="text-2xl font-semibold text-primary-color">{formatCurrency(report.total)}</p>
                  <p className="text-xs text-neutral-500">
                    {report.percentChange >= 0 ? '+' : ''}{formatPercentage(report.percentChange)} vs. prev period
                  </p>
                </div>
                
                <div className="text-center">
                  <h3 className="text-sm font-medium text-neutral-600">By Room Type</h3>
                  <p className="text-xl font-semibold">
                    {formatCurrency(report.byRoomType[0].value)}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {formatPercentage(report.byRoomType[0].percentage)} from {report.byRoomType[0].name}
                  </p>
                </div>
                
                <div className="text-center">
                  <h3 className="text-sm font-medium text-neutral-600">Top Property</h3>
                  <p className="text-xl font-semibold">
                    {report.byProperty[0].name}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {formatCurrency(report.byProperty[0].value)} ({formatPercentage(report.byProperty[0].percentage)})
                  </p>
                </div>
              </>
            )}
            
            {activeReport === 'expenses' && (
              <>
                <div className="text-center">
                  <h3 className="text-sm font-medium text-neutral-600">Total Expenses</h3>
                  <p className="text-2xl font-semibold text-error-color">{formatCurrency(report.total)}</p>
                  <p className="text-xs text-neutral-500">
                    {report.percentChange >= 0 ? '+' : ''}{formatPercentage(report.percentChange)} vs. prev period
                  </p>
                </div>
                
                <div className="text-center">
                  <h3 className="text-sm font-medium text-neutral-600">Largest Category</h3>
                  <p className="text-xl font-semibold">
                    {report.byCategory[0].name}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {formatCurrency(report.byCategory[0].value)} ({formatPercentage(report.byCategory[0].percentage)})
                  </p>
                </div>
                
                <div className="text-center">
                  <h3 className="text-sm font-medium text-neutral-600">Monthly Change</h3>
                  <p className="text-xl font-semibold">
                    {formatCurrency(report.monthlyTrend[2].value - report.monthlyTrend[1].value)}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {((report.monthlyTrend[2].value / report.monthlyTrend[1].value - 1) * 100).toFixed(1)}% from last month
                  </p>
                </div>
              </>
            )}
            
            {activeReport === 'profitMargin' && (
              <>
                <div className="text-center">
                  <h3 className="text-sm font-medium text-neutral-600">Overall Margin</h3>
                  <p className="text-2xl font-semibold text-success-color">{formatPercentage(report.overall)}</p>
                  <p className="text-xs text-neutral-500">
                    {report.percentChange >= 0 ? '+' : ''}{formatPercentage(report.percentChange)} vs. prev period
                  </p>
                </div>
                
                <div className="text-center">
                  <h3 className="text-sm font-medium text-neutral-600">Best Property</h3>
                  <p className="text-xl font-semibold">
                    {report.byProperty[0].name}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {formatPercentage(report.byProperty[0].margin)} margin
                  </p>
                </div>
                
                <div className="text-center">
                  <h3 className="text-sm font-medium text-neutral-600">Quarterly Trend</h3>
                  <p className="text-xl font-semibold">
                    {formatPercentage(report.quarterlyTrend[4].value - report.quarterlyTrend[3].value)}
                  </p>
                  <p className="text-xs text-neutral-500">
                    Change from last quarter
                  </p>
                </div>
              </>
            )}
            
            {activeReport === 'occupancy' && (
              <>
                <div className="text-center">
                  <h3 className="text-sm font-medium text-neutral-600">Overall Occupancy</h3>
                  <p className="text-2xl font-semibold text-primary-color">{formatPercentage(report.overall)}</p>
                  <p className="text-xs text-neutral-500">
                    {report.percentChange >= 0 ? '+' : ''}{formatPercentage(report.percentChange)} vs. prev period
                  </p>
                </div>
                
                <div className="text-center">
                  <h3 className="text-sm font-medium text-neutral-600">Best Property</h3>
                  <p className="text-xl font-semibold">
                    {report.byProperty[0].name}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {formatPercentage(report.byProperty[0].value)} ({report.byProperty[0].occupied}/{report.byProperty[0].total})
                  </p>
                </div>
                
                <div className="text-center">
                  <h3 className="text-sm font-medium text-neutral-600">Best Room Type</h3>
                  <p className="text-xl font-semibold">
                    {report.byRoomType[0].name}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {formatPercentage(report.byRoomType[0].value)} occupied
                  </p>
                </div>
              </>
            )}
            
            {activeReport === 'maintenance' && (
              <>
                <div className="text-center">
                  <h3 className="text-sm font-medium text-neutral-600">Total Issues</h3>
                  <p className="text-2xl font-semibold text-neutral-800">{report.totalIssues}</p>
                  <p className="text-xs text-neutral-500">
                    {report.resolvedIssues} resolved ({Math.round(report.resolvedIssues / report.totalIssues * 100)}%)
                  </p>
                </div>
                
                <div className="text-center">
                  <h3 className="text-sm font-medium text-neutral-600">Avg. Resolution</h3>
                  <p className="text-xl font-semibold">
                    {report.averageResolutionTime} hours
                  </p>
                  <p className="text-xs text-neutral-500">
                    For all priorities
                  </p>
                </div>
                
                <div className="text-center">
                  <h3 className="text-sm font-medium text-neutral-600">Main Issue Type</h3>
                  <p className="text-xl font-semibold">
                    {report.byIssueType[0].name}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {report.byIssueType[0].count} issues ({formatPercentage(report.byIssueType[0].percentage)})
                  </p>
                </div>
              </>
            )}
            
            {activeReport === 'cleaning' && (
              <>
                <div className="text-center">
                  <h3 className="text-sm font-medium text-neutral-600">Total Cleanings</h3>
                  <p className="text-2xl font-semibold text-primary-color">{report.totalCleanings}</p>
                  <p className="text-xs text-neutral-500">
                    {report.averageCleaningTime} min average time
                  </p>
                </div>
                
                <div className="text-center">
                  <h3 className="text-sm font-medium text-neutral-600">Quality Score</h3>
                  <p className="text-xl font-semibold">
                    {report.qualityScore.toFixed(1)} / 5
                  </p>
                  <p className="text-xs text-neutral-500">
                    Based on inspections
                  </p>
                </div>
                
                <div className="text-center">
                  <h3 className="text-sm font-medium text-neutral-600">Top Performer</h3>
                  <p className="text-xl font-semibold">
                    {report.byStaffMember[0].name}
                  </p>
                  <p className="text-xs text-neutral-500">
                    Score: {report.byStaffMember[0].score.toFixed(1)}, {report.byStaffMember[0].count} rooms
                  </p>
                </div>
              </>
            )}
            
            {activeReport === 'ratings' && (
              <>
                <div className="text-center">
                  <h3 className="text-sm font-medium text-neutral-600">Overall Rating</h3>
                  <p className="text-2xl font-semibold text-warning-color">⭐ {report.overall.toFixed(1)}</p>
                  <p className="text-xs text-neutral-500">
                    From {report.totalReviews} reviews
                  </p>
                </div>
                
                <div className="text-center">
                  <h3 className="text-sm font-medium text-neutral-600">Best Category</h3>
                  <p className="text-xl font-semibold">
                    {report.byCategory[0].name}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {report.byCategory[0].value.toFixed(1)} / 5
                  </p>
                </div>
                
                <div className="text-center">
                  <h3 className="text-sm font-medium text-neutral-600">Sentiment</h3>
                  <p className="text-xl font-semibold text-success-color">
                    {report.sentimentAnalysis.positive}% Positive
                  </p>
                  <p className="text-xs text-neutral-500">
                    {report.sentimentAnalysis.negative}% Negative
                  </p>
                </div>
              </>
            )}
            
            {activeReport === 'complaints' && (
              <>
                <div className="text-center">
                  <h3 className="text-sm font-medium text-neutral-600">Resolution Rate</h3>
                  <p className="text-2xl font-semibold text-success-color">{report.resolutionRate}%</p>
                  <p className="text-xs text-neutral-500">
                    {report.resolvedComplaints} of {report.totalComplaints} resolved
                  </p>
                </div>
                
                <div className="text-center">
                  <h3 className="text-sm font-medium text-neutral-600">Avg. Resolution</h3>
                  <p className="text-xl font-semibold">
                    {report.averageResolutionTime.toFixed(1)} hours
                  </p>
                  <p className="text-xs text-neutral-500">
                    For all complaint types
                  </p>
                </div>
                
                <div className="text-center">
                  <h3 className="text-sm font-medium text-neutral-600">Top Issue</h3>
                  <p className="text-xl font-semibold">
                    {report.byCategory[0].name}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {report.byCategory[0].count} complaints ({formatPercentage(report.byCategory[0].percentage)})
                  </p>
                </div>
              </>
            )}
          </div>
          
          {/* Placeholder for chart visualization - would use Chart.js or similar in real app */}
          <div className="w-full h-48 bg-neutral-100 rounded-lg flex items-center justify-center mb-4">
            <p className="text-neutral-500">Chart visualization would appear here</p>
          </div>
        </Card>
      </div>
    );
  };
  
  /**
   * Renders detailed breakdown for the current report
   * @returns {JSX.Element} Report details
   */
  const renderReportDetails = () => {
    const report = reportData[activeReport];
    
    if (!report) {
      return null;
    }
    
    return (
      <Card>
        <h3 className="text-md font-semibold mb-3">Detailed Breakdown</h3>
        
        {/* Revenue Report Details */}
        {activeReport === 'revenue' && (
          <div>
            <h4 className="text-sm font-medium mb-2">Revenue by Property</h4>
            {report.byProperty.map((item, index) => (
              <div key={index} className="mb-2 last:mb-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">{item.name}</span>
                  <span className="text-sm font-medium">{formatCurrency(item.value)}</span>
                </div>
                <div className="w-full h-2 bg-neutral-200 rounded-full">
                  <div 
                    className="h-full bg-primary-color rounded-full" 
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
            
            <div className="my-4 border-t border-neutral-200"></div>
            
            <h4 className="text-sm font-medium mb-2">Revenue by Room Type</h4>
            {report.byRoomType.map((item, index) => (
              <div key={index} className="mb-2 last:mb-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">{item.name}</span>
                  <span className="text-sm font-medium">{formatCurrency(item.value)}</span>
                </div>
                <div className="w-full h-2 bg-neutral-200 rounded-full">
                  <div 
                    className="h-full bg-primary-color rounded-full" 
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Expenses Report Details */}
        {activeReport === 'expenses' && (
          <div>
            <h4 className="text-sm font-medium mb-2">Expenses by Category</h4>
            {report.byCategory.map((item, index) => (
              <div key={index} className="mb-2 last:mb-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">{item.name}</span>
                  <span className="text-sm font-medium">{formatCurrency(item.value)}</span>
                </div>
                <div className="w-full h-2 bg-neutral-200 rounded-full">
                  <div 
                    className="h-full bg-error-color rounded-full" 
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
            
            <div className="my-4 border-t border-neutral-200"></div>
            
            <h4 className="text-sm font-medium mb-2">Monthly Expense Trend</h4>
            <div className="flex justify-between items-end h-32 mt-4">
              {report.monthlyTrend.map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className="w-8 bg-error-color/80 rounded-t"
                    style={{ 
                      height: `${(item.value / Math.max(...report.monthlyTrend.map(i => i.value))) * 100}%` 
                    }}
                  ></div>
                  <span className="text-xs mt-1">{item.month}</span>
                  <span className="text-xs font-medium">${(item.value / 1000).toFixed(0)}k</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Profit Margin Report Details */}
        {activeReport === 'profitMargin' && (
          <div>
            <h4 className="text-sm font-medium mb-2">Profit Margin by Property</h4>
            {report.byProperty.map((item, index) => (
              <div key={index} className="mb-3 last:mb-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">{item.name}</span>
                  <span className="text-sm font-medium">{formatPercentage(item.margin)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>Revenue: {formatCurrency(item.revenue)}</div>
                  <div>Expenses: {formatCurrency(item.expenses)}</div>
                </div>
                <div className="w-full h-2 bg-neutral-200 rounded-full mt-1">
                  <div 
                    className="h-full bg-success-color rounded-full" 
                    style={{ width: `${item.margin}%` }}
                  ></div>
                </div>
              </div>
            ))}
            
            <div className="my-4 border-t border-neutral-200"></div>
            
            <h4 className="text-sm font-medium mb-2">Quarterly Profit Margin Trend</h4>
            <div className="flex justify-between items-end h-32 mt-4">
              {report.quarterlyTrend.map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className="w-8 bg-success-color/80 rounded-t"
                    style={{ 
                      height: `${(item.value / Math.max(...report.quarterlyTrend.map(i => i.value))) * 100}%` 
                    }}
                  ></div>
                  <span className="text-xs mt-1">{item.quarter}</span>
                  <span className="text-xs font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Occupancy Report Details */}
        {activeReport === 'occupancy' && (
          <div>
            <h4 className="text-sm font-medium mb-2">Occupancy by Property</h4>
            {report.byProperty.map((item, index) => (
              <div key={index} className="mb-2 last:mb-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">{item.name}</span>
                  <span className="text-sm font-medium">{formatPercentage(item.value)} ({item.occupied}/{item.total})</span>
                </div>
                <div className="w-full h-2 bg-neutral-200 rounded-full">
                  <div 
                    className="h-full bg-primary-color rounded-full" 
                    style={{ width: `${item.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
            
            <div className="my-4 border-t border-neutral-200"></div>
            
            <h4 className="text-sm font-medium mb-2">Occupancy by Room Type</h4>
            {report.byRoomType.map((item, index) => (
              <div key={index} className="mb-2 last:mb-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">{item.name}</span>
                  <span className="text-sm font-medium">{formatPercentage(item.value)} ({item.occupied}/{item.total})</span>
                </div>
                <div className="w-full h-2 bg-neutral-200 rounded-full">
                  <div 
                    className="h-full bg-primary-color rounded-full" 
                    style={{ width: `${item.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Other report types would have similar detailed breakdowns */}
        {(activeReport !== 'revenue' && 
          activeReport !== 'expenses' && 
          activeReport !== 'profitMargin' && 
          activeReport !== 'occupancy') && (
          <div className="text-center py-4">
            <p className="text-neutral-600">Detailed breakdown available in full dashboard</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
            >
              View Full Report
            </Button>
          </div>
        )}
      </Card>
    );
  };
  
  return (
    <div className="page-container pb-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Reports</h1>
        
        <Button 
          variant="outline"
          size="sm"
        >
          Export Data
        </Button>
      </div>
      
      {/* Date Range Filter */}
      <Card className="mb-4">
        <form onSubmit={handleDateRangeSubmit} className="flex flex-col">
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => handleDateChange('start', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-neutral-300 outline-none transition-colors focus:border-primary-color focus:ring-2 focus:ring-primary-color/30"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => handleDateChange('end', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-neutral-300 outline-none transition-colors focus:border-primary-color focus:ring-2 focus:ring-primary-color/30"
                required
              />
            </div>
          </div>
          
          <Button 
            type="submit"
            variant="primary"
            size="sm"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Apply Filter'}
          </Button>
        </form>
      </Card>
      
      {/* Report Categories */}
      <div className="flex border-b border-neutral-200 mb-4 overflow-x-auto">
        <button
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
            activeCategory === 'financial' 
              ? 'text-primary-color border-b-2 border-primary-color' 
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
          onClick={() => handleCategoryChange('financial')}
        >
          Financial
        </button>
        
        <button
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
            activeCategory === 'operational' 
              ? 'text-primary-color border-b-2 border-primary-color' 
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
          onClick={() => handleCategoryChange('operational')}
        >
          Operational
        </button>
        
        <button
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
            activeCategory === 'satisfaction' 
              ? 'text-primary-color border-b-2 border-primary-color' 
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
          onClick={() => handleCategoryChange('satisfaction')}
        >
          Guest Satisfaction
        </button>
      </div>
      
      {/* Report Selection */}
      <div className="flex mb-4 overflow-x-auto">
        {activeCategory === 'financial' && (
          <>
            <Button
              variant={activeReport === 'revenue' ? 'primary' : 'outline'}
              size="sm"
              className="mr-2 whitespace-nowrap"
              onClick={() => handleReportChange('revenue')}
            >
              Revenue
            </Button>
            
            <Button
              variant={activeReport === 'expenses' ? 'primary' : 'outline'}
              size="sm"
              className="mr-2 whitespace-nowrap"
              onClick={() => handleReportChange('expenses')}
            >
              Expenses
            </Button>
            
            <Button
              variant={activeReport === 'profitMargin' ? 'primary' : 'outline'}
              size="sm"
              className="whitespace-nowrap"
              onClick={() => handleReportChange('profitMargin')}
            >
              Profit Margin
            </Button>
          </>
        )}
        
        {activeCategory === 'operational' && (
          <>
            <Button
              variant={activeReport === 'occupancy' ? 'primary' : 'outline'}
              size="sm"
              className="mr-2 whitespace-nowrap"
              onClick={() => handleReportChange('occupancy')}
            >
              Occupancy
            </Button>
            
            <Button
              variant={activeReport === 'maintenance' ? 'primary' : 'outline'}
              size="sm"
              className="mr-2 whitespace-nowrap"
              onClick={() => handleReportChange('maintenance')}
            >
              Maintenance
            </Button>
            
            <Button
              variant={activeReport === 'cleaning' ? 'primary' : 'outline'}
              size="sm"
              className="whitespace-nowrap"
              onClick={() => handleReportChange('cleaning')}
            >
              Cleaning
            </Button>
          </>
        )}
        
        {activeCategory === 'satisfaction' && (
          <>
            <Button
              variant={activeReport === 'ratings' ? 'primary' : 'outline'}
              size="sm"
              className="mr-2 whitespace-nowrap"
              onClick={() => handleReportChange('ratings')}
            >
              Ratings
            </Button>
            
            <Button
              variant={activeReport === 'complaints' ? 'primary' : 'outline'}
              size="sm"
              className="whitespace-nowrap"
              onClick={() => handleReportChange('complaints')}
            >
              Complaints
            </Button>
          </>
        )}
      </div>
      
      {/* Report Content */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-neutral-600">Loading report data...</p>
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