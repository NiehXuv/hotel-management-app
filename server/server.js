import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { StatusBadge } from '../components/common/Badge';

// API service updated for localhost:3000 with your routes
const api = {
  getHotelDetails: async (hotelId) => {
    const response = await fetch(`http://localhost:3000/api/hotels/${hotelId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(`Failed to fetch hotel details for hotel ${hotelId}`);
    return response.json();
  },
  getRoomsForHotel: async (hotelId) => {
    const response = await fetch(`http://localhost:3000/api/hotels/${hotelId}/rooms`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(`Failed to fetch rooms for hotel ${hotelId}`);
    return response.json();
  },
};

/**
 * PropertyDetails Page Component
 * 
 * Provides a comprehensive interface for viewing and managing a specific property.
 * Features detailed room status tracking based on available backend routes.
 * 
 * @module Pages/PropertyDetails
 */
const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [roomFilters, setRoomFilters] = useState({
    status: 'all',
    type: 'all',
    search: '',
  });

  // Fetch property details using available routes
  const fetchPropertyDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch hotel details
      console.log(`Fetching hotel details for hotel ${id}...`);
      const hotelResponse = await api.getHotelDetails(id);
      console.log('Hotel Response:', hotelResponse);
      const hotelData = hotelResponse.data;

      // Fetch rooms for the hotel
      console.log(`Fetching rooms for hotel ${id}...`);
      const roomsResponse = await api.getRoomsForHotel(id);
      console.log('Rooms Response:', roomsResponse);

      const roomsList = roomsResponse.data || [];
      const totalRooms = roomsResponse.roomCount || roomsList.length;
      const occupiedRooms = roomsResponse.occupiedCount || roomsList.filter(room => room.Status === 'Occupied').length;
      const cleanRooms = roomsList.filter(room => room.Status === 'Vacant').length; // Assuming Vacant rooms are clean
      const dirtyRooms = 0; // Not tracked in DB
      const maintenanceRooms = 0; // Not tracked in DB
      const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

      setProperty({
        id: parseInt(id),
        Name: hotelData.Name,
        Location: hotelData.Location,
        PhoneNumber: hotelData.PhoneNumber,
        Email: hotelData.Email,
        Description: hotelData.Description,
        type: 'hotel',
        Status: 'active', // Not in DB; assuming active
        totalRooms,
        occupiedRooms,
        cleanRooms,
        dirtyRooms,
        maintenanceRooms,
        occupancyRate,
        rooms: roomsList.map(room => ({
          id: room.id,
          RoomName: room.RoomName,
          number: room.roomNumber,
          type: room.type || 'standard', // Not in DB; default to 'standard'
          Status: room.Status || 'Vacant',
          PriceByDay: room.PriceByDay || 0,
          PriceByNight: room.PriceByNight || 0,
          PriceBySection: room.PriceBySection || 0,
          Description: room.Description || '',
          UpdatedAt: room.UpdatedAt || null,
        })),
        staff: [],
        issues: [],
        recentActivity: [],
      });
    } catch (err) {
      console.error('Fetch Error:', err.message);
      setError(`Failed to load property details: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPropertyDetails();
  }, [fetchPropertyDetails]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'rooms') {
      setRoomFilters({ status: 'all', type: 'all', search: '' });
    }
  };

  const handleFilterChange = (filterName, value) => {
    setRoomFilters(prevFilters => ({ ...prevFilters, [filterName]: value }));
  };

  const getFilteredRooms = () => {
    if (!property || !property.rooms) return [];
    return property.rooms.filter(room => {
      const matchesStatus =
        roomFilters.status === 'all' ||
        (roomFilters.status === 'occupied' && room.Status === 'Occupied') ||
        (roomFilters.status === 'vacant' && room.Status === 'Vacant') ||
        (roomFilters.status === 'checkout' && room.Status === 'Checkout');
      const matchesType = roomFilters.type === 'all' || room.type === roomFilters.type;
      const matchesSearch =
        !roomFilters.search.trim() ||
        room.number.toLowerCase().includes(roomFilters.search.toLowerCase()) ||
        room.RoomName.toLowerCase().includes(roomFilters.search.toLowerCase());
      return matchesStatus && matchesType && matchesSearch;
    });
  };

  const getRoomStatusBadge = (room) => {
    if (room.Status === 'Occupied') return <StatusBadge status="active">Occupied</StatusBadge>;
    if (room.Status === 'Vacant') return <StatusBadge status="success">Available</StatusBadge>;
    if (room.Status === 'Checkout') return <StatusBadge status="pending">Checkout</StatusBadge>;
    return <StatusBadge status="neutral">{room.Status}</StatusBadge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatCurrency = (value) => `$${value.toLocaleString()}`;

  const handleCreateTask = () => {
    navigate('/tasks/create', { state: { preselectedProperty: property.Name } });
  };

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
          <Button variant="outline" onClick={() => navigate('/properties')}>
            Back to Properties
          </Button>
        </div>
      </div>
    );
  }

  const renderOverviewTab = () => (
    <div>
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
          <p className="text-2xl font-bold text-success-color">N/A</p>
          <p className="text-xs text-neutral-500 mt-1">Revenue data not available</p>
        </Card>
      </div>
      <Card className="mb-4">
        <h3 className="text-md font-semibold mb-3">Room Status</h3>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center p-2 bg-primary-color/10 rounded">
            <p className="text-2xl font-semibold text-primary-color">{property.occupiedRooms}</p>
            <p className="text-xs">Occupied</p>
          </div>
          <div className="text-center p-2 bg-success-color/10 rounded">
            <p className="text-2xl font-semibold text-success-color">{property.cleanRooms}</p>
            <p className="text-xs">Available</p>
          </div>
          <div className="text-center p-2 bg-error-color/10 rounded">
            <p className="text-2xl font-semibold text-error-color">{property.maintenanceRooms}</p>
            <p className="text-xs">Maintenance</p>
          </div>
        </div>
        <Button variant="outline" size="sm" fullWidth onClick={() => handleTabChange('rooms')}>
          View All Rooms
        </Button>
      </Card>
      <Card className="mb-4">
        <h3 className="text-md font-semibold mb-3">Active Issues</h3>
        <p className="text-center py-2 text-neutral-500">No issues data available</p>
      </Card>
      <Card>
        <h3 className="text-md font-semibold mb-3">Recent Activity</h3>
        <p className="text-center py-2 text-neutral-500">No recent activity data available</p>
      </Card>
    </div>
  );

  const renderRoomsTab = () => {
    const filteredRooms = getFilteredRooms();
    return (
      <div>
        <Card className="mb-4">
          <Input
            placeholder="Search room number or name..."
            value={roomFilters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            startIcon={<span>🔍</span>}
            className="mb-3"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Status</label>
              <select
                className="w-full px-2 py-1.5 rounded-md border border-neutral-300 text-sm"
                value={roomFilters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="occupied">Occupied</option>
                <option value="vacant">Vacant</option>
                <option value="checkout">Checkout</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Room Type</label>
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
        {filteredRooms.length > 0 ? (
          filteredRooms.map(room => (
            <Card key={room.id} className="mb-3">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">Room {room.number}</h3>
                {getRoomStatusBadge(room)}
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <p className="text-xs text-neutral-500">Name</p>
                  <p className="text-sm">{room.RoomName}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Type</p>
                  <p className="text-sm capitalize">{room.type}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Price By Day</p>
                  <p className="text-sm">{formatCurrency(room.PriceByDay)}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Price By Night</p>
                  <p className="text-sm">{formatCurrency(room.PriceByNight)}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Price By Section</p>
                  <p className="text-sm">{formatCurrency(room.PriceBySection)}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Last Updated</p>
                  <p className="text-sm">{formatDate(room.UpdatedAt)}</p>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                {room.Status === 'Checkout' && <Button variant="primary" size="sm">Mark Cleaned</Button>}
                {room.Status === 'Vacant' && <Button variant="success" size="sm">Book Now</Button>}
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-6">
            <p className="text-neutral-600 mb-2">No rooms match your filters</p>
            <Button variant="outline" size="sm" onClick={() => setRoomFilters({ status: 'all', type: 'all', search: '' })}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderStaffTab = () => (
    <div>
      <Card className="mb-4">
        <h3 className="text-md font-semibold mb-3">Assigned Staff</h3>
        <p className="text-center py-2 text-neutral-500">Staff data not available</p>
      </Card>
    </div>
  );

  const renderFinancialsTab = () => (
    <div>
      <Card className="mb-4">
        <h3 className="text-md font-semibold mb-3">Revenue Overview</h3>
        <p className="text-center py-2 text-neutral-500">Financial data not available</p>
      </Card>
    </div>
  );

  return (
    <div className="page-container pb-6">
      <div className="flex items-center mb-2">
        <button className="mr-2 p-1 rounded-full hover:bg-neutral-200" onClick={() => navigate('/properties')} aria-label="Back to properties">
          ←
        </button>
        <h1 className="text-xl font-bold">{property.Name}</h1>
      </div>
      <div className="mb-4">
        <p className="text-sm text-neutral-600">{property.Location}</p>
        <div className="flex items-center mt-1">
          <StatusBadge status={property.Status === 'active' ? 'active' : 'pending'}>
            {property.Status.charAt(0).toUpperCase() + property.Status.slice(1)}
          </StatusBadge>
          <span className="text-xs text-neutral-500 ml-2">{property.totalRooms} Rooms</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Button variant="primary" onClick={handleCreateTask}>Create Task</Button>
        {hasPermission('canManageProperties') && <Button variant="outline">Edit Property</Button>}
      </div>
      <div className="flex border-b border-neutral-200 mb-4 overflow-x-auto">
        <button
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${activeTab === 'overview' ? 'text-primary-color border-b-2 border-primary-color' : 'text-neutral-600 hover:text-neutral-900'}`}
          onClick={() => handleTabChange('overview')}
        >
          Overview
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${activeTab === 'rooms' ? 'text-primary-color border-b-2 border-primary-color' : 'text-neutral-600 hover:text-neutral-900'}`}
          onClick={() => handleTabChange('rooms')}
        >
          Rooms
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${activeTab === 'staff' ? 'text-primary-color border-b-2 border-primary-color' : 'text-neutral-600 hover:text-neutral-900'}`}
          onClick={() => handleTabChange('staff')}
        >
          Staff
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${activeTab === 'financials' ? 'text-primary-color border-b-2 border-primary-color' : 'text-neutral-600 hover:text-neutral-900'}`}
          onClick={() => handleTabChange('financials')}
        >
          Financials
        </button>
      </div>
      {activeTab === 'overview' && renderOverviewTab()}
      {activeTab === 'rooms' && renderRoomsTab()}
      {activeTab === 'staff' && renderStaffTab()}
      {activeTab === 'financials' && renderFinancialsTab()}
    </div>
  );
};

export default PropertyDetails;