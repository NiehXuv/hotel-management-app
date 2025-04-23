import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/layout/BottomNavigation';
import Card from '../components/common/Card';
import '../styles/calendar.css';

const Calendar = () => {
  const [bookings, setBookings] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState('');
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [error, setError] = useState('');
  const [allRooms, setAllRooms] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [roomError, setRoomError] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('');
  const [selectedBookingStatus, setSelectedBookingStatus] = useState('');
  const [optimalPriceData, setOptimalPriceData] = useState(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState('');
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [editingPrice, setEditingPrice] = useState(false);
  const [newPrice, setNewPrice] = useState('');
  const [priceUpdateLoading, setPriceUpdateLoading] = useState(false);
  const [mockLoading, setMockLoading] = useState(false);

  const navigate = useNavigate();
  const touchStartX = useRef(null);

  useEffect(() => {
    fetchBookings();
    fetchHotelIds();
  }, []);

  useEffect(() => {
    if (hotels.length > 0) {
      fetchAllRooms();
    }
  }, [hotels]);

  useEffect(() => {
    if (selectedHotel) {
      const filteredRooms = allRooms.filter(room => room.hotelId === selectedHotel);
      setRooms(filteredRooms);
    } else {
      setRooms(allRooms);
    }
  }, [selectedHotel, allRooms]);

  useEffect(() => {
    if (showModal && selectedBookings.length > 0) {
      const booking = selectedBookings[0];
      if (booking.optimalPrice) {
        setOptimalPriceData({ optimalPrice: booking.optimalPrice });
        setNewPrice(booking.optimalPrice.toString());
      } else {
        fetchOptimalPrice(booking.id);
      }
    }
  }, [showModal, selectedBookings]);

  const fetchBookings = async () => {
    try {
      const response = await fetch('http://localhost:5000/booking/list', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data = await response.json();
      const bookingsData = data.bookings
        ? Object.entries(data.bookings).map(([id, booking]) => ({
            ...booking,
            id,
          }))
        : [];
      setBookings(bookingsData);
      console.log('Fetched bookings:', bookingsData);
    } catch (err) {
      setError(`Error fetching bookings: ${err.message}`);
      console.error('Fetch bookings error:', err);
    }
  };

  const fetchMockBookings = async () => {
    setMockLoading(true);
    try {
      const response = await fetch('http://localhost:5000/booking/fetch-mock', {
        method: 'GET',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch mock bookings: ${errorData.message || 'Unknown error'}`);
      }
      const data = await response.json();
      if (data.message === "Mock bookings fetched successfully") {
        fetchBookings();
      } else {
        setError(`Failed to fetch mock bookings: ${data.message || 'Unknown error'}`);
      }
    } catch (err) {
      setError(`Error fetching mock bookings: ${err.message}`);
      console.error('Fetch mock bookings error:', err);
    } finally {
      setMockLoading(false);
    }
  };

  const fetchHotelIds = async () => {
    setLoadingHotels(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/hotels/ids', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.success) {
        setHotels(data.data);
      } else {
        setError(`Failed to load hotels: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      setError(`Network error: ${err.message}`);
      console.error('Fetch hotels error:', err);
    } finally {
      setLoadingHotels(false);
    }
  };

  const fetchAllRooms = async () => {
    setLoadingRooms(true);
    setRoomError('');
    try {
      const allRoomsData = [];
      for (const hotel of hotels) {
        const response = await fetch(`http://localhost:5000/api/hotels/${hotel.id}/rooms`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();
        if (data.success) {
          const roomsWithHotelId = data.data.map(room => ({
            ...room,
            hotelId: hotel.id,
          }));
          allRoomsData.push(...roomsWithHotelId);
        } else {
          setRoomError(`Failed to load rooms for hotel ${hotel.id}: ${data.error || 'Unknown error'}`);
        }
      }
      setAllRooms(allRoomsData);
      setRooms(allRoomsData);
      console.log('Fetched rooms:', allRoomsData);
    } catch (err) {
      setRoomError(`Network error: ${err.message}`);
      console.error('Fetch rooms error:', err);
    } finally {
      setLoadingRooms(false);
    }
  };

  const fetchOptimalPrice = async (bookingId) => {
    setPriceLoading(true);
    setPriceError('');
    setOptimalPriceData(null);
    try {
      const response = await fetch(`http://localhost:5000/booking/${bookingId}/optimal-price`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch optimal price');
      const data = await response.json();
      if (data.success) {
        setOptimalPriceData(data.data);
        setNewPrice(data.data.optimalPrice.toString());
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking.id === bookingId
              ? { ...booking, optimalPrice: data.data.optimalPrice, pricingMethod: data.data.pricingMethod }
              : booking
          )
        );
        setSelectedBookings((prev) =>
          prev.map((booking) =>
            booking.id === bookingId
              ? { ...booking, optimalPrice: data.data.optimalPrice, pricingMethod: data.data.pricingMethod }
              : booking
          )
        );
      } else {
        setPriceError(`Failed to load optimal price: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      setPriceError(`Error fetching optimal price: ${err.message}`);
      console.error('Fetch optimal price error:', err);
    } finally {
      setPriceLoading(false);
    }
  };

  const updateOptimalPrice = async (bookingId, newPriceValue) => {
    setPriceUpdateLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/booking/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optimalPrice: parseFloat(newPriceValue) }),
      });
      if (!response.ok) throw new Error('Failed to update optimal price');
      const data = await response.json();
      if (data.message === "Booking updated successfully") {
        setOptimalPriceData({ optimalPrice: parseFloat(newPriceValue) });
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking.id === bookingId
              ? { ...booking, optimalPrice: parseFloat(newPriceValue) }
              : booking
          )
        );
        setSelectedBookings((prev) =>
          prev.map((booking) =>
            booking.id === bookingId
              ? { ...booking, optimalPrice: parseFloat(newPriceValue) }
              : booking
          )
        );
        setEditingPrice(false);
      } else {
        setPriceError(`Failed to update optimal price: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      setPriceError(`Error updating optimal price: ${err.message}`);
      console.error('Update optimal price error:', err);
    } finally {
      setPriceUpdateLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    setLoadingStatus(true);
    try {
      const response = await fetch(`http://localhost:5000/booking/${bookingId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update status');
      }
      const data = await response.json();
      if (data.message === "Booking status updated successfully") {
        setSelectedBookings((prev) =>
          prev.map((booking) =>
            booking.id === bookingId ? { ...booking, bookingStatus: newStatus } : booking
          )
        );
        fetchBookings();
      } else {
        setError(`Failed to update status: ${data.message || 'Unknown error'}`);
      }
    } catch (err) {
      setError(`Error updating status: ${err.message}`);
      console.error('Update status error:', err);
    } finally {
      setLoadingStatus(false);
    }
  };

  const hotelMap = useMemo(() => {
    return hotels.reduce((map, hotel) => {
      map[hotel.id] = hotel.name;
      return map;
    }, {});
  }, [hotels]);

  const roomMap = useMemo(() => {
    return allRooms.reduce((map, room) => {
      const key = `${room.hotelId}-${room.id}`;
      map[key] = room.RoomName;
      return map;
    }, {});
  }, [allRooms]);

  const getHotelNameById = (hotelId) => hotelMap[hotelId] || 'Unknown Hotel';

  const getRoomNameById = (hotelId, roomId) => {
    const key = `${hotelId}-${roomId}`;
    return roomMap[key] || `Room ${roomId}`;
  };

  const getBookingsForDate = (date, type) => {
    return bookings.filter((booking) => {
      const dateField = type === 'checkin' ? booking.bookIn : booking.bookOut;
      if (!dateField) {
        console.warn(`Booking ${booking.id} has no ${type} date`);
        return false;
      }
      const bookingDate = new Date(dateField);
      if (isNaN(bookingDate)) {
        console.warn(`Booking ${booking.id} has invalid ${type} date: ${dateField}`);
        return false;
      }
      const dateMatch = bookingDate.toDateString() === date.toDateString();
      const hotelName = getHotelNameById(booking.hotelId);
      const roomName = getRoomNameById(booking.hotelId, booking.roomId);
      const query = searchQuery.toLowerCase();

      const matchesQuery =
        (searchQuery === '') ||
        `${booking.id}`.toLowerCase().includes(query) ||
        (booking.customerId && booking.customerId.toLowerCase().includes(query)) ||
        hotelName.toLowerCase().includes(query) ||
        roomName.toLowerCase().includes(query) ||
        (booking.paymentStatus && booking.paymentStatus.toLowerCase().includes(query)) ||
        (booking.bookingStatus && booking.bookingStatus.toLowerCase().includes(query));

      const hotelMatch = selectedHotel ? booking.hotelId === selectedHotel : true;
      const roomMatch = selectedRoom ? booking.roomId === selectedRoom : true;
      const paymentStatusMatch = selectedPaymentStatus ? booking.paymentStatus === selectedPaymentStatus : true;
      const bookingStatusMatch = selectedBookingStatus ? booking.bookingStatus === selectedBookingStatus : true;

      return dateMatch && matchesQuery && hotelMatch && roomMatch && paymentStatusMatch && bookingStatusMatch;
    });
  };

  const handleDayChange = (daysOffset) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + daysOffset);
    setCurrentDate(newDate);
  };

  const handleMonthChange = (monthsOffset) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + monthsOffset);
    setCurrentDate(newDate);
  };

  const generateDayRange = () => {
    const days = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + (currentDate.getDay() === 0 ? -6 : 1));
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const generateBookedTimeSlots = () => {
    const checkinBookings = getBookingsForDate(currentDate, 'checkin');
    const checkoutBookings = getBookingsForDate(currentDate, 'checkout');

    const checkinSlots = checkinBookings.map((booking) => {
      if (!booking.eta || !booking.eta.includes(':')) {
        console.warn(`Booking ${booking.id} has invalid eta: ${booking.eta}`);
        return null;
      }
      const startTime = booking.eta;
      const [hourStr, minuteStr] = startTime.split(':');
      const startHour = parseInt(hourStr, 10);
      const startMinute = parseInt(minuteStr, 10);
      if (isNaN(startHour) || isNaN(startMinute)) {
        console.warn(`Booking ${booking.id} has invalid eta format: ${booking.eta}`);
        return null;
      }
      const startTotalMinutes = startHour * 60 + startMinute;
      const color =
        booking.bookingStatus === 'CheckedIn' ? '#E0F2F1' :
        booking.paymentStatus === 'Paid' ? '#90EE90' :
        booking.paymentStatus === 'Unpaid' ? '#ADD8E6' : '#E0F2F1';
      const period = startHour < 12 ? 'am' : 'pm';
      const displayHour = startHour <= 12 ? startHour : startHour - 12;
      const time = `${displayHour.toString().padStart(2, '0')}:00 ${period}`;
      return {
        id: `checkin-${booking.id || `${startTime}-${booking.customerId}`}`,
        booking,
        startTotalMinutes,
        startHour,
        time,
        color,
        type: 'checkin',
      };
    }).filter(slot => slot !== null);

    const checkoutSlots = checkoutBookings.map((booking) => {
      if (!booking.etd || !booking.etd.includes(':')) {
        console.warn(`Booking ${booking.id} has invalid etd: ${booking.etd}`);
        return null;
      }
      const endTime = booking.etd;
      const [hourStr, minuteStr] = endTime.split(':');
      const endHour = parseInt(hourStr, 10);
      const endMinute = parseInt(minuteStr, 10);
      if (isNaN(endHour) || isNaN(endMinute)) {
        console.warn(`Booking ${booking.id} has invalid etd format: ${booking.etd}`);
        return null;
      }
      const endTotalMinutes = endHour * 60 + endMinute;
      const color =
        booking.bookingStatus === 'CheckedOut' ? '#FF4500' :
        booking.paymentStatus === 'Paid' ? '#FFB6C1' :
        booking.paymentStatus === 'Unpaid' ? '#FFA07A' : '#F0E68C';
      const period = endHour < 12 ? 'am' : 'pm';
      const displayHour = endHour <= 12 ? endHour : endHour - 12;
      const time = `${displayHour.toString().padStart(2, '0')}:00 ${period}`;
      return {
        id: `checkout-${booking.id || `${endTime}-${booking.customerId}`}`,
        booking,
        startTotalMinutes: endTotalMinutes,
        startHour: endHour,
        time,
        color,
        type: 'checkout',
      };
    }).filter(slot => slot !== null);

    const allSlots = [...checkinSlots, ...checkoutSlots];

    console.log('All slots:', allSlots);

    const timeSlotMap = allSlots.reduce((map, slot) => {
      const { time } = slot;
      if (!map[time]) {
        map[time] = [];
      }
      map[time].push(slot);
      return map;
    }, {});

    Object.keys(timeSlotMap).forEach((time) => {
      timeSlotMap[time].sort((a, b) => a.startTotalMinutes - b.startTotalMinutes);
    });

    return { timeSlotMap, bookedTimes: Object.keys(timeSlotMap).sort() };
  };

  const handleTimeSlotClick = (booking) => {
    setSelectedBookings([booking]);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBookings([]);
    setOptimalPriceData(null);
    setPriceError('');
    setEditingPrice(false);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const swipeDistance = touchEndX - touchStartX.current;
    const minSwipeDistance = 100;

    if (swipeDistance > minSwipeDistance) {
      navigate('/dashboard');
    }
  };

  const handleLoadOptimalPrice = (bookingId) => {
    fetchOptimalPrice(bookingId);
  };

  const formattedMonth = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const { timeSlotMap, bookedTimes } = generateBookedTimeSlots();

  return (
    <div
      className="schedule-container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="header-container">
        <button className="nav-button" onClick={() => handleMonthChange(-1)}>
          ‹
        </button>
        <h3 className="month-title">{formattedMonth}</h3>
        <button className="nav-button" onClick={() => handleMonthChange(1)}>
          ›
        </button>
      </div>

      <Card className="day-card">
        <div className="day-selector-container">
          <button className="nav-button" onClick={() => handleDayChange(-7)}>
            ‹
          </button>
          <div className="day-scroll">
            {generateDayRange().map((date, index) => (
              <div
                key={index}
                className={`day-item ${date.toDateString() === currentDate.toDateString() ? 'selected-day' : ''}`}
                onClick={() => setCurrentDate(new Date(date))}
              >
                <span className="weekday">
                  {date.toLocaleDateString('en-US', { weekday: 'short' }).substring(0, 1)}
                </span>
                <span>{date.getDate()}</span>
              </div>
            ))}
          </div>
          <button className="nav-button" onClick={() => handleDayChange(7)}>
            ›
          </button>
        </div>
      </Card>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search by Hotel, Room, Customer..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>
      
      <button
        className={`filter-button ${showFilter ? 'active' : ''}`}
        onClick={() => setShowFilter(!showFilter)}
      >
        Filter {showFilter ? '▲' : '▼'}
      </button>
      {showFilter && (
        <div className="filter-content">
          <div className="filter-item">
            <label htmlFor="hotelFilter" className="filter-label">By Hotel</label>
            <select
              id="hotelFilter"
              value={selectedHotel}
              onChange={(e) => {
                setSelectedHotel(e.target.value);
                setSelectedRoom('');
              }}
              disabled={loadingHotels}
              className="filter-select"
            >
              <option value="">All Hotels</option>
              {hotels
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((hotel) => (
                  <option key={hotel.id} value={hotel.id}>
                    {hotel.name.charAt(0).toUpperCase() + hotel.name.slice(1)}
                  </option>
                ))}
            </select>
            {loadingHotels && <p className="loading-text">Loading hotels...</p>}
          </div>
          <div className="filter-item">
            <label htmlFor="roomFilter" className="filter-label">By Room</label>
            <select
              id="roomFilter"
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              disabled={!selectedHotel || loadingRooms}
              className="filter-select"
            >
              <option value="">All Rooms</option>
              {rooms
                .sort((a, b) => a.RoomName.localeCompare(b.RoomName))
                .map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.RoomName.charAt(0).toUpperCase() + room.RoomName.slice(1)}
                  </option>
                ))}
            </select>
            {loadingRooms && <p className="loading-text">Loading rooms...</p>}
          </div>
          <div className="filter-item">
            <label htmlFor="paymentStatusFilter" className="filter-label">By Payment Status</label>
            <select
              id="paymentStatusFilter"
              value={selectedPaymentStatus}
              onChange={(e) => setSelectedPaymentStatus(e.target.value)}
              className="filter-select"
            >
              <option value="">All Payment Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>
          <div className="filter-item">
            <label htmlFor="bookingStatusFilter" className="filter-label">By Booking Status</label>
            <select
              id="bookingStatusFilter"
              value={selectedBookingStatus}
              onChange={(e) => setSelectedBookingStatus(e.target.value)}
              className="filter-select"
            >
              <option value="">All Booking Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
              <option value="CheckedIn">Checked In</option>
              <option value="CheckedOut">Checked Out</option>
            </select>
          </div>
          <button
            className="filter-reload-button"
            onClick={fetchMockBookings}
            disabled={mockLoading}
          >
            {mockLoading ? 'Fetching Mock Data...' : 'Reload'}
          </button>
          {error && <p className="error-text">{error}</p>}
          {roomError && <p className="error-text">{roomError}</p>}
        </div>
      )}
    
      {error && !showFilter && <p className="error-text">{error}</p>}
      {roomError && !showFilter && <p className="error-text">{roomError}</p>}

      {bookedTimes.length === 0 && (
        <p className="no-booking">No check-ins or check-outs for this day.</p>
      )}

      <Card className="schedule-card">
        <div className="schedule">
          {bookedTimes.map((time, index) => {
            const slotsInHour = timeSlotMap[time];
            return (
              <React.Fragment key={index}>
                <div className="time-slot-container">
                  <span className="time-label">{time}</span>
                  <div className="time-slot-wrapper">
                    {slotsInHour.map((slot) => (
                      slot.type === 'checkin' ? (
                        <div
                          key={slot.id}
                          className="checkin-card"
                          style={{ backgroundColor: slot.color }}
                          onClick={() => handleTimeSlotClick(slot.booking)}
                        >
                          <div className="booking-details-left">
                            <div className="hotel-name">
                              {getHotelNameById(slot.booking.hotelId)}
                            </div>
                            <div className="room-name">
                              {getRoomNameById(slot.booking.hotelId, slot.booking.roomId)}
                            </div>
                          </div>
                          <div className="customer-details">
                            <div className="customer-name">
                              {slot.booking.customerId}
                            </div>
                            <div className="check-label">Check-in</div>
                          </div>
                        </div>
                      ) : (
                        <div
                          key={slot.id}
                          className="checkout-card"
                          style={{ backgroundColor: slot.color }}
                          onClick={() => handleTimeSlotClick(slot.booking)}
                        >
                          <div className="booking-details-left">
                            <div className="hotel-name">
                              {getHotelNameById(slot.booking.hotelId)}
                            </div>
                            <div className="room-name">
                              {getRoomNameById(slot.booking.hotelId, slot.booking.roomId)}
                            </div>
                          </div>
                          <div className="customer-details">
                            <div className="customer-name">
                              {slot.booking.customerId}
                            </div>
                            <div className="check-label">Check-out</div>
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </div>
                {index < bookedTimes.length - 1 && <div className="separator"></div>}
              </React.Fragment>
            );
          })}
        </div>
        <div className="button-container">
          <button className="all-booking" onClick={() => navigate('/booking')}>
            All Booking
          </button>
          <button className="room-map" onClick={() => navigate('/roommap')}>
            Room Map
          </button>
        </div>
      </Card>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-button" onClick={closeModal}>
              ×
            </button>
            {selectedBookings.length ? (
              <>
                <h3 className="modal-title">Booking Details</h3>
                {selectedBookings.map((booking) => (
                  <div key={booking.id} className="booking-details">
                    <p className="detail-text">Room: {getRoomNameById(booking.hotelId, booking.roomId)}</p>
                    <p className="detail-text">Customer: {booking.customerId}</p>
                    <p className="detail-text">Check-in: {booking.bookIn}</p>
                    <p className="detail-text">Check-out: {booking.bookOut}</p>
                    <p className="detail-text">ETA: {booking.eta}</p>
                    <p className="detail-text">ETD: {booking.etd}</p>
                    <p className="detail-text">Payment Status: {booking.paymentStatus}</p>
                    <p className="detail-text">Booking Status: {booking.bookingStatus}</p>
                    <div className="button-container">
                      {booking.bookingStatus !== 'CheckedIn' &&
                       booking.bookingStatus !== 'CheckedOut' &&
                       booking.bookingStatus !== 'Cancelled' && (
                        <button
                          className="status-button check-in-button"
                          onClick={() => updateBookingStatus(booking.id, 'CheckedIn')}
                          disabled={loadingStatus}
                        >
                          {loadingStatus ? 'Updating...' : 'Check In'}
                        </button>
                      )}
                      {booking.bookingStatus === 'CheckedIn' && (
                        <button
                          className="status-button check-out-button"
                          onClick={() => updateBookingStatus(booking.id, 'CheckedOut')}
                          disabled={loadingStatus}
                        >
                          {loadingStatus ? 'Updating...' : 'Check Out'}
                        </button>
                      )}
                    </div>
                    {priceLoading && <p className="loading-text">Loading optimal price...</p>}
                    {priceError && <p className="error-text">{priceError}</p>}
                    {optimalPriceData && (
                      <div className="optimal-price-card">
                        {editingPrice ? (
                          <div className="price-edit-form">
                            <input
                              type="number"
                              value={newPrice}
                              onChange={(e) => setNewPrice(e.target.value)}
                              className="price-input"
                              placeholder="Enter new price"
                            />
                            <div className="edit-buttons">
                              <button
                                className="save-price-button"
                                onClick={() => updateOptimalPrice(booking.id, newPrice)}
                                disabled={priceUpdateLoading || !newPrice || newPrice <= 0}
                              >
                                {priceUpdateLoading ? 'Saving...' : 'Save'}
                              </button>
                              <button
                                className="cancel-price-button"
                                onClick={() => {
                                  setEditingPrice(false);
                                  setNewPrice(optimalPriceData.optimalPrice.toString());
                                }}
                                disabled={priceUpdateLoading}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="price-display">
                            <p className="optimal-price-text">
                              Optimal Price: ${optimalPriceData.optimalPrice}
                            </p>
                            <div className="price-buttons">
                              <button
                                className="edit-price-button"
                                onClick={() => setEditingPrice(true)}
                              >
                                ✏️
                              </button>
                              <button
                                className="load-price-button"
                                onClick={() => handleLoadOptimalPrice(booking.id)}
                                disabled={priceLoading}
                              >
                                ⟳
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </>
            ) : null}
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  );
};

export default Calendar;