import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/layout/BottomNavigation';
import Card from '../components/common/Card';

const Calendar = () => {
  const [bookings, setBookings] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedBookings, setSelectedBookings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, [currentDate]);

  const fetchBookings = async () => {
    try {
      const response = await fetch("http://localhost:5000/booking/list");
      if (!response.ok) throw new Error("Failed to fetch bookings");
      const data = await response.json();
      setBookings(Object.values(data));
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const getBookingsForDate = (date) => {
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.bookIn).toDateString();
      return bookingDate === date.toDateString();
    });
  };

  const handleDayChange = (daysOffset) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + daysOffset);
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

  const generateTimeSlots = () => {
    const timeSlots = [];
    for (let hour = 7; hour <= 23; hour++) {
      const period = hour < 12 ? 'am' : 'pm';
      const displayHour = hour <= 12 ? hour : hour - 12;
      const time = `${displayHour.toString().padStart(2, '0')}:00 ${period}`;
      timeSlots.push(time);
    }
    return timeSlots;
  };

  const bookedTimeSlots = getBookingsForDate(currentDate).map(booking => {
    const startTime = booking.eta;
    const [hourStr, minuteStr] = startTime.split(':');
    const startHour = parseInt(hourStr, 10);
    const startMinute = parseInt(minuteStr, 10);
    const startTotalMinutes = startHour * 60 + startMinute;
    const color = booking.paymentStatus === "Paid"
      ? '#90EE90'
      : booking.paymentStatus === "Unpaid"
      ? '#ADD8E6'
      : '#E0F2F1';
    return {
      id: booking.id || `${startTime}-${booking.customerId}`,
      booking,
      startTotalMinutes,
      startHour,
      color
    };
  });

  const handleTimeSlotClick = (booking) => {
    setSelectedBookings([booking]);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBookings([]);
  };

  const formattedMonth = currentDate.toLocaleString('default', { month: 'long' });

  return (
    
    <div style={styles.scheduleContainer}>
      <h3 style={styles.monthTitle}>{formattedMonth}</h3>
      <Card className="day-selector-card" style={styles.dayCard}>
        <div style={styles.daySelectorContainer}>
          <button style={styles.navButton} onClick={() => handleDayChange(-7)}>‹</button>
          <div style={styles.dayScroll}>
            {generateDayRange().map((date, index) => (
              <div
                key={index}
                style={{
                  ...styles.dayItem,
                  ...(date.toDateString() === currentDate.toDateString() ? styles.selectedDay : {}),
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
          <button style={styles.navButton} onClick={() => handleDayChange(7)}>›</button>
        </div>
      </Card>
      {bookedTimeSlots.length === 0 && (
        <p style={styles.noBooking}>No bookings for this day.</p>
      )}
      <Card className="schedule-view-card" style={styles.scheduleCard}>
        <div style={styles.schedule}>
          {generateTimeSlots().map((time, index) => {
            const hour = parseInt(time.split(':')[0], 10) + (time.includes('pm') && time.split(':')[0] !== '12' ? 12 : 0);
            const slotsInHour = bookedTimeSlots.filter(slot => slot.startHour === hour);
            return (
              <div key={index} style={styles.timeSlotContainer}>
                <span style={styles.timeLabel}>{time}</span>
                <div style={styles.timeSlotWrapper}>
                  {slotsInHour.map(slot => (
                    <div
                      key={slot.id}
                      style={{...styles.bookingCard,
                        backgroundColor: slot.color,
                      }
              }
                      onClick={() => handleTimeSlotClick(slot.booking)}
                    >
                      <div>Room ID: {slot.booking.roomId}</div>
                      <div>{slot.booking.customerId}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <button
  style={styles.allBooking}
  onClick={() => navigate('/booking')}
>
  All Booking
</button>
      </Card>
      {showModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <button style={styles.closeButton} onClick={closeModal}>×</button>
            {selectedBookings.length ? (
              <>
                <h3 style={styles.modalTitle}>Booking Details</h3>
                {selectedBookings.map(booking => (
                  <div key={booking.id} style={styles.bookingDetails}>
                    <p>Room: {booking.roomId}</p>
                    <p>Customer: {booking.customerId}</p>
                    <p>Check-in: {booking.bookIn}</p>
                    <p>Check-out: {booking.bookOut}</p>
                    <p>ETA: {booking.eta}</p>
                    <p>ETD: {booking.etd}</p>
                    <hr style={styles.separator} />
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
    maxWidth: '99%',
    minHeight: '100vh',
  },
  monthTitle: {
    display: 'flex',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0',
  },
  dayCard: {
    borderRadius: '10px',
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
    borderRadius: '50%',
    cursor: 'pointer',
    backgroundColor: '#fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  selectedDay: {
    backgroundColor: '#ADD8E6', // Existing blue highlight
    color: '#fff',
    fontWeight: 'bold', // Added to emphasize the selected date
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
    margin: 'auto',
    padding: '10px',
    borderRadius: '10px',
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
    fontSize: '16px', // Increased from '14px'
    color: '#333', // Changed from light gray to dark gray
    textAlign: 'right',
    marginRight: '10px',
    paddingTop: '10px',
  },
  timeSlotWrapper: {
    display: 'flex',
    flexDirection: 'row',
    overflowX: 'auto',
    minHeight: '50px',
    flex: 1,
    WebkitOverflowScrolling: 'touch', // Improves scrolling on mobile
    scrollbarWidth: 'thin', // For Firefox
    '&::-webkit-scrollbar': {
      height: '8px',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: '#888',
      borderRadius: '4px',
    },
  },
  bookingCard: {
    flex: '0.8 0.1 12em', // Ensures a fixed width of 12em with no shrinking or growing
    height: '5em', // Height remains the same
    margin: '5px',
    padding: '5px',
    backgroundColor: '#4a90e2',
    border: '1px solid rgb(211, 214, 218)',
    borderRadius: '5px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '16px',
    color: '',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
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
    width: '80%',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  },
  closeButton: {
    float: 'right',
    cursor: 'pointer',
    fontSize: '20px',
  },
  modalTitle: {
    fontSize: '20px', // Increased for prominence
    fontWeight: 'bold',
    marginBottom: '15px', // Added spacing below the title
  },
  bookingDetails: {
    marginTop: '10px', // Increased spacing
    fontSize: '16px', // Added for better readability
  },
  separator: {
    height: '1px',
    backgroundColor: '#ccc',
    margin: '10px 0',
  },
  allBooking: {
    margin: '10px auto',
    display: 'block',
    padding: '10px 20px',
    backgroundColor: '#ADD8E6',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
    textAlign: 'center',
  }
};

export default Calendar;