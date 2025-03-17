import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import { StatusBadge } from '../common/Badge';

/**
 * Receptionist Dashboard Component
 * 
 * Specialized dashboard for front desk staff focused on guest management,
 * room status tracking, and booking operations.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.statistics - Statistics data to display on dashboard
 */
const ReceptionistDashboard = ({ statistics }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Navigation handlers
  const handleViewProperties = () => navigate('/properties');
  
  /**
   * Mock room and booking data with structured hierarchy
   * - Properties contain rooms
   * - Each room has status and guest information when occupied
   */
  const bookingData = {
    todayArrivals: 8,
    todayDepartures: 6,
    pendingCheckIns: 5,
    pendingCheckOuts: 3,
    
    // Active property in focus (would be selected in real app)
    activeProperty: {
      id: 1,
      name: 'Sunrise Hotel',
      totalRooms: 24,
      occupiedRooms: 18,
      availableRooms: 6,
      
      // Recent bookings
      recentBookings: [
        { id: 1, guest: 'John Smith', roomNumber: '304', checkIn: '2025-03-02', checkOut: '2025-03-05', status: 'pending' },
        { id: 2, guest: 'Emily Johnson', roomNumber: '212', checkIn: '2025-03-01', checkOut: '2025-03-04', status: 'active' },
        { id: 3, guest: 'Michael Brown', roomNumber: '118', checkIn: '2025-03-01', checkOut: '2025-03-03', status: 'active' },
        { id: 4, guest: 'Sarah Garcia', roomNumber: '401', checkIn: '2025-02-28', checkOut: '2025-03-02', status: 'checkout' },
      ],
      
      // Room status by floor/category 
      roomsByFloor: [
        { floor: '1st Floor', total: 8, occupied: 5, available: 3 },
        { floor: '2nd Floor', total: 8, occupied: 7, available: 1 },
        { floor: '3rd Floor', total: 8, occupied: 6, available: 2 },
      ]
    }
  };
  
  /**
   * Handles search input changes
   * @param {Event} e - Input change event
   */
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  /**
   * Search functionality for guest bookings
   * @returns {Array} Filtered booking results
   */
  const getFilteredBookings = () => {
    if (!searchTerm.trim()) {
      return bookingData.activeProperty.recentBookings;
    }
    
    const lowerCaseSearch = searchTerm.toLowerCase();
    return bookingData.activeProperty.recentBookings.filter(booking => 
      booking.guest.toLowerCase().includes(lowerCaseSearch) || 
      booking.roomNumber.includes(lowerCaseSearch)
    );
  };
  
  // Get filtered booking results
  const filteredBookings = getFilteredBookings();
  
  /**
   * Formats date string to more readable format
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  return (
    <div className="mb-6">
      {/* Search Section */}
      <Card className="mb-6">
        <Input
          placeholder="Search by guest name or room number"
          value={searchTerm}
          onChange={handleSearchChange}
          startIcon={<span>🔍</span>}
          className="mb-0"
        />
      </Card>
      
      {/* Today's Statistics */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="bg-primary-color/10 border-l-4 border-primary-color">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-semibold text-neutral-600">Check-ins Today</h3>
              <p className="text-2xl font-bold text-primary-color">{bookingData.todayArrivals}</p>
            </div>
            <span className="text-2xl">🛎️</span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            {bookingData.pendingCheckIns} pending
          </p>
        </Card>
        
        <Card className="bg-secondary-color/10 border-l-4 border-secondary-color">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-semibold text-neutral-600">Check-outs Today</h3>
              <p className="text-2xl font-bold text-secondary-color">{bookingData.todayDepartures}</p>
            </div>
            <span className="text-2xl">🔑</span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            {bookingData.pendingCheckOuts} pending
          </p>
        </Card>
      </div>
      
      {/* Room Status */}
      <Card
        header={
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">{bookingData.activeProperty.name}</h2>
            <Button 
              variant="text" 
              size="sm"
              onClick={handleViewProperties}
            >
              Change
            </Button>
          </div>
        }
        className="mb-6"
      >
        <div className="flex justify-between items-center mb-4">
          <div className="text-center px-2">
            <p className="text-xl font-semibold">{bookingData.activeProperty.totalRooms}</p>
            <p className="text-xs text-neutral-600">Total Rooms</p>
          </div>
          
          <div className="text-center px-2 border-l border-r border-neutral-200">
            <p className="text-xl font-semibold text-success-color">{bookingData.activeProperty.availableRooms}</p>
            <p className="text-xs text-neutral-600">Available</p>
          </div>
          
          <div className="text-center px-2">
            <p className="text-xl font-semibold text-primary-color">{bookingData.activeProperty.occupiedRooms}</p>
            <p className="text-xs text-neutral-600">Occupied</p>
          </div>
        </div>
        
        {/* Room status by floor */}
        <div className="border-t border-neutral-200 pt-3">
          <h3 className="text-sm font-medium mb-2">Room Status by Floor</h3>
          
          {bookingData.activeProperty.roomsByFloor.map((floor, index) => (
            <div 
              key={index} 
              className="flex justify-between items-center mb-2 last:mb-0"
            >
              <span className="text-sm">{floor.floor}</span>
              <div className="flex-1 mx-3">
                <div className="h-2 w-full bg-neutral-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-color" 
                    style={{ width: `${(floor.occupied / floor.total) * 100}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-xs text-neutral-600">
                {floor.occupied}/{floor.total}
              </span>
            </div>
          ))}
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleViewProperties}
          className="mt-3"
          fullWidth
        >
          View All Rooms
        </Button>
      </Card>
      
      {/* Recent Bookings */}
      <Card
        header={<h2 className="text-lg font-semibold">Recent Bookings</h2>}
      >
        {filteredBookings.length > 0 ? (
          <div>
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="py-3 border-b border-neutral-100 last:border-0"
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium">{booking.guest}</h3>
                  <StatusBadge status={booking.status} />
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="text-sm mr-2">Room {booking.roomNumber}</span>
                    <span className="text-xs text-neutral-500">
                      {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                    </span>
                  </div>
                  
                  <div>
                    {booking.status === 'pending' && (
                      <Button variant="success" size="sm">Check In</Button>
                    )}
                    {booking.status === 'checkout' && (
                      <Button variant="secondary" size="sm">Check Out</Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-4 text-neutral-500">
            {searchTerm ? 'No bookings match your search' : 'No recent bookings'}
          </p>
        )}
        
        <div className="grid grid-cols-2 gap-3 mt-4">
          <Button variant="primary">New Booking</Button>
          <Button variant="outline" onClick={handleViewProperties}>All Bookings</Button>
        </div>
      </Card>
    </div>
  );
};

export default ReceptionistDashboard;