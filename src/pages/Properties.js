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
    const response = await fetch('/hotels', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch properties');
    return response.json();
  },
  
  createProperty: async (propertyData) => {
    const response = await fetch('/api/hotel/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(propertyData),
    });
    if (!response.ok) throw new Error('Failed to create property');
    return response.json();
  },
};

const Properties = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedFilters, setExpandedFilters] = useState(false);
  
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    location: 'all',
  });

  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).filter(([key, value]) => 
      key !== 'search' && value !== 'all'
    ).length;
  }, [filters]);

  // Moved fetchProperties outside useEffect and memoized it
  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.getProperties();
      
      const formattedProperties = response.data.map(property => ({
        id: property.hotelId,
        name: property.Name,
        address: property.Location,
        type: 'hotel',
        status: 'active',
        description: property.Description,
        email: property.Email,
        phoneNumber: property.PhoneNumber,
        totalRooms: 0,
        occupiedRooms: 0,
        cleanRooms: 0,
        dirtyRooms: 0,
        maintenanceRooms: 0,
        occupancyRate: 0,
        averageRating: 0,
        priceRange: 'N/A',
        revenue: { daily: 0, monthly: 0 },
        issues: 0,
      }));
      
      setProperties(formattedProperties);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setError('Failed to load properties. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array since it doesn't depend on any external values

  // Fetch properties on mount
  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Filter handlers
  const handleFilterChange = useCallback((filterName, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterName]: value
    }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: '',
      status: 'all',
      location: 'all',
    });
  }, []);

  const toggleFilters = useCallback(() => {
    setExpandedFilters(prev => !prev);
  }, []);

  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      const matchesSearch = filters.search === '' || 
        property.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        property.address.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesStatus = filters.status === 'all' || property.status === filters.status;
      
      const matchesLocation = filters.location === 'all' || 
        property.address.toLowerCase().includes(filters.location.toLowerCase());

      return matchesSearch && matchesStatus && matchesLocation;
    });
  }, [properties, filters]);

  const handlePropertyClick = useCallback((propertyId) => {
    navigate(`/properties/${propertyId}`);
  }, [navigate]);

  const renderStatusBadge = useCallback((status) => {
    const statusMap = {
      active: 'active',
      maintenance: 'pending',
      inactive: 'inactive'
    };
    return <StatusBadge status={statusMap[status] || 'neutral'} />;
  }, []);

  const totalStats = useMemo(() => {
    return properties.reduce((totals, property) => {
      return {
        totalRooms: totals.totalRooms + property.totalRooms,
        occupiedRooms: totals.occupiedRooms + property.occupiedRooms,
        cleanRooms: totals.cleanRooms + property.cleanRooms,
        dirtyRooms: totals.dirtyRooms + property.dirtyRooms,
        maintenanceRooms: totals.maintenanceRooms + property.maintenanceRooms,
        issues: totals.issues + property.issues,
        revenue: {
          daily: totals.revenue.daily + property.revenue.daily,
          monthly: totals.revenue.monthly + property.revenue.monthly
        }
      };
    }, {
      totalRooms: 0,
      occupiedRooms: 0,
      cleanRooms: 0,
      dirtyRooms: 0,
      maintenanceRooms: 0,
      issues: 0,
      revenue: { daily: 0, monthly: 0 }
    });
  }, [properties]);

  const overallOccupancy = useMemo(() => {
    if (totalStats.totalRooms === 0) return 0;
    return Math.round((totalStats.occupiedRooms / totalStats.totalRooms) * 100);
  }, [totalStats]);

  const FilterChip = ({ label, filterType, value, isActive }) => (
    <button 
      className={`px-sm py-2xs rounded-full text-sm mr-xs mb-xs transition-all ${
        isActive 
          ? 'bg-primary text-white shadow-sm' 
          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
      }`}
      onClick={() => handleFilterChange(filterType, isActive ? 'all' : value)}
    >
      {label}
    </button>
  );

  const FilterCountBadge = () => {
    if (activeFilterCount === 0) return null;
    return (
      <span className="ml-xs bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
        {activeFilterCount}
      </span>
    );
  };

  const handleAddProperty = useCallback(async () => {
    try {
      const newProperty = {
        name: "New Hotel",
        description: "New hotel description",
        location: "New Location",
        email: "newhotel@example.com",
        phoneNumber: "123-456-7890"
      };
      
      const response = await api.createProperty(newProperty);
      setProperties(prev => [...prev, {
        id: response.data.hotelId,
        name: response.data.name,
        address: newProperty.location,
        type: 'hotel',
        status: 'active',
        description: newProperty.description,
        email: newProperty.email,
        phoneNumber: newProperty.phoneNumber,
        totalRooms: 0,
        occupiedRooms: 0,
        cleanRooms: 0,
        dirtyRooms: 0,
        maintenanceRooms: 0,
        occupancyRate: 0,
        averageRating: 0,
        priceRange: 'N/A',
        revenue: { daily: 0, monthly: 0 },
        issues: 0,
      }]);
    } catch (error) {
      setError('Failed to create new property');
    }
  }, []);

  return (
    <div className="page-container pb-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Properties</h1>
        {hasPermission('canManageProperties') && (
          <Button 
            variant="primary" 
            size="sm"
            onClick={handleAddProperty}
          >
            Add Property
          </Button>
        )}
      </div>

      <Card className="mb-4 shadow-soft-sm animate-fade-in">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <h3 className="text-sm font-medium text-neutral-600">Properties</h3>
            <p className="text-2xl font-semibold">{properties.length}</p>
          </div>
          <div className="text-center">
            <h3 className="text-sm font-medium text-neutral-600">Occupancy</h3>
            <p className="text-2xl font-semibold">{overallOccupancy}%</p>
          </div>
          <div className="text-center">
            <h3 className="text-sm font-medium text-neutral-600">Revenue</h3>
            <p className="text-2xl font-semibold">${totalStats.revenue.daily.toLocaleString()}</p>
            <p className="text-xs text-neutral-500">Daily</p>
          </div>
        </div>
      </Card>

      <div className="mb-4 animate-fade-in" style={{ animationDelay: '50ms' }}>
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
          <button 
            className="ml-2 flex items-center bg-white rounded-md border border-neutral-300 px-md py-sm text-sm font-medium hover:bg-neutral-50 shadow-soft-sm transition-all"
            onClick={toggleFilters}
          >
            <span className="mr-2xs">Filters</span>
            <FilterCountBadge />
          </button>
        </div>

        {expandedFilters && (
          <Card className="mb-3 animate-slide-up shadow-soft-md border-t-4 border-t-primary-lighter">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <h4 className="text-sm font-semibold mb-2 text-neutral-700">Status</h4>
                <div className="flex flex-wrap">
                  <FilterChip 
                    label="Active" 
                    filterType="status" 
                    value="active" 
                    isActive={filters.status === 'active'} 
                  />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2 text-neutral-700">Location</h4>
                <div className="flex flex-wrap">
                  <FilterChip 
                    label="Seaside" 
                    filterType="location" 
                    value="seaside" 
                    isActive={filters.location === 'seaside'} 
                  />
                  <FilterChip 
                    label="Highland" 
                    filterType="location" 
                    value="highland" 
                    isActive={filters.location === 'highland'} 
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-4 pt-3 border-t border-neutral-200">
              <Button 
                variant="outline"
                size="sm"
                className="mr-2"
                onClick={handleClearFilters}
              >
                Clear All
              </Button>
              <Button 
                variant="primary"
                size="sm"
                onClick={toggleFilters}
              >
                Apply Filters
              </Button>
            </div>
          </Card>
        )}
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
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchProperties} // Now properly defined
            >
              Try Again
            </Button>
          </div>
        ) : filteredProperties.length > 0 ? (
          filteredProperties.map((property) => (
            <Card 
              key={property.id}
              className="mb-3 card-interactive"
              onClick={() => handlePropertyClick(property.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h2 className="font-medium text-lg">{property.name}</h2>
                  <p className="text-sm text-neutral-600">{property.address}</p>
                </div>
                {renderStatusBadge(property.status)}
              </div>
              <p className="text-sm text-neutral-500">{property.description}</p>
              <p className="text-sm text-neutral-500">Email: {property.email}</p>
              <p className="text-sm text-neutral-500">Phone: {property.phoneNumber}</p>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 bg-white rounded-lg shadow-soft-sm">
            <div className="text-4xl mb-2">🏨</div>
            <p className="text-neutral-600 mb-2 font-medium">No properties match your filters</p>
            <p className="text-neutral-500 mb-4 text-sm">Try adjusting your search criteria</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleClearFilters}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Properties;