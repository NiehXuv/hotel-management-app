import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { StatusBadge } from '../components/common/Badge';

/**
 * PropertyDetails Page Component
 * 
 * Provides a comprehensive interface for viewing and managing a specific property.
 * Features detailed performance metrics, room status tracking, and operational tools.
 * 
 * @module Pages/PropertyDetails
 */
const PropertyDetails = () => {
  // Extract property ID from route parameters
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  
  // Component state initialization
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [roomFilters, setRoomFilters] = useState({
    status: 'all',
    floor: 'all',
    type: 'all',
    search: ''
  });
  
  /**
   * Fetches property details from simulated API
   * This would be replaced with actual API calls in production
   */
  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        setLoading(true);
        
        // Simulate network delay for realistic behavior
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock property data with detailed structure for complete UI representation
        const mockProperty = {
          id: parseInt(id),
          name: 'Sunrise Hotel',
          address: '123 Beach Road, Seaside, CA',
          phone: '(555) 123-4567',
          email: 'info@sunrisehotel.com',
          type: 'hotel',
          status: 'active',
          
          // Room statistics for dashboard metrics
          totalRooms: 24,
          occupiedRooms: 18,
          cleanRooms: 4,
          dirtyRooms: 2,
          maintenanceRooms: 0,
          occupancyRate: 75,
          averageStay: 3.2, // days
          
          // Financial metrics
          averageRating: 4.7,
          priceRange: '$120-350',
          revenue: {
            daily: 3200,
            weekly: 22400,
            monthly: 96000,
            yearToDate: 264000
          },
          
          // Issue tracking
          issues: [
            { id: 1, room: '304', description: 'Leaking shower', priority: 'high', status: 'pending', reportedAt: '2025-03-01T10:15:00' },
            { id: 2, room: '118', description: 'AC not cooling', priority: 'medium', status: 'in-progress', reportedAt: '2025-03-01T08:30:00' }
          ],
          
          // Detailed room inventory with status
          rooms: [
            // First floor rooms
            { id: 101, number: '101', floor: '1', type: 'standard', capacity: 2, status: 'occupied', clean: true, maintenance: false, currentGuest: 'Johnson, Mark', checkOut: '2025-03-05' },
            { id: 102, number: '102', floor: '1', type: 'standard', capacity: 2, status: 'occupied', clean: true, maintenance: false, currentGuest: 'Smith, Emily', checkOut: '2025-03-04' },
            { id: 103, number: '103', floor: '1', type: 'standard', capacity: 2, status: 'vacant', clean: true, maintenance: false, currentGuest: null, checkOut: null },
            { id: 104, number: '104', floor: '1', type: 'standard', capacity: 3, status: 'occupied', clean: true, maintenance: false, currentGuest: 'Davis, Michael', checkOut: '2025-03-03' },
            { id: 105, number: '105', floor: '1', type: 'deluxe', capacity: 3, status: 'occupied', clean: true, maintenance: false, currentGuest: 'Wilson, Jennifer', checkOut: '2025-03-06' },
            { id: 106, number: '106', floor: '1', type: 'deluxe', capacity: 3, status: 'vacant', clean: false, maintenance: false, currentGuest: null, checkOut: null },
            { id: 107, number: '107', floor: '1', type: 'suite', capacity: 4, status: 'occupied', clean: true, maintenance: false, currentGuest: 'Brown, Robert', checkOut: '2025-03-07' },
            { id: 108, number: '108', floor: '1', type: 'suite', capacity: 4, status: 'occupied', clean: true, maintenance: false, currentGuest: 'Taylor, Sarah', checkOut: '2025-03-05' },
            
            // Second floor rooms
            { id: 201, number: '201', floor: '2', type: 'standard', capacity: 2, status: 'occupied', clean: true, maintenance: false, currentGuest: 'Anderson, James', checkOut: '2025-03-04' },
            { id: 202, number: '202', floor: '2', type: 'standard', capacity: 2, status: 'occupied', clean: true, maintenance: false, currentGuest: 'Martin, Lisa', checkOut: '2025-03-03' },
            { id: 203, number: '203', floor: '2', type: 'standard', capacity: 2, status: 'vacant', clean: true, maintenance: false, currentGuest: null, checkOut: null },
            { id: 204, number: '204', floor: '2', type: 'standard', capacity: 3, status: 'occupied', clean: true, maintenance: false, currentGuest: 'Clark, Daniel', checkOut: '2025-03-06' },
            { id: 205, number: '205', floor: '2', type: 'deluxe', capacity: 3, status: 'occupied', clean: true, maintenance: false, currentGuest: 'Lewis, Jessica', checkOut: '2025-03-05' },
            { id: 206, number: '206', floor: '2', type: 'deluxe', capacity: 3, status: 'occupied', clean: true, maintenance: false, currentGuest: 'Walker, Matthew', checkOut: '2025-03-04' },
            { id: 207, number: '207', floor: '2', type: 'suite', capacity: 4, status: 'vacant', clean: false, maintenance: false, currentGuest: null, checkOut: null },
            { id: 208, number: '208', floor: '2', type: 'suite', capacity: 4, status: 'occupied', clean: true, maintenance: false, currentGuest: 'Hall, Amanda', checkOut: '2025-03-07' },
            
            // Third floor rooms
            { id: 301, number: '301', floor: '3', type: 'standard', capacity: 2, status: 'occupied', clean: true, maintenance: false, currentGuest: 'Young, David', checkOut: '2025-03-03' },
            { id: 302, number: '302', floor: '3', type: 'standard', capacity: 2, status: 'occupied', clean: true, maintenance: false, currentGuest: 'Allen, Michelle', checkOut: '2025-03-05' },
            { id: 303, number: '303', floor: '3', type: 'standard', capacity: 2, status: 'occupied', clean: true, maintenance: false, currentGuest: 'Scott, Christopher', checkOut: '2025-03-04' },
            { id: 304, number: '304', floor: '3', type: 'standard', capacity: 3, status: 'checkout', clean: false, maintenance: true, currentGuest: null, checkOut: '2025-03-01' },
            { id: 305, number: '305', floor: '3', type: 'deluxe', capacity: 3, status: 'occupied', clean: true, maintenance: false, currentGuest: 'King, Elizabeth', checkOut: '2025-03-06' },
            { id: 306, number: '306', floor: '3', type: 'deluxe', capacity: 3, status: 'vacant', clean: true, maintenance: false, currentGuest: null, checkOut: null },
            { id: 307, number: '307', floor: '3', type: 'suite', capacity: 4, status: 'occupied', clean: true, maintenance: false, currentGuest: 'Wright, Thomas', checkOut: '2025-03-05' },
            { id: 308, number: '308', floor: '3', type: 'penthouse', capacity: 6, status: 'vacant', clean: true, maintenance: false, currentGuest: null, checkOut: null }
          ],
          
          // Staff assigned to this property
          staff: [
            { id: 101, name: 'Maria Rodriguez', role: 'cleaner', status: 'active' },
            { id: 102, name: 'John Thompson', role: 'maintenance', status: 'active' },
            { id: 103, name: 'Sophia Johnson', role: 'receptionist', status: 'active' },
            { id: 104, name: 'David Kim', role: 'receptionist', status: 'active' },
            { id: 105, name: 'Emily Chen', role: 'host', status: 'active' }
          ],
          
          // Recent activity log
          recentActivity: [
            { id: 1, action: 'check-in', details: 'Room 207 checked in', user: 'Sophia Johnson', timestamp: '2025-03-01T14:25:00' },
            { id: 2, action: 'check-out', details: 'Room 304 checked out', user: 'David Kim', timestamp: '2025-03-01T10:15:00' },
            { id: 3, action: 'maintenance', details: 'Reported issue in Room 304', user: 'John Thompson', timestamp: '2025-03-01T10:30:00' },
            { id: 4, action: 'cleaning', details: 'Room 106 marked for cleaning', user: 'Maria Rodriguez', timestamp: '2025-03-01T11:45:00' }
          ]
        };
        
        setProperty(mockProperty);
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
   * Changes active tab and ensures proper UI state reset
   * @param {string} tabId - Identifier for the tab to display
   */
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    
    // Reset filters when changing to rooms tab
    if (tabId === 'rooms') {
      setRoomFilters({
        status: 'all',
        floor: 'all',
        type: 'all',
        search: ''
      });
    }
  };
  
  /**
   * Updates room filter criteria
   * @param {string} filterName - Name of the filter to update
   * @param {string} value - New filter value
   */
  const handleFilterChange = (filterName, value) => {
    setRoomFilters(prevFilters => ({
      ...prevFilters,
      [filterName]: value
    }));
  };
  
  /**
   * Applies all active filters to room data
   * @returns {Array} - Filtered room list
   */
  const getFilteredRooms = () => {
    if (!property || !property.rooms) return [];
    
    return property.rooms.filter(room => {
      // Status filter
      const matchesStatus = roomFilters.status === 'all' || 
        (roomFilters.status === 'occupied' && room.status === 'occupied') ||
        (roomFilters.status === 'vacant' && room.status === 'vacant') ||
        (roomFilters.status === 'checkout' && room.status === 'checkout') ||
        (roomFilters.status === 'dirty' && !room.clean) ||
        (roomFilters.status === 'maintenance' && room.maintenance);
      
      // Floor filter
      const matchesFloor = roomFilters.floor === 'all' || room.floor === roomFilters.floor;
      
      // Room type filter
      const matchesType = roomFilters.type === 'all' || room.type === roomFilters.type;
      
      // Search filter - match room number or guest name
      const matchesSearch = !roomFilters.search.trim() || 
        room.number.toLowerCase().includes(roomFilters.search.toLowerCase()) ||
        (room.currentGuest && room.currentGuest.toLowerCase().includes(roomFilters.search.toLowerCase()));
      
      return matchesStatus && matchesFloor && matchesType && matchesSearch;
    });
  };
  
  /**
   * Produces a user-friendly status badge for room display
   * @param {Object} room - Room data object
   * @returns {JSX.Element} - Status badge with appropriate styling
   */
  const getRoomStatusBadge = (room) => {
    if (room.status === 'occupied') {
      return <StatusBadge status="active">Occupied</StatusBadge>;
    } else if (room.status === 'vacant' && room.clean) {
      return <StatusBadge status="success">Available</StatusBadge>;
    } else if (room.status === 'vacant' && !room.clean) {
      return <StatusBadge status="warning">Needs Cleaning</StatusBadge>;
    } else if (room.status === 'checkout') {
      return <StatusBadge status="pending">Checkout</StatusBadge>;
    } else if (room.maintenance) {
      return <StatusBadge status="danger">Maintenance</StatusBadge>;
    }
    
    return <StatusBadge status="neutral">{room.status}</StatusBadge>;
  };
  
  /**
   * Formats date for display
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date for display
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
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
   * Navigates to task creation with property pre-selected
   */
  const handleCreateTask = () => {
    navigate('/tasks/create', { state: { preselectedProperty: property.name } });
  };
  
  /**
   * Renders view based on loading/error state
   */
  if (loading) {
    return (
      <div className="page-container flex justify-center items-center py-12">
        <div className="text-center">
          <p className="text-neutral-600">Loading property details...</p>
        </div>
      </div>
    );
  }
  
  if (error || !property) {
    return (
      <div className="page-container flex justify-center items-center py-12">
        <div className="text-center">
          <p className="text-error-color mb-4">{error || 'Property not found'}</p>
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
   * Renders the overview tab content with key metrics
   * @returns {JSX.Element} Overview dashboard
   */
  const renderOverviewTab = () => {
    return (
      <div>
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="bg-primary-color/10 border-l-4 border-primary-color">
            <h3 className="text-sm font-semibold text-neutral-600">Occupancy Rate</h3>
            <p className="text-2xl font-bold text-primary-color">{property.occupancyRate}%</p>
            <p className="text-xs text-neutral-500 mt-1">
              {property.occupiedRooms} of {property.totalRooms} rooms
            </p>
          </Card>
          
          <Card className="bg-success-color/10 border-l-4 border-success-color">
            <h3 className="text-sm font-semibold text-neutral-600">Daily Revenue</h3>
            <p className="text-2xl font-bold text-success-color">{formatCurrency(property.revenue.daily)}</p>
            <p className="text-xs text-neutral-500 mt-1">
              Average stay: {property.averageStay} days
            </p>
          </Card>
        </div>
        
        {/* Room Status Summary */}
        <Card className="mb-4">
          <h3 className="text-md font-semibold mb-3">Room Status</h3>
          
          <div className="grid grid-cols-4 gap-2 mb-3">
            <div className="text-center p-2 bg-primary-color/10 rounded">
              <p className="text-2xl font-semibold text-primary-color">{property.occupiedRooms}</p>
              <p className="text-xs">Occupied</p>
            </div>
            
            <div className="text-center p-2 bg-success-color/10 rounded">
              <p className="text-2xl font-semibold text-success-color">{property.cleanRooms}</p>
              <p className="text-xs">Available</p>
            </div>
            
            <div className="text-center p-2 bg-warning-color/10 rounded">
              <p className="text-2xl font-semibold text-warning-color">{property.dirtyRooms}</p>
              <p className="text-xs">Needs Cleaning</p>
            </div>
            
            <div className="text-center p-2 bg-error-color/10 rounded">
              <p className="text-2xl font-semibold text-error-color">{property.maintenanceRooms}</p>
              <p className="text-xs">Maintenance</p>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={() => handleTabChange('rooms')}
          >
            View All Rooms
          </Button>
        </Card>
        
        {/* Active Issues */}
        <Card className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-md font-semibold">Active Issues</h3>
            <Button 
              variant="text" 
              size="sm"
              onClick={handleCreateTask}
            >
              Create Task
            </Button>
          </div>
          
          {property.issues.length > 0 ? (
            property.issues.map(issue => (
              <div key={issue.id} className="py-2 border-b border-neutral-100 last:border-0">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium">Room {issue.room}</span>
                  <StatusBadge status={issue.priority}>{issue.priority}</StatusBadge>
                </div>
                <p className="text-sm text-neutral-600 mb-1">{issue.description}</p>
                <div className="flex justify-between items-center">
                  <StatusBadge status={issue.status} size="sm" />
                  <span className="text-xs text-neutral-500">
                    Reported {formatDate(issue.reportedAt)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center py-2 text-neutral-500">No active issues</p>
          )}
        </Card>
        
        {/* Recent Activity */}
        <Card>
          <h3 className="text-md font-semibold mb-3">Recent Activity</h3>
          
          {property.recentActivity.map(activity => (
            <div key={activity.id} className="py-2 border-b border-neutral-100 last:border-0">
              <div className="flex items-start">
                <div className="h-2 w-2 rounded-full bg-primary-color mt-2 mr-2"></div>
                <div>
                  <p className="text-sm">{activity.details}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-neutral-600">{activity.user}</span>
                    <span className="text-xs text-neutral-500">
                      {new Date(activity.timestamp).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    );
  };
  
  /**
   * Renders the rooms tab with filtering and detailed room list
   * @returns {JSX.Element} Rooms management interface
   */
  const renderRoomsTab = () => {
    const filteredRooms = getFilteredRooms();
    
    return (
      <div>
        {/* Filters */}
        <Card className="mb-4">
          <Input
            placeholder="Search room number or guest..."
            value={roomFilters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            startIcon={<span>🔍</span>}
            className="mb-3"
          />
          
          <div className="grid grid-cols-3 gap-3">
            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                Status
              </label>
              <select 
                className="w-full px-2 py-1.5 rounded-md border border-neutral-300 text-sm"
                value={roomFilters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="occupied">Occupied</option>
                <option value="vacant">Vacant</option>
                <option value="checkout">Checkout</option>
                <option value="dirty">Needs Cleaning</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            
            {/* Floor Filter */}
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                Floor
              </label>
              <select 
                className="w-full px-2 py-1.5 rounded-md border border-neutral-300 text-sm"
                value={roomFilters.floor}
                onChange={(e) => handleFilterChange('floor', e.target.value)}
              >
                <option value="all">All Floors</option>
                <option value="1">1st Floor</option>
                <option value="2">2nd Floor</option>
                <option value="3">3rd Floor</option>
              </select>
            </div>
            
            {/* Room Type Filter */}
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                Room Type
              </label>
              <select 
                className="w-full px-2 py-1.5 rounded-md border border-neutral-300 text-sm"
                value={roomFilters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="standard">Standard</option>
                <option value="deluxe">Deluxe</option>
                <option value="suite">Suite</option>
                <option value="penthouse">Penthouse</option>
              </select>
            </div>
          </div>
        </Card>
        
        {/* Room List */}
        {filteredRooms.length > 0 ? (
          filteredRooms.map(room => (
            <Card key={room.id} className="mb-3">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">Room {room.number}</h3>
                {getRoomStatusBadge(room)}
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <p className="text-xs text-neutral-500">Type</p>
                  <p className="text-sm capitalize">{room.type}</p>
                </div>
                
                <div>
                  <p className="text-xs text-neutral-500">Capacity</p>
                  <p className="text-sm">{room.capacity} {room.capacity === 1 ? 'Person' : 'People'}</p>
                </div>
                
                {room.currentGuest && (
                  <>
                    <div>
                      <p className="text-xs text-neutral-500">Guest</p>
                      <p className="text-sm">{room.currentGuest}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-neutral-500">Check-out</p>
                      <p className="text-sm">{formatDate(room.checkOut)}</p>
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex justify-end space-x-2">
                {room.status === 'checkout' && (
                  <Button variant="primary" size="sm">Mark Cleaned</Button>
                )}
                
                {!room.clean && room.status !== 'occupied' && (
                  <Button variant="outline" size="sm">Schedule Cleaning</Button>
                )}
                
                {room.maintenance && (
                  <Button variant="danger" size="sm">Maintenance</Button>
                )}
                
                {room.status === 'vacant' && room.clean && !room.maintenance && (
                  <Button variant="success" size="sm">Book Now</Button>
                )}
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-6">
            <p className="text-neutral-600 mb-2">No rooms match your filters</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setRoomFilters({
                status: 'all',
                floor: 'all',
                type: 'all',
                search: ''
              })}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    );
  };
  
  /**
   * Renders the staff tab with team management interface
   * @returns {JSX.Element} Staff management view
   */
  const renderStaffTab = () => {
    return (
      <div>
        <Card className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-semibold">Assigned Staff</h3>
            {hasPermission('canManageUsers') && (
              <Button 
                variant="outline" 
                size="sm"
              >
                Assign Staff
              </Button>
            )}
          </div>
          
          {property.staff.map(person => (
            <div key={person.id} className="flex justify-between items-center py-3 border-b border-neutral-100 last:border-0">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary-color/10 flex items-center justify-center text-primary-color mr-3">
                  {person.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{person.name}</p>
                  <p className="text-xs text-neutral-600 capitalize">{person.role}</p>
                </div>
              </div>
              
              <StatusBadge status={person.status} />
            </div>
          ))}
        </Card>
        
        <Card>
          <h3 className="text-md font-semibold mb-3">Staff Schedule</h3>
          <p className="text-center py-4 text-neutral-600">
            Staff scheduling feature coming soon
          </p>
        </Card>
      </div>
    );
  };
  
  /**
   * Renders the financial data tab
   * @returns {JSX.Element} Financial overview
   */
  const renderFinancialsTab = () => {
    return (
      <div>
        {/* Revenue Overview */}
        <Card className="mb-4">
          <h3 className="text-md font-semibold mb-3">Revenue Overview</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <p className="text-xs text-neutral-500">Daily Revenue</p>
              <p className="text-xl font-semibold">{formatCurrency(property.revenue.daily)}</p>
            </div>
            
            <div>
              <p className="text-xs text-neutral-500">Weekly Revenue</p>
              <p className="text-xl font-semibold">{formatCurrency(property.revenue.weekly)}</p>
            </div>
            
            <div>
              <p className="text-xs text-neutral-500">Monthly Revenue</p>
              <p className="text-xl font-semibold">{formatCurrency(property.revenue.monthly)}</p>
            </div>
            
            <div>
              <p className="text-xs text-neutral-500">Year-to-Date</p>
              <p className="text-xl font-semibold">{formatCurrency(property.revenue.yearToDate)}</p>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={() => navigate('/reports')}
          >
            View Detailed Reports
          </Button>
        </Card>
        
        {/* Performance Metrics */}
        <Card className="mb-4">
          <h3 className="text-md font-semibold mb-3">Property Performance</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-neutral-500">Occupancy Rate</p>
              <div className="flex items-center mt-1">
                <div className="w-full h-2 bg-neutral-200 rounded-full mr-2">
                  <div 
                    className="h-full bg-primary-color rounded-full" 
                    style={{ width: `${property.occupancyRate}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{property.occupancyRate}%</span>
              </div>
            </div>
            
            <div>
              <p className="text-xs text-neutral-500">Avg. Rating</p>
              <div className="flex items-center mt-1">
                <div className="w-full h-2 bg-neutral-200 rounded-full mr-2">
                  <div 
                    className="h-full bg-warning-color rounded-full" 
                    style={{ width: `${(property.averageRating / 5) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">⭐ {property.averageRating}</span>
              </div>
            </div>
            
            <div>
              <p className="text-xs text-neutral-500">Price Range</p>
              <p className="text-sm font-medium mt-1">{property.priceRange}</p>
            </div>
            
            <div>
              <p className="text-xs text-neutral-500">Avg. Stay Duration</p>
              <p className="text-sm font-medium mt-1">{property.averageStay} days</p>
            </div>
          </div>
        </Card>
        
        {/* Financial Actions */}
        <Card>
          <h3 className="text-md font-semibold mb-3">Financial Actions</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="primary"
              onClick={() => navigate('/reports')}
            >
              Generate Reports
            </Button>
            
            <Button
              variant="outline"
            >
              Export Data
            </Button>
          </div>
        </Card>
      </div>
    );
  };
  
  return (
    <div className="page-container pb-6">
      {/* Property Header */}
      <div className="flex items-center mb-2">
        <button 
          className="mr-2 p-1 rounded-full hover:bg-neutral-200"
          onClick={() => navigate('/properties')}
          aria-label="Back to properties"
        >
          ←
        </button>
        <h1 className="text-xl font-bold">{property.name}</h1>
      </div>
      
      {/* Property Address & Details */}
      <div className="mb-4">
        <p className="text-sm text-neutral-600">{property.address}</p>
        <div className="flex items-center mt-1">
          <StatusBadge 
            status={property.status === 'active' ? 'active' : 'pending'}
          >
            {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
          </StatusBadge>
          
          <span className="text-xs text-neutral-500 ml-2">
            {property.totalRooms} Rooms
          </span>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Button
          variant="primary"
          onClick={handleCreateTask}
        >
          Create Task
        </Button>
        
        {hasPermission('canManageProperties') && (
          <Button
            variant="outline"
          >
            Edit Property
          </Button>
        )}
      </div>
      
      {/* Tab Navigation */}
      <div className="flex border-b border-neutral-200 mb-4 overflow-x-auto">
        <button
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
            activeTab === 'overview' 
              ? 'text-primary-color border-b-2 border-primary-color' 
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
          onClick={() => handleTabChange('overview')}
        >
          Overview
        </button>
        
        <button
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
            activeTab === 'rooms' 
              ? 'text-primary-color border-b-2 border-primary-color' 
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
          onClick={() => handleTabChange('rooms')}
        >
          Rooms
        </button>
        
        <button
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
            activeTab === 'staff' 
              ? 'text-primary-color border-b-2 border-primary-color' 
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
          onClick={() => handleTabChange('staff')}
        >
          Staff
        </button>
        
        <button
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
            activeTab === 'financials' 
              ? 'text-primary-color border-b-2 border-primary-color' 
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
          onClick={() => handleTabChange('financials')}
        >
          Financials
        </button>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'overview' && renderOverviewTab()}
      {activeTab === 'rooms' && renderRoomsTab()}
      {activeTab === 'staff' && renderStaffTab()}
      {activeTab === 'financials' && renderFinancialsTab()}
    </div>
  );
};

export default PropertyDetails;