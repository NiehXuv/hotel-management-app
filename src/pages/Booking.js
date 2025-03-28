import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';

const Booking = () => {
  // State declarations
  const [bookings, setBookings] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHotel, setSelectedHotel] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('');
  const [selectedBookingStatus, setSelectedBookingStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate();

  // Helper function to validate and parse date
  const parseDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date string: ${dateString}`);
      return null; // Return null for invalid dates
    }
    return date;
  };

  // Fetch data when component mounts: Bookings -> Hotels -> Rooms
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Step 1: Fetch bookings first
        const bookingsResponse = await fetch('http://localhost:5000/booking/list', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!bookingsResponse.ok) throw new Error(`HTTP error! status: ${bookingsResponse.status}`);
        const bookingsData = await bookingsResponse.json();
        if (bookingsData && bookingsData.bookings) {
          const bookingsArray = Object.keys(bookingsData.bookings).map(key => ({
            id: key,
            ...bookingsData.bookings[key],
          }));

          // Filter out bookings with invalid bookIn dates
          const validBookings = bookingsArray.filter(booking => {
            const date = parseDate(booking.bookIn);
            if (!date) {
              console.warn(`Filtered out booking with invalid bookIn date:`, booking);
              return false;
            }
            return true;
          });

          setBookings(validBookings);
          console.log('Valid Bookings:', validBookings); // Debug valid bookings

          // Step 2: Fetch hotels based on bookings
          const hotelIds = [...new Set(validBookings.map(booking => booking.hotelId))];
          if (hotelIds.length === 0) {
            setHotels([]);
            setRooms({});
            return;
          }

          const hotelsResponse = await fetch('http://localhost:5000/api/hotels/ids', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });
          if (!hotelsResponse.ok) throw new Error(`HTTP error! status: ${hotelsResponse.status}`);
          const hotelsData = await hotelsResponse.json();
          if (hotelsData.success) {
            const filteredHotels = hotelsData.data.filter(hotel => hotelIds.includes(hotel.id));
            setHotels(filteredHotels);
            console.log('Hotels:', filteredHotels); // Debug hotels

            // Step 3: Fetch rooms for the hotels present in bookings
            const roomPromises = filteredHotels.map(hotel =>
              fetch(`http://localhost:5000/api/hotels/${hotel.id}/rooms`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
              }).then(res => res.json())
            );
            const roomData = await Promise.all(roomPromises);
            const roomsMap = {};
            roomData.forEach((data, index) => {
              if (data.success) {
                roomsMap[filteredHotels[index].id] = data.data;
              } else {
                console.error(`Failed to load rooms for hotel ${filteredHotels[index].id}:`, data.error);
              }
            });
            setRooms(roomsMap);
            console.log('Rooms state:', roomsMap); // Debug the rooms state
          } else {
            setError('Failed to load hotels');
          }
        } else {
          setError('Failed to load bookings');
        }
      } catch (err) {
        setError(`Network error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Handle booking deletion (unchanged)
  const handleDelete = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        const response = await fetch(`http://localhost:5000/booking/${bookingId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        });

        const data = await response.json();
        console.log('Delete Response:', response.status, data);

        if (response.ok) {
          setBookings(bookings.filter(booking => booking.id !== bookingId));
          setSuccessMessage('Booking deleted successfully');
          setTimeout(() => setSuccessMessage(''), 3000);
          closeModal();
        } else {
          setError(data.error || 'Failed to delete booking');
        }
      } catch (err) {
        setError(`Network error: ${err.message}`);
      }
    }
  };

  // Handle booking update (unchanged)
  const handleUpdate = async (updatedBooking) => {
    try {
      console.log('Sending:', updatedBooking);
      const response = await fetch(`http://localhost:5000/booking/${updatedBooking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookIn: updatedBooking.bookIn,
          bookOut: updatedBooking.bookOut,
          customerId: updatedBooking.customerId,
          eta: updatedBooking.eta,
          etd: updatedBooking.etd,
          extraFee: updatedBooking.extraFee,
          paymentStatus: updatedBooking.paymentStatus,
          bookingStatus: updatedBooking.bookingStatus,
          staffId: updatedBooking.staffId,
          roomId: updatedBooking.roomId,
        }),
      });

      const data = await response.json();
      console.log('Response:', response.status, data);
      if (response.ok) {
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking.id === updatedBooking.id ? { ...booking, ...data.booking } : booking
          )
        );
        setTimeout(() => {
          closeModal();
          window.location.reload();
        }, 1000);
        setSuccessMessage('Update Successfully');
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        setError(data.error || 'Failed to update booking');
      }
    } catch (err) {
      setError(`Network error: ${err.message}`);
    }
  };

  // Open/close modal functions (unchanged)
  const openModal = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  // Memoized filtered bookings to prevent unnecessary re-computations
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const hotelName = hotels.find(h => h.id === booking.hotelId)?.name || '';
      const roomName = rooms[booking.hotelId]?.find(r => r.id === booking.roomId)?.RoomName || '';
      const query = searchQuery.toLowerCase();

      // Apply search query filter
      const matchesQuery =
        `${booking.id}`.includes(query) ||
        (booking.customerId && booking.customerId.toLowerCase().includes(query)) ||
        hotelName.toLowerCase().includes(query) ||
        roomName.toLowerCase().includes(query);

      // Apply hotel filter
      const matchesHotel = selectedHotel ? booking.hotelId === selectedHotel : true;

      // Apply room filter
      const matchesRoom = selectedRoom ? booking.roomId === selectedRoom : true;

      // Apply payment status filter
      const matchesPaymentStatus = selectedPaymentStatus ? booking.paymentStatus === selectedPaymentStatus : true;

      // Apply booking status filter
      const matchesBookingStatus = selectedBookingStatus ? booking.bookingStatus === selectedBookingStatus : true;

      return matchesQuery && matchesHotel && matchesRoom && matchesPaymentStatus && matchesBookingStatus;
    });
  }, [bookings, searchQuery, selectedHotel, selectedRoom, selectedPaymentStatus, selectedBookingStatus, hotels, rooms]);

  // Memoized grouped bookings to prevent unnecessary re-computations
  const groupedBookings = useMemo(() => {
    return filteredBookings.reduce((acc, booking) => {
      const dateObj = parseDate(booking.bookIn);
      if (!dateObj) {
        console.warn(`Skipping booking with invalid bookIn date:`, booking);
        return acc; // Skip bookings with invalid dates
      }
      const date = dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      if (!acc[date]) acc[date] = [];
      acc[date].push(booking);
      return acc;
    }, {});
  }, [filteredBookings]);

  // Sort the dates in descending order (most recent first)
  const sortedDates = useMemo(() => {
    return Object.keys(groupedBookings).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateB - dateA; // Descending order
    });
  }, [groupedBookings]);

  // Styles (unchanged)
  const styles = {
    container: {
      margin: 'auto',
      padding: '1em',
      backgroundColor: '#f9f9f9',
      width: '100vw',
      maxWidth: '480px',
      minHeight: '100vh',
      touchAction: 'pan-y',
      paddingBottom: '2em',
    },
    header: {
      fontSize: '24px',
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: '1em',
    },
    dateHeader: {
      fontSize: '1.3rem',
      fontWeight: 'bold',
      marginTop: '1.3rem',
      marginBottom: '0.5rem',
      color: '#333',
    },
    card: {
      width: '100%',
      height: '4em',
      margin: '0.5rem 0',
      padding: '2em',
      border: '1px solid rgb(211, 214, 218)',
      borderRadius: '2em',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '1em',
      color: '#000',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
      cursor: 'pointer',
    },
    searchInput: {
      width: '100%',
      padding: '0.5rem',
      border: '1px solid rgb(211, 214, 218)',
      borderRadius: '5px',
      fontSize: '14px',
      backgroundColor: '#fff',
      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
    },
    filterContainer: {
      marginBottom: '0.5rem',
    },
    label: {
      display: 'block',
      fontSize: '14px',
      color: '#333',
      marginBottom: '0.25rem',
    },
    hotelSelect: {
      width: '100%',
      padding: '0.5rem',
      border: '1px solid rgb(211, 214, 218)',
      borderRadius: '5px',
      fontSize: '14px',
      backgroundColor: '#fff',
      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
    },
    errorMessage: {
      color: '#dc2626',
      marginTop: '1rem',
      textAlign: 'center',
    },
    loadingText: {
      marginTop: '1rem',
      textAlign: 'center',
      color: '#6b7280',
    },
    noBookings: {
      marginTop: '1rem',
      textAlign: 'center',
      color: '#888',
    },
    successMessage: {
      color: 'green',
      textAlign: 'center',
      marginTop: '1rem',
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    modalContent: {
      backgroundColor: '#fff',
      padding: '1.5rem',
      paddingBottom: '1rem',
      borderRadius: '0.5rem',
      width: '80%',
      maxWidth: '400px',
      position: 'relative',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      maxHeight: '60vh',
      overflowY: 'auto',
    },
    modalHeader: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '15px',
    },
    closeButton: {
      position: 'absolute',
      top: '0.5rem',
      right: '0.5rem',
      fontSize: '1.5rem',
      cursor: 'pointer',
      color: '#dc2626',
    },
    input: {
      width: '100%',
      padding: '0.5rem',
      marginBottom: '0.5rem',
      border: '1px solid rgb(211, 214, 218)',
      borderRadius: '5px',
      fontSize: '14px',
    },
    select: {
      width: '100%',
      padding: '0.5rem',
      marginBottom: '0.5rem',
      border: '1px solid rgb(211, 214, 218)',
      borderRadius: '5px',
      fontSize: '14px',
    },
    formButton: {
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '5px',
      fontSize: '14px',
      cursor: 'pointer',
    },
    saveButton: {
      backgroundColor: '#ADD8E6',
      color: '#fff',
      padding: '0.5rem 1.5rem',
    },
    deleteButton: {
      backgroundColor: '#F04770',
      color: '#fff',
      padding: '0.5rem 1rem',
    },
    createBooking: {
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
  };

  return (
    <div style={styles.container}>
      {/* Filter Section in Card */}
      {!loading && (
        <Card style={{ borderRadius: '1.8em', padding: 'auto' }}>
          <details>
            <summary style={{ cursor: 'pointer', fontSize: '1.1rem', listStyle: 'none' }}>
              Filter Bookings
            </summary>
            {/* Search Bar */}
            <div style={styles.filterContainer}>
              <label htmlFor="search" style={styles.label}>
                Search by Hotel, Room, or Customer
              </label>
              <input
                type="text"
                id="search"
                name="search"
                placeholder="Search by Hotel, Room name, or Customer ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
                aria-label="Search Bookings"
              />
            </div>
            {/* Hotel Filter */}
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
                style={styles.hotelSelect}
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
            </div>
            {/* Room Filter */}
            <div style={styles.filterContainer}>
              <label htmlFor="roomFilter" style={styles.label}>
                By Room
              </label>
              <select
                id="roomFilter"
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                disabled={!selectedHotel}
                style={styles.hotelSelect}
              >
                <option value="">All Rooms</option>
                {selectedHotel &&
                  rooms[selectedHotel]?.length > 0 &&
                  rooms[selectedHotel]
                    .sort((a, b) => (a.RoomName || '').localeCompare(b.RoomName || ''))
                    .map((room) => (
                      <option key={room.id} value={room.id}>
                        {(room.RoomName || '').charAt(0).toUpperCase() + (room.RoomName || '').slice(1)}
                      </option>
                    ))}
              </select>
            </div>
            {/* Payment Status Filter */}
            <div style={styles.filterContainer}>
              <label htmlFor="paymentStatusFilter" style={styles.label}>
                By Payment Status
              </label>
              <select
                id="paymentStatusFilter"
                value={selectedPaymentStatus}
                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                style={styles.hotelSelect}
              >
                <option value="">All Payment Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>
            {/* Booking Status Filter */}
            <div style={styles.filterContainer}>
              <label htmlFor="bookingStatusFilter" style={styles.label}>
                By Booking Status
              </label>
              <select
                id="bookingStatusFilter"
                value={selectedBookingStatus}
                onChange={(e) => setSelectedBookingStatus(e.target.value)}
                style={styles.hotelSelect}
              >
                <option value="">All Booking Statuses</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </details>
        </Card>
      )}

      {/* Loading State */}
      {loading && <p style={styles.loadingText}>Loading bookings...</p>}

      {/* Error Message */}
      {error && <p style={styles.errorMessage}>{error}</p>}

      {/* Success Message */}
      {successMessage && (
        <p style={styles.successMessage}>
          {successMessage}
        </p>
      )}

      {/* No Bookings or Search Results */}
      {!loading && !error && sortedDates.length === 0 && (
        <p style={styles.noBookings}>
          {searchQuery || selectedHotel || selectedRoom || selectedPaymentStatus || selectedBookingStatus
            ? 'No bookings match your filters.'
            : 'No bookings found.'}
        </p>
      )}

      {/* Grouped Bookings */}
      {!loading && !error && sortedDates.length > 0 && (
        <div>
          {sortedDates.map((date) => (
            <div key={date}>
              <h3 style={styles.dateHeader}>{date}</h3>
              {groupedBookings[date].map((booking) => {
                const hotelName = hotels.find(h => h.id === booking.hotelId)?.name || 'N/A';
                const roomName = rooms[booking.hotelId]?.find(r => r.id === booking.roomId)?.RoomName || 'N/A';
                console.log(`Booking hotelId: ${booking.hotelId}, roomId: ${booking.roomId}, roomName: ${roomName}`); // Debug booking IDs
                const backgroundColor =
                  booking.paymentStatus === 'Paid'
                    ? '#90EE90'
                    : booking.paymentStatus === 'Unpaid'
                    ? '#ADD8E6'
                    : '#E0F2F1';

                return (
                  <div
                    key={booking.id}
                    style={{
                      ...styles.card,
                      backgroundColor,
                    }}
                    onClick={() => openModal(booking)}
                  >
                    <div>{booking.eta}</div>
                    <div style={{ textAlign: 'right' }}>
                      <div>{hotelName}</div>
                      <div>{roomName}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      <button style={styles.createBooking} onClick={() => navigate('/booking/create')}>
        Create New Booking
      </button>

      {/* Modal for Update and Delete */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <span
              style={styles.closeButton}
              onClick={closeModal}
              aria-label="Close Modal"
            >
              ❌
            </span>
            <h2 style={styles.modalHeader}>Update Booking</h2>
            {error && <p style={styles.errorMessage}>{error}</p>}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdate(selectedBooking);
              }}
            >
              <label className="block mb-2">
                Hotel:
                <select
                  style={styles.select}
                  value={selectedBooking?.hotelId || ''}
                  onChange={(e) => {
                    const newHotelId = e.target.value;
                    setSelectedBooking({ ...selectedBooking, hotelId: newHotelId, roomId: '' });
                  }}
                >
                  <option value="">Select Hotel</option>
                  {hotels.map((hotel) => (
                    <option key={hotel.id} value={hotel.id}>
                      {hotel.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block mb-2">
                Room:
                <select
                  style={styles.select}
                  value={selectedBooking?.roomId || ''}
                  onChange={(e) => setSelectedBooking({ ...selectedBooking, roomId: e.target.value })}
                  disabled={!selectedBooking?.hotelId}
                >
                  <option value="">Select Room</option>
                  {rooms[selectedBooking?.hotelId]?.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.RoomName}
                    </option>
                  )) || <option>No rooms available</option>}
                </select>
              </label>
              <label className="block mb-2">
                Check-In Date:
                <input
                  style={styles.input}
                  type="date"
                  value={selectedBooking?.bookIn || ''}
                  onChange={(e) => setSelectedBooking({ ...selectedBooking, bookIn: e.target.value })}
                />
              </label>
              <label className="block mb-2">
                Check-Out Date:
                <input
                  style={styles.input}
                  type="date"
                  value={selectedBooking?.bookOut || ''}
                  onChange={(e) => setSelectedBooking({ ...selectedBooking, bookOut: e.target.value })}
                />
              </label>
              <label className="block mb-2">
                Customer ID:
                <input
                  style={styles.input}
                  type="text"
                  value={selectedBooking?.customerId || ''}
                  onChange={(e) => setSelectedBooking({ ...selectedBooking, customerId: e.target.value })}
                />
              </label>
              <label className="block mb-2">
                ETA:
                <input
                  style={styles.input}
                  type="text"
                  value={selectedBooking?.eta || ''}
                  onChange={(e) => setSelectedBooking({ ...selectedBooking, eta: e.target.value })}
                />
              </label>
              <label className="block mb-2">
                ETD:
                <input
                  style={styles.input}
                  type="text"
                  value={selectedBooking?.etd || ''}
                  onChange={(e) => setSelectedBooking({ ...selectedBooking, etd: e.target.value })}
                />
              </label>
              <label className="block mb-2">
                Extra Fee:
                <input
                  style={styles.input}
                  type="number"
                  value={selectedBooking?.extraFee || ''}
                  onChange={(e) => setSelectedBooking({ ...selectedBooking, extraFee: e.target.value })}
                />
              </label>
              <label className="block mb-2">
                Payment Status:
                <select
                  style={styles.select}
                  value={selectedBooking?.paymentStatus || ''}
                  onChange={(e) => setSelectedBooking({ ...selectedBooking, paymentStatus: e.target.value })}
                >
                  <option value="Unpaid">Unpaid</option>
                  <option value="Paid">Paid</option>
                </select>
              </label>
              <label className="block mb-2">
                Booking Status:
                <select
                  style={styles.select}
                  value={selectedBooking?.bookingStatus || ''}
                  onChange={(e) => setSelectedBooking({ ...selectedBooking, bookingStatus: e.target.value })}
                >
                  <option value="Confirmed">Confirmed</option>
                  <option value="Pending">Pending</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </label>
              <label className="block mb-2">
                Staff:
                <input
                  style={styles.input}
                  type="text"
                  value={selectedBooking?.staffId || ''}
                  onChange={(e) => setSelectedBooking({ ...selectedBooking, staffId: e.target.value })}
                />
              </label>
              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                <button
                  type="submit"
                  style={{ ...styles.formButton, ...styles.saveButton }}
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(selectedBooking.id)}
                  style={{ ...styles.formButton, ...styles.deleteButton }}
                >
                  Delete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;