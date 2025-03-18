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
  const DAY_START_HOUR = 7;

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

  const assignColumns = (slots) => {
    const sortedSlots = [...slots].sort((a, b) => a.startTotalMinutes - b.startTotalMinutes);
    const columns = [];

    sortedSlots.forEach(slot => {
      let placed = false;
      for (let col of columns) {
        const lastBooking = col[col.length - 1];
        if (lastBooking.endTotalMinutes <= slot.startTotalMinutes) {
          col.push(slot);
          placed = true;
          break;
        }
      }
      if (!placed) {
        columns.push([slot]);
      }
    });

    const slotToColumn = {};
    columns.forEach((col, colIndex) => {
      col.forEach(slot => {
        slotToColumn[slot.id] = colIndex;
      });
    });

    return { columns, slotToColumn, maxColumns: columns.length };
  };

  const bookedTimeSlots = getBookingsForDate(currentDate).map(booking => {
    const startTime = booking.eta;
    const endTime = booking.etd;
    const startHour = parseInt(startTime.split(':')[0], 10) || 0;
    const startMinute = parseInt(startTime.split(':')[1], 10) || 0;
    const endHour = parseInt(endTime.split(':')[0], 10) || startHour + 1;
    const endMinute = parseInt(endTime.split(':')[1], 10) || 0;

    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    const durationMinutes = endTotalMinutes - startTotalMinutes || 60;

    const roomType = booking.roomId.includes("Meeting") ? "meeting" : "hotel";
    const color = booking.paymentStatus === "Paid"
      ? '#90EE90'
      : booking.paymentStatus === "Unpaid"
      ? '#ADD8E6'
      : '#E0F2F1';

    return {
      id: booking.id || `${startTime}-${endTime}-${booking.customerId}`, // Ensure unique ID
      time: `${startTime} - ${endTime}`,
      booking,
      startTotalMinutes,
      endTotalMinutes,
      durationMinutes,
      color,
      startHour: Math.floor(startTotalMinutes / 60),
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
            const hourStartMinutes = hour * 60;
            const slotsInHour = bookedTimeSlots.filter(slot => slot.startHour === hour);
            const { slotToColumn, maxColumns } = slotsInHour.length > 0
              ? assignColumns(slotsInHour)
              : { slotToColumn: {}, maxColumns: 1 };

            return (
              <div key={index} style={styles.timeSlotContainer}>
                <span style={styles.timeLabel}>{time}</span>
                <div style={{ ...styles.timeSlotWrapper, position: 'relative' }}>
                  {slotsInHour.map(slot => {
                    const column = slotToColumn[slot.id] || 0;
                    const width = 100 / maxColumns;
                    const left = column * width;
                    const top = (slot.startTotalMinutes - hourStartMinutes);

                    return (
                      <div
                        key={slot.id}
                        style={{
                          ...styles.timeSlot,
                          height: `${slot.durationMinutes}px`,
                          width: `${width}%`,
                          left: `${left}%`,
                          top: `${top}px`,
                          backgroundColor: slot.color,
                          position: 'absolute',
                        }}
                        onClick={() => handleTimeSlotClick(slot.booking)}
                      >
                        <span style={styles.time}>{slot.time}</span>
                        <div style={styles.bookingDetails}>
                          <p>{slot.booking.customerId}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
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
    padding: '0',
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
    backgroundColor: '#007bff',
    color: '#fff',
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
    minHeight: '60px',
    position: 'relative',
  },
  timeLabel: {
    width: '80px',
    fontSize: '14px',
    color: '#666',
    textAlign: 'right',
    marginRight: '10px',
    paddingTop: '10px',
  },
  timeSlotWrapper: {
    flex: 1,
    position: 'relative',
    minHeight: '60px',
  },
  timeSlot: {
    padding: '10px',
    margin: '5px 0',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    position: 'absolute',
  },
  time: {
    fontWeight: 'bold',
    marginBottom: '5px',
    display: 'block',
  },
  bookingDetails: {
    marginTop: '5px',
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
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  separator: {
    height: '1px',
    backgroundColor: '#ccc',
    margin: '10px 0',
  },
};

export default Calendar;