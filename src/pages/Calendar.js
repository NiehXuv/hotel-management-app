import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/layout/BottomNavigation';
import Card from '../components/common/Card';

const Calendar = () => {
  // State variables
  const [bookings, setBookings] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState('');
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [error, setError] = useState('');
  const [allRooms, setAllRooms] = useState([]); // Store all rooms
  const [rooms, setRooms] = useState([]); // Filtered rooms
  const [selectedRoom, setSelectedRoom] = useState('');
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [roomError, setRoomError] = useState('');

  const navigate = useNavigate();
  const touchStartX = useRef(null);

  // Fetch bookings and hotels on component mount
  useEffect(() => {
    fetchBookings();
    fetchHotelIds();
  }, []);

  // Fetch rooms for all hotels when hotels are loaded
  useEffect(() => {
    if (hotels.length > 0) {
      fetchAllRooms();
    }
  }, [hotels]);

  // Filter rooms when a hotel is selected
  useEffect(() => {
    if (selectedHotel) {
      const filteredRooms = allRooms.filter(room => room.hotelId === selectedHotel);
      setRooms(filteredRooms);
    } else {
      setRooms(allRooms); // Reset to all rooms if no hotel is selected
    }
  }, [selectedHotel, allRooms]);

  const fetchBookings = async () => {
    try {
      const response = await fetch('http://localhost:5000/booking/list', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data = await response.json();
      // Extract bookings and add id to each booking object
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

  // Fetch rooms for all hotels
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

  const hotelMap = useMemo(() => {
    return hotels.reduce((map, hotel) => {
      map[hotel.id] = hotel.name;
      return map;
    }, {});
  }, [hotels]);

  const roomMap = useMemo(() => {
    return rooms.reduce((map, room) => {
      const key = `${room.hotelId}-${room.id}`;
      map[key] = room.RoomName;
      return map;
    }, {});
  }, [rooms]);

  const getHotelNameById = (hotelId) => hotelMap[hotelId] || 'Unknown Hotel';

  const getRoomNameById = (hotelId, roomId) => {
    const key = `${hotelId}-${roomId}`;
    return roomMap[key] || `Room ${roomId}`;
  };

  const getBookingsForDate = (date) => {
    return bookings.filter((booking) => {
      if (!booking.bookIn) {
        console.warn(`Booking ${booking.id} has no bookIn date`);
        return false;
      }
      const bookingDate = new Date(booking.bookIn);
      if (isNaN(bookingDate)) {
        console.warn(`Booking ${booking.id} has invalid bookIn date: ${booking.bookIn}`);
        return false;
      }
      const dateMatch = bookingDate.toDateString() === date.toDateString();
      const hotelMatch = selectedHotel ? booking.hotelId === selectedHotel : true;
      const roomMatch = selectedRoom ? booking.roomId === selectedRoom : true;
      console.log(`Checking booking ${booking.id}: bookIn=${booking.bookIn}, dateMatch=${dateMatch}, hotelMatch=${hotelMatch}, roomMatch=${roomMatch}`);
      return dateMatch && hotelMatch && roomMatch;
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
    for (let i = -3; i <= 3; i++) {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const generateBookedTimeSlots = () => {
    const bookedSlots = getBookingsForDate(currentDate).map((booking) => {
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
        id: booking.id || `${startTime}-${booking.customerId}`,
        booking,
        startTotalMinutes,
        startHour,
        time,
        color,
      };
    }).filter(slot => slot !== null); // Remove invalid slots

    console.log('Booked slots:', bookedSlots);

    const timeSlotMap = bookedSlots.reduce((map, slot) => {
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
  };

  const handleBack = () => {
    navigate('/dashboard');
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

      <Card style={{ borderRadius: '2em' }}>
        <details>
          <summary style={{ cursor: 'pointer', fontSize: '1.1rem', listStyle: 'none', marginBottom: '2%' }}>
            Filter Booking
          </summary>
          <div style={styles.filterContainer}>
            <label htmlFor="hotelFilter" style={styles.label}>
              By Hotel
            </label>
            <select
              id="hotelFilter"
              value={selectedHotel}
              onChange={(e) => setSelectedHotel(e.target.value)}
              disabled={loadingHotels}
              style={{ borderRadius: '2em' }}
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
              style={{ borderRadius: '2em' }}
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
        </details>
      </Card>

      {bookedTimes.length === 0 && (
        <p style={styles.noBooking}>No bookings for this day.</p>
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
                      <div
                        key={slot.id}
                        style={{
                          ...styles.bookingCard,
                          backgroundColor: slot.color,
                        }}
                        onClick={() => handleTimeSlotClick(slot.booking)}
                      >
                        <div>{getRoomNameById(slot.booking.hotelId, slot.booking.roomId)}</div>
                        <div>{slot.booking.customerId}</div>
                      </div>
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

// Styles (unchanged)
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
  backButton: {
    position: 'absolute',
    left: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#333',
    padding: '5px 10px',
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
  bookingCard: {
    width: '100%',
    height: '3em',
    margin: '3px 0',
    padding: '1em',
    backgroundColor: '#4a90e2',
    border: '1px solid rgb(211, 214, 218)',
    borderRadius: '2em',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
    color: '#000',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
    textAlign: 'center',
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
    textAlign: 'center',
  },
  filterContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '1rem',
    borderRadius: '2em',
  },
  label: {
    fontSize: '1rem',
    marginBottom: '0.5rem',
  },
  loadingText: {
    fontSize: '0.9rem',
    color: '#666',
  },
  errorText: {
    fontSize: '0.9rem',
    color: '#dc2626',
  },
};

export default Calendar;