import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/layout/BottomNavigation';
import Card from '../components/common/Card';

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
  const [optimalPriceData, setOptimalPriceData] = useState(null); // State for optimal price
  const [priceLoading, setPriceLoading] = useState(false); // State to handle loading state of price fetch
  const [priceError, setPriceError] = useState(''); // State to handle errors in price fetch

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

  // Fetch optimal price when a booking is selected and modal is shown
  useEffect(() => {
    if (showModal && selectedBookings.length > 0) {
      fetchOptimalPrice(selectedBookings[0].id);
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

  // Function to fetch optimal price for a booking
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
        booking.paymentStatus === 'Paid'
          ? '#90EE90'
          : booking.paymentStatus === 'Unpaid'
          ? '#ADD8E6'
          : '#E0F2F1';
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
        booking.paymentStatus === 'Paid'
          ? '#FFB6C1'
          : booking.paymentStatus === 'Unpaid'
          ? '#FFA07A'
          : '#F0E68C';
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
    setOptimalPriceData(null); // Reset optimal price data when closing modal
    setPriceError('');
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

  const formattedMonth = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const { timeSlotMap, bookedTimes } = generateBookedTimeSlots();

  return (
    <div
      style={styles.scheduleContainer}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div style={styles.headerContainer}>
        <button style={styles.navButton} onClick={() => handleMonthChange(-1)}>
          ‹
        </button>
        <h3 style={styles.monthTitle}>{formattedMonth}</h3>
        <button style={styles.navButton} onClick={() => handleMonthChange(1)}>
          ›
        </button>
      </div>

      <Card className="day-selector-card" style={styles.dayCard}>
        <div style={styles.daySelectorContainer}>
          <button style={styles.navButton} onClick={() => handleDayChange(-7)}>
            ‹
          </button>
          <div style={styles.dayScroll}>
            {generateDayRange().map((date, index) => (
              <div
                key={index}
                style={{
                  ...styles.dayItem,
                  ...(date.toDateString() === currentDate.toDateString()
                    ? styles.selectedDay
                    : {}),
                }}
                onClick={() => setCurrentDate(new Date(date))}
              >
                <span style={styles.weekday}>
                  {date.toLocaleDateString('en-US', { weekday: 'short' }).substring(0, 1)}
                </span>
                <span>{date.getDate()}</span>
              </div>
            ))}
          </div>
          <button style={styles.navButton} onClick={() => handleDayChange(7)}>
            ›
          </button>
        </div>
      </Card>

      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search by Hotel, Room, Customer..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      <button
        style={{
          ...styles.filterButton,
          backgroundColor: showFilter ? '#ADD8E6' : '#fff',
        }}
        onClick={() => setShowFilter(!showFilter)}
      >
        Filter {showFilter ? '▲' : '▼'}
      </button>
      {showFilter && (
        <div style={styles.filterContent}>
          <div style={styles.filterContainer}>
            <label htmlFor="hotelFilter" style={styles.label}>
              By Hotel
            </label>
            <select
              id="hotelFilter"
              value={selectedHotel}
              onChange={(e) => {
                setSelectedHotel(e.target.value);
                setSelectedRoom('');
              }}
              disabled={loadingHotels}
              style={{ borderRadius: '1em', padding: '0.5em' }}
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
            {loadingHotels && <p style={styles.loadingText}>Loading hotels...</p>}
            {error && <p style={styles.errorText}>{error}</p>}
          </div>
          <div style={styles.filterContainer}>
            <label htmlFor="roomFilter" style={styles.label}>
              By Room
            </label>
            <select
              id="roomFilter"
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              disabled={!selectedHotel || loadingRooms}
              style={{ borderRadius: '1em', padding: '0.5em' }}
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
            {loadingRooms && <p style={styles.loadingText}>Loading rooms...</p>}
            {roomError && <p style={styles.errorText}>{roomError}</p>}
          </div>
          <div style={styles.filterContainer}>
            <label htmlFor="paymentStatusFilter" style={styles.label}>
              By Payment Status
            </label>
            <select
              id="paymentStatusFilter"
              value={selectedPaymentStatus}
              onChange={(e) => setSelectedPaymentStatus(e.target.value)}
              style={{ borderRadius: '1em', padding: '0.5em' }}
            >
              <option value="">All Payment Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>
          <div style={styles.filterContainer}>
            <label htmlFor="bookingStatusFilter" style={styles.label}>
              By Booking Status
            </label>
            <select
              id="bookingStatusFilter"
              value={selectedBookingStatus}
              onChange={(e) => setSelectedBookingStatus(e.target.value)}
              style={{ borderRadius: '1em', padding: '0.5em' }}
            >
              <option value="">All Booking Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      )}

      {bookedTimes.length === 0 && (
        <p style={styles.noBooking}>No check-ins or check-outs for this day.</p>
      )}

      <Card className="schedule-view-card" style={styles.scheduleCard}>
        <div style={styles.schedule}>
          {bookedTimes.map((time, index) => {
            const slotsInHour = timeSlotMap[time];
            return (
              <React.Fragment key={index}>
                <div style={styles.timeSlotContainer}>
                  <span style={styles.timeLabel}>{time}</span>
                  <div style={styles.timeSlotWrapper}>
                    {slotsInHour.map((slot) => (
                      slot.type === 'checkin' ? (
                        <div
                          key={slot.id}
                          style={{
                            ...styles.checkinCard,
                            backgroundColor: slot.color,
                          }}
                          onClick={() => handleTimeSlotClick(slot.booking)}
                        >
                          <div style={styles.bookingDetailsLeft}>
                            <div style={styles.hotelName}>
                              {getHotelNameById(slot.booking.hotelId)}
                            </div>
                            <div style={styles.roomName}>
                              {getRoomNameById(slot.booking.hotelId, slot.booking.roomId)}
                            </div>
                          </div>
                          <div style={styles.customerDetails}>
                            <div style={styles.customerName}>
                              {slot.booking.customerId}
                            </div>
                            <div style={styles.checkLabel}>Check-in</div>
                          </div>
                        </div>
                      ) : (
                        <div
                          key={slot.id}
                          style={{
                            ...styles.checkoutCard,
                            backgroundColor: slot.color,
                          }}
                          onClick={() => handleTimeSlotClick(slot.booking)}
                        >
                          <div style={styles.bookingDetailsLeft}>
                            <div style={styles.hotelName}>
                              {getHotelNameById(slot.booking.hotelId)}
                            </div>
                            <div style={styles.roomName}>
                              {getRoomNameById(slot.booking.hotelId, slot.booking.roomId)}
                            </div>
                          </div>
                          <div style={styles.customerDetails}>
                            <div style={styles.customerName}>
                              {slot.booking.customerId}
                            </div>
                            <div style={styles.checkLabel}>Check-out</div>
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </div>
                {index < bookedTimes.length - 1 && <div style={styles.separator}></div>}
              </React.Fragment>
            );
          })}
        </div>
        <button style={styles.allBooking} onClick={() => navigate('/booking')}>
          All Booking
        </button>
      </Card>

      {showModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <button style={styles.closeButton} onClick={closeModal}>
              ×
            </button>
            {selectedBookings.length ? (
              <>
                <h3 style={styles.modalTitle}>Booking Details</h3>
                {selectedBookings.map((booking) => (
                  <div key={booking.id} style={styles.bookingDetails}>
                    <p>Room: {getRoomNameById(booking.hotelId, booking.roomId)}</p>
                    <p>Customer: {booking.customerId}</p>
                    <p>Check-in: {booking.bookIn}</p>
                    <p>Check-out: {booking.bookOut}</p>
                    <p>ETA: {booking.eta}</p>
                    <p>ETD: {booking.etd}</p>
                    <p>Payment Status: {booking.paymentStatus}</p>
                    <p>Booking Status: {booking.bookingStatus}</p>
                    {/* Display Optimal Price in a colored Card */}
                    {priceLoading && <p style={styles.loadingText}>Loading optimal price...</p>}
                    {priceError && <p style={styles.errorText}>{priceError}</p>}
                    {optimalPriceData && (
                      <Card
                        style={{
                          backgroundColor: '#E0F2F1', // Light teal background for emphasis
                          borderRadius: '2em',
                          padding: '0.5em',
                          marginTop: '0.5em',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        }}
                      >
                        <p style={{ fontWeight: 'bold' }}>
                          Optimal Price: ${optimalPriceData.optimalPrice} 
                        </p>
                      </Card>
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

const styles = {
  scheduleContainer: {
    margin: 'auto',
    padding: '1em',
    backgroundColor: '#f9f9f9',
    width: '100%',
    minHeight: '100vh',
    touchAction: 'pan-y',
    paddingBottom: '2em'
  },
  headerContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    marginBottom: '1em',
  },
  monthTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: 0,
  },
  dayCard: {
    borderRadius: '2em',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  daySelectorContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayScroll: {
    display: 'flex',
    overflowX: 'auto',
    whiteSpace: 'nowrap',
    flexGrow: 1,
    padding: '0 10px',
  },
  dayItem: {
    display: 'inline-flex',
    flexDirection: 'column',
    width: '45px',
    textAlign: 'center',
    margin: 'auto',
    borderRadius: '2em',
    cursor: 'pointer',
    backgroundColor: '#fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  selectedDay: {
    backgroundColor: '#ADD8E6',
    color: '#fff',
    fontWeight: 'bold',
  },
  weekday: {
    fontSize: '12px',
    color: '#666',
  },
  navButton: {
    padding: '5px 10px',
    cursor: 'pointer',
    backgroundColor: '#fff',
    border: 'none',
    fontSize: '18px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  searchContainer: {
    marginBottom: '1em',
    width: '100%',
  },
  searchInput: {
    width: '100%',
    padding: '0.5em',
    borderRadius: '1em',
    border: '1px solid #ccc',
    fontSize: '0.9rem',
  },
  filterButton: {
    padding: '0.5em 1em',
    fontSize: '0.9rem',
    border: 'none',
    marginBottom: '1em',
    borderRadius: '2em',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    backgroundColor: '#fff',
  },
  filterContent: {
    padding: '1em',
  },
  scheduleCard: {
    width: '100%',
    margin: 'auto',
    padding: '10px',
    borderRadius: '2em',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  schedule: {
    maxHeight: '60vh',
    overflowY: 'auto',
    position: 'relative',
  },
  timeSlotContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    minHeight: '50px',
  },
  timeLabel: {
    width: '80px',
    fontSize: '16px',
    color: '#333',
    textAlign: 'right',
    marginRight: '10px',
    paddingTop: '10px',
  },
  timeSlotWrapper: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '50px',
    flex: 1,
    overflowX: 'hidden',
  },
  checkinCard: {
    width: '100%',
    minHeight: '4em',
    margin: '5px 0',
    padding: '0.8em',
    border: '1px solid rgb(211, 214, 218)',
    borderRadius: '1em',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
    color: '#000',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    cursor: 'pointer',
  },
  checkoutCard: {
    width: '100%',
    minHeight: '4em',
    margin: '5px 0',
    padding: '0.8em',
    border: '1px solid rgb(211, 214, 218)',
    borderRadius: '1em',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
    color: '#000',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    cursor: 'pointer',
  },
  bookingDetailsLeft: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '0.2em',
  },
  hotelName: {
    fontWeight: 'bold',
    fontSize: '14px',
  },
  roomName: {
    fontSize: '12px',
    color: '#555',
  },
  customerName: {
    fontSize: '14px',
    textAlign: 'right',
  },
  noBooking: {
    textAlign: 'center',
    color: '#888',
    padding: '20px',
  },
  modal: {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '20em',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '2em',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  },
  closeButton: {
    float: 'right',
    cursor: 'pointer',
    fontSize: '20px',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '15px',
  },
  bookingDetails: {
    marginTop: '10px',
    fontSize: '16px',
  },
  separator: {
    height: '1px',
    backgroundColor: '#ccc',
    margin: '10px 0',
  },
  allBooking: {
    margin: '2em auto',
    display: 'block',
    padding: '1em 2em',
    backgroundColor: '#FFD167',
    color: '#fff',
    border: 'none',
    borderRadius: '2em',
    fontSize: '16px',
    cursor: 'pointer',
  },
  filterContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  label: {
    fontSize: '0.9rem',
    marginBottom: '0.3rem',
  },
  loadingText: {
    fontSize: '0.8rem',
    color: '#666',
  },
  errorText: {
    fontSize: '0.8rem',
    color: '#dc2626',
  },
  checkLabel: {
    fontSize: '10px',
    color: '#777',
    textAlign: 'right',
  },
};

export default Calendar;