import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { StatusBadge } from '../components/common/Badge';

/**
 * Properties Page Component
 * 
 * Displays a list of managed properties with enhanced filtering capabilities,
 * optimized performance, and intuitive interaction design.
 */
const Properties = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  
  // Core state with performance optimizations
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedFilters, setExpandedFilters] = useState(false);
  
  // Filter state using a unified object for better state management
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    occupancy: 'all',
    price: 'all',
    rating: 'all'
  });
  
  // Active filters count for UI indication
  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).filter(([key, value]) => 
      key !== 'search' && value !== 'all'
    ).length;
  }, [filters]);

  // Fetch properties data
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock properties data
        const mockProperties = [
          {
            id: 1,
            name: 'Sunrise Hotel',
            address: '123 Beach Road, Seaside, CA',
            type: 'hotel',
            status: 'active',
            totalRooms: 24,
            occupiedRooms: 18,
            cleanRooms: 4,
            dirtyRooms: 2,
            maintenanceRooms: 0,
            occupancyRate: 75,
            averageRating: 4.7,
            priceRange: '$120-350',
            image: 'sunrise-hotel.jpg',
            revenue: {
              daily: 3200,
              monthly: 96000
            },
            issues: 2
          },
          {
            id: 2,
            name: 'Mountain View Lodge',
            address: '456 Pine Avenue, Highland, CO',
            type: 'lodge',
            status: 'active',
            totalRooms: 30,
            occupiedRooms: 22,
            cleanRooms: 3,
            dirtyRooms: 5,
            maintenanceRooms: 0,
            occupancyRate: 73,
            averageRating: 4.5,
            priceRange: '$180-450',
            image: 'mountain-lodge.jpg',
            revenue: {
              daily: 4100,
              monthly: 123000
            },
            issues: 3
          },
          {
            id: 3,
            name: 'Riverside Resort',
            address: '789 River Drive, Streamside, OR',
            type: 'resort',
            status: 'active',
            totalRooms: 42,
            occupiedRooms: 24,
            cleanRooms: 12,
            dirtyRooms: 4,
            maintenanceRooms: 2,
            occupancyRate: 57,
            averageRating: 4.3,
            priceRange: '$150-500',
            image: 'riverside-resort.jpg',
            revenue: {
              daily: 3600,
              monthly: 108000
            },
            issues: 5
          },
          {
            id: 4,
            name: 'Urban Boutique Hotel',
            address: '101 Main Street, Downtown, NY',
            type: 'boutique',
            status: 'maintenance',
            totalRooms: 15,
            occupiedRooms: 0,
            cleanRooms: 0,
            dirtyRooms: 3,
            maintenanceRooms: 12,
            occupancyRate: 0,
            averageRating: 4.2,
            priceRange: '$200-400',
            image: 'urban-boutique.jpg',
            revenue: {
              daily: 0,
              monthly: 27000
            },
            issues: 8
          },
          {
            id: 5,
            name: 'Lakeside Cabin Retreat',
            address: '222 Lake Shore, Crystal Lake, MI',
            type: 'cabins',
            status: 'active',
            totalRooms: 8,
            occupiedRooms: 6,
            cleanRooms: 2,
            dirtyRooms: 0,
            maintenanceRooms: 0,
            occupancyRate: 75,
            averageRating: 4.8,
            priceRange: '$220-350',
            image: 'lakeside-cabins.jpg',
            revenue: {
              daily: 1800,
              monthly: 54000
            },
            issues: 0
          }
        ];
        
        setProperties(mockProperties);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperties();
  }, []);
  
  // Optimized filter handler with useCallback
  const handleFilterChange = useCallback((filterName, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterName]: value
    }));
  }, []);
  
  // Reset all filters
  const handleClearFilters = useCallback(() => {
    setFilters({
      search: '',
      status: 'all',
      occupancy: 'all',
      price: 'all',
      rating: 'all'
    });
  }, []);
  
  // Toggle expanded filter panel
  const toggleFilters = useCallback(() => {
    setExpandedFilters(prev => !prev);
  }, []);
  
  // Memoized filtered properties for performance
  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      // Search filter - check name, address, type
      const matchesSearch = filters.search === '' || 
        property.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        property.address.toLowerCase().includes(filters.search.toLowerCase()) ||
        property.type.toLowerCase().includes(filters.search.toLowerCase());
      
      // Status filter
      const matchesStatus = filters.status === 'all' || property.status === filters.status;
      
      // Occupancy filter
      const matchesOccupancy = filters.occupancy === 'all' || 
        (filters.occupancy === 'high' && property.occupancyRate >= 70) ||
        (filters.occupancy === 'medium' && property.occupancyRate >= 40 && property.occupancyRate < 70) ||
        (filters.occupancy === 'low' && property.occupancyRate < 40);
      
      // Price range filter
      const matchesPrice = filters.price === 'all' || 
        (filters.price === 'budget' && property.priceRange.includes('120')) ||
        (filters.price === 'standard' && property.priceRange.includes('180')) ||
        (filters.price === 'luxury' && property.priceRange.includes('200'));
      
      // Rating filter
      const matchesRating = filters.rating === 'all' || 
        (filters.rating === '4.5+' && property.averageRating >= 4.5) ||
        (filters.rating === '4.0+' && property.averageRating >= 4.0) ||
        (filters.rating === 'below4' && property.averageRating < 4.0);
      
      return matchesSearch && matchesStatus && matchesOccupancy && matchesPrice && matchesRating;
    });
  }, [properties, filters]);
  
  /**
   * Handles property card click navigation
   * @param {number} propertyId - ID of the property to view
   */
  const handlePropertyClick = useCallback((propertyId) => {
    navigate(`/properties/${propertyId}`);
  }, [navigate]);
  
  /**
   * Renders status badge with proper styling
   * @param {string} status - Property status
   * @returns {JSX.Element} Status badge component
   */
  const renderStatusBadge = useCallback((status) => {
    const statusMap = {
      active: 'active',
      maintenance: 'pending',
      inactive: 'inactive'
    };
    
    return <StatusBadge status={statusMap[status] || 'neutral'} />;
  }, []);
  
  /**
   * Calculates the total statistics across all properties
   * @returns {Object} Aggregated statistics
   */
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
      revenue: {
        daily: 0,
        monthly: 0
      }
    });
  }, [properties]);
  
  /**
   * Calculates the overall occupancy rate
   * @returns {number} Overall occupancy rate percentage
   */
  const overallOccupancy = useMemo(() => {
    if (totalStats.totalRooms === 0) return 0;
    return Math.round((totalStats.occupiedRooms / totalStats.totalRooms) * 100);
  }, [totalStats]);

  /**
   * Renders a filter chip for interactive filtering
   * @param {string} label - Display text for the chip
   * @param {string} filterType - Type of filter this chip controls
   * @param {string} value - Value to apply when selected
   * @param {boolean} isActive - Whether this chip is currently selected
   * @returns {JSX.Element} Interactive filter chip
   */
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

  // Active filter count badge or empty state
  const FilterCountBadge = () => {
    if (activeFilterCount === 0) return null;
    
    return (
      <span className="ml-xs bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
        {activeFilterCount}
      </span>
    );
  };

  return (
    <div className="page-container pb-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Properties</h1>
        
        {hasPermission('canManageProperties') && (
          <Button 
            variant="primary"
            size="sm"
          >
            Add Property
          </Button>
        )}
      </div>
      
      {/* Overall Stats Card - Enhanced with shadow and border radius */}
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
      
      {/* Enhanced Filter UI */}
      <div className="mb-4 animate-fade-in" style={{ animationDelay: '50ms' }}>
        {/* Search Bar with Advanced Filters Toggle */}
        <div className="flex mb-3">
          <div className="flex-1 relative">
            <Input
              placeholder="Search properties by name, address, or type..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              startIcon={<span className="text-neutral-400">🔍</span>}
              className="pr-10 shadow-soft-sm" 
            />
            {filters.search && (
              <button 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1"
                onClick={() => handleFilterChange('search', '')}
                aria-label="Clear search"
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
        
        {/* Expandable Filter Panel */}
        {expandedFilters && (
          <Card className="mb-3 animate-slide-up shadow-soft-md border-t-4 border-t-primary-lighter">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Status Filter Group */}
              <div>
                <h4 className="text-sm font-semibold mb-2 text-neutral-700">Status</h4>
                <div className="flex flex-wrap">
                  <FilterChip 
                    label="Active" 
                    filterType="status" 
                    value="active" 
                    isActive={filters.status === 'active'} 
                  />
                  <FilterChip 
                    label="Maintenance" 
                    filterType="status" 
                    value="maintenance" 
                    isActive={filters.status === 'maintenance'} 
                  />
                  <FilterChip 
                    label="Inactive" 
                    filterType="status" 
                    value="inactive" 
                    isActive={filters.status === 'inactive'} 
                  />
                </div>
              </div>
              
              {/* Occupancy Filter Group */}
              <div>
                <h4 className="text-sm font-semibold mb-2 text-neutral-700">Occupancy</h4>
                <div className="flex flex-wrap">
                  <FilterChip 
                    label="High (70%+)" 
                    filterType="occupancy" 
                    value="high" 
                    isActive={filters.occupancy === 'high'} 
                  />
                  <FilterChip 
                    label="Medium (40-70%)" 
                    filterType="occupancy" 
                    value="medium" 
                    isActive={filters.occupancy === 'medium'} 
                  />
                  <FilterChip 
                    label="Low (<40%)" 
                    filterType="occupancy" 
                    value="low" 
                    isActive={filters.occupancy === 'low'} 
                  />
                </div>
              </div>
              
              {/* Price Range Filter Group */}
              <div>
                <h4 className="text-sm font-semibold mb-2 text-neutral-700">Price Range</h4>
                <div className="flex flex-wrap">
                  <FilterChip 
                    label="Budget" 
                    filterType="price" 
                    value="budget" 
                    isActive={filters.price === 'budget'} 
                  />
                  <FilterChip 
                    label="Standard" 
                    filterType="price" 
                    value="standard" 
                    isActive={filters.price === 'standard'} 
                  />
                  <FilterChip 
                    label="Luxury" 
                    filterType="price" 
                    value="luxury" 
                    isActive={filters.price === 'luxury'} 
                  />
                </div>
              </div>
              
              {/* Rating Filter Group */}
              <div>
                <h4 className="text-sm font-semibold mb-2 text-neutral-700">Rating</h4>
                <div className="flex flex-wrap">
                  <FilterChip 
                    label="4.5+ ⭐" 
                    filterType="rating" 
                    value="4.5+" 
                    isActive={filters.rating === '4.5+'} 
                  />
                  <FilterChip 
                    label="4.0+ ⭐" 
                    filterType="rating" 
                    value="4.0+" 
                    isActive={filters.rating === '4.0+'} 
                  />
                  <FilterChip 
                    label="Below 4.0" 
                    filterType="rating" 
                    value="below4" 
                    isActive={filters.rating === 'below4'} 
                  />
                </div>
              </div>
            </div>
            
            {/* Filter Actions */}
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
        
        {/* Active Filter Summary */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap mb-3">
            <span className="text-sm text-neutral-600 mr-2 self-center">Active filters:</span>
            
            {filters.status !== 'all' && (
              <span className="bg-primary-lighter text-primary-dark text-xs rounded-full px-sm py-2xs mr-xs mb-xs flex items-center">
                Status: {filters.status.charAt(0).toUpperCase() + filters.status.slice(1)}
                <button 
                  className="ml-xs text-primary-dark hover:text-primary pl-2xs"
                  onClick={() => handleFilterChange('status', 'all')}
                >
                  ✕
                </button>
              </span>
            )}
            
            {filters.occupancy !== 'all' && (
              <span className="bg-primary-lighter text-primary-dark text-xs rounded-full px-sm py-2xs mr-xs mb-xs flex items-center">
                Occupancy: {filters.occupancy === 'high' ? 'High' : filters.occupancy === 'medium' ? 'Medium' : 'Low'}
                <button 
                  className="ml-xs text-primary-dark hover:text-primary pl-2xs"
                  onClick={() => handleFilterChange('occupancy', 'all')}
                >
                  ✕
                </button>
              </span>
            )}
            
            {filters.price !== 'all' && (
              <span className="bg-primary-lighter text-primary-dark text-xs rounded-full px-sm py-2xs mr-xs mb-xs flex items-center">
                Price: {filters.price.charAt(0).toUpperCase() + filters.price.slice(1)}
                <button 
                  className="ml-xs text-primary-dark hover:text-primary pl-2xs"
                  onClick={() => handleFilterChange('price', 'all')}
                >
                  ✕
                </button>
              </span>
            )}
            
            {filters.rating !== 'all' && (
              <span className="bg-primary-lighter text-primary-dark text-xs rounded-full px-sm py-2xs mr-xs mb-xs flex items-center">
                Rating: {filters.rating}
                <button 
                  className="ml-xs text-primary-dark hover:text-primary pl-2xs"
                  onClick={() => handleFilterChange('rating', 'all')}
                >
                  ✕
                </button>
              </span>
            )}
            
            <button 
              className="text-xs text-primary hover:text-primary-dark underline self-center ml-auto"
              onClick={handleClearFilters}
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
      
      {/* Property Cards */}
      <div className="stagger-children">
        {loading ? (
          // Skeleton loading states for better UX
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="mb-3 animate-pulse">
              <div className="bg-neutral-200 h-6 w-3/4 rounded mb-2"></div>
              <div className="bg-neutral-200 h-4 w-1/2 rounded mb-3"></div>
              
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-neutral-200 h-4 rounded"></div>
                <div className="bg-neutral-200 h-4 rounded"></div>
                <div className="bg-neutral-200 h-4 rounded"></div>
              </div>
              
              <div className="grid grid-cols-4 gap-1">
                <div className="bg-neutral-200 h-10 rounded"></div>
                <div className="bg-neutral-200 h-10 rounded"></div>
                <div className="bg-neutral-200 h-10 rounded"></div>
                <div className="bg-neutral-200 h-10 rounded"></div>
              </div>
            </Card>
          ))
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
              
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div>
                  <p className="text-xs text-neutral-500">Rooms</p>
                  <p className="font-medium">{property.totalRooms}</p>
                </div>
                
                <div>
                  <p className="text-xs text-neutral-500">Occupancy</p>
                  <p className="font-medium">{property.occupancyRate}%</p>
                </div>
                
                <div>
                  <p className="text-xs text-neutral-500">Rating</p>
                  <p className="font-medium">⭐ {property.averageRating}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-1">
                <div className="bg-primary-lighter text-center py-1 rounded">
                  <p className="text-xs font-medium text-primary-dark">{property.occupiedRooms}</p>
                  <p className="text-xs text-neutral-600">Occupied</p>
                </div>
                
                <div className="bg-success-light text-center py-1 rounded">
                  <p className="text-xs font-medium text-success-color">{property.cleanRooms}</p>
                  <p className="text-xs text-neutral-600">Clean</p>
                </div>
                
                <div className="bg-warning-light text-center py-1 rounded">
                  <p className="text-xs font-medium text-warning-color">{property.dirtyRooms}</p>
                  <p className="text-xs text-neutral-600">Dirty</p>
                </div>
                
                <div className="bg-error-light text-center py-1 rounded">
                  <p className="text-xs font-medium text-error-color">{property.issues}</p>
                  <p className="text-xs text-neutral-600">Issues</p>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 bg-white rounded-lg shadow-soft-sm">
            <div className="text-4xl mb-2">🏨</div>
            <p className="text-neutral-600 mb-2 font-medium">No properties match your filters</p>
            <p className="text-neutral-500 mb-4 text-sm">Try adjusting your search criteria or clear the filters</p>
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