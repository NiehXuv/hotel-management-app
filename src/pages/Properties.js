import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { StatusBadge } from '../components/common/Badge';

// API service with your specific routes
const api = {
  getProperties: async () => {
    const response = await fetch('http://localhost:5000/hotels', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to fetch properties');
    return response.json();
  },
  getRoomsForHotel: async (hotelId) => {
    const response = await fetch(`http://localhost:5000/api/hotels/${hotelId}/rooms`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(`Failed to fetch rooms for hotel ${hotelId}`);
    return response.json();
  },
};

const Properties = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  
  const [hotelsList, setHotelsList] = useState([]);
  const [statistics, setStatistics] = useState({
    totalProperties: 0,
    totalRooms: 0,
    occupancyRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filters, setFilters] = useState({ search: '' });

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const propertiesResponse = await api.getProperties();
      const hotels = propertiesResponse.data;

      // Fetch room data for each hotel
      const formattedProperties = await Promise.all(
        hotels.map(async (property) => {
          const roomsResponse = await api.getRoomsForHotel(property.hotelId);
          const roomData = roomsResponse.data || [];
          
          return {
            id: property.hotelId,
            name: property.Name,
            address: property.Location,
            type: 'hotel',
            status: 'active',
            description: property.Description,
            email: property.Email,
            phoneNumber: property.PhoneNumber,
            totalRooms: roomsResponse.roomCount || 0,
            occupiedCount: roomsResponse.occupiedCount || 0,
            occupancyRate: roomsResponse.roomCount > 0 
              ? Math.round((roomsResponse.occupiedCount / roomsResponse.roomCount) * 100) 
              : 0,
            cleanRooms: 0, // You could extend your backend to include this
            dirtyRooms: 0, // Same here
            maintenanceRooms: 0, // Same here
            averageRating: 0,
            priceRange: 'N/A',
            revenue: { daily: 0, monthly: 0 },
            issues: 0,
          };
        })
      );

      setHotelsList(formattedProperties);
      setStatistics({
        totalProperties: propertiesResponse.statistics.totalProperties,
        totalRooms: formattedProperties.reduce((sum, hotel) => sum + hotel.totalRooms, 0),
        occupancyRate: formattedProperties.length > 0 
          ? Math.round(
              formattedProperties.reduce((sum, hotel) => sum + hotel.occupiedCount, 0) /
              formattedProperties.reduce((sum, hotel) => sum + hotel.totalRooms, 0) * 100
            ) 
          : 0,
      });
    } catch (error) {
      console.error('Error fetching properties:', error);
      setError('Failed to load properties. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleFilterChange = useCallback((filterName, value) => {
    setFilters(prevFilters => ({ ...prevFilters, [filterName]: value }));
  }, []);

  const filteredProperties = useMemo(() => {
    return hotelsList.filter(property => {
      const matchesSearch = filters.search === '' || 
        property.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        property.address.toLowerCase().includes(filters.search.toLowerCase());
      return matchesSearch;
    });
  }, [hotelsList, filters]);

  const handlePropertyClick = useCallback((propertyId) => {
    navigate(`/properties/${propertyId}`);
  }, [navigate]);

  const renderStatusBadge = useCallback((status) => {
    const statusMap = { active: 'active', maintenance: 'pending', inactive: 'inactive' };
    return <StatusBadge status={statusMap[status] || 'neutral'} />;
  }, []);

  const handleAddProperty = useCallback(() => {
    navigate('/hotel/create');
  }, [navigate]);

  return (
    <div style={styles.container}>
      <div className="flex justify-center items-center mb-4">
        <h1 className="text-xl font-bold">PROPERTIES</h1>
      </div>

      <Card style={styles.staticBoard}>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <h3 className="text-sm font-medium text-neutral-600">Total Properties</h3>
            <p className="text-3xl font-bold text-primary">{statistics.totalProperties}</p>
          </div>
          <div className="text-center">
            <h3 className="text-sm font-medium text-neutral-600">Total Rooms</h3>
            <p className="text-3xl font-bold text-primary">{statistics.totalRooms}</p>
          </div>
          <div className="text-center">
            <h3 className="text-sm font-medium text-neutral-600">Occupancy Rate</h3>
            <p className="text-3xl font-bold text-primary">{statistics.occupancyRate}%</p>
          </div>
        </div>
      </Card>

      <div>
        <div className="flex mb-3">
          <div className="flex-1 relative">
            <Input
              placeholder="Search properties by name or location..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              startIcon={<span className="text-neutral-400">🔍</span>}
              className="pr-10 shadow-soft-sm"
            />
            {filters.search && (
              <button 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1"
                onClick={() => handleFilterChange('search', '')}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="stagger-children">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="mb-3 animate-pulse">
              <div className="bg-neutral-200 h-6 w-3/4 rounded mb-2"></div>
              <div className="bg-neutral-200 h-4 w-1/2 rounded mb-3"></div>
            </Card>
          ))
        ) : error ? (
          <div className="text-center py-8 bg-white rounded-lg shadow-soft-sm">
            <div className="text-4xl mb-2">⚠️</div>
            <p className="text-neutral-600 mb-2 font-medium">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchProperties}>
              Try Again
            </Button>
          </div>
        ) : filteredProperties.length > 0 ? (
          filteredProperties.map((property) => (
            <Card
              style = {styles.hotelCard} 
              key={property.id}
              className="mb-3 card-interactive"
              onClick={() => handlePropertyClick(property.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h2 className="font-medium text-lg">{property.name}</h2>
                  <p className="text-sm text-neutral-600">{property.address}</p>
                  <p className="text-sm text-neutral-500">
                    Rooms: {property.totalRooms} | Occupied: {property.occupiedCount} 
                    ({property.occupancyRate}%)
                  </p>
                </div>
                {renderStatusBadge(property.status)}
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 bg-white rounded-lg shadow-soft-sm">
            <div className="text-4xl mb-2">🏨</div>
            <p className="text-neutral-600 mb-2 font-medium">No properties match your search</p>
            <p className="text-neutral-500 mb-4 text-sm">Try adjusting your search criteria</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleFilterChange('search', '')}
            >
              Clear Search
            </Button>
          </div>
        )}
      </div>
      {hasPermission('canManageProperties') && (
        <Button 
          variant="primary" 
          size="sm"
          onClick={handleAddProperty}
          style={styles.CreateButton}
        >
          Add Property
        </Button>
      )}
    </div>
  );
};

const styles = {
  staticBoard: { width: '100%', margin: '1em auto', height: '7em' },
  container: { width: '100vw', maxWidth: '480px', padding: '1em', marginBottom:'3em' },
  CreateButton: {
    margin: '2em auto',
    display: 'block',
    padding: '1em 2em',
    backgroundColor: '#FFD167',
    color: '#fff',
    border: 'none',
    borderRadius: '2em',
    fontSize: '16px',
    cursor: 'pointer',
    textAlign: 'center',
  },
  hotelCard: {
    borderRadius: '1em',
    height: '7em',
    lineHeight: '1', 
    padding: '1em',
  }
};

export default Properties;