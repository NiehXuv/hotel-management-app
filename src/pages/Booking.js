import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Booking = () => {
  // State declarations
  const [bookings, setBookings] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch data when component mounts (unchanged)
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const hotelsResponse = await fetch('http://localhost:5000/api/hotels/ids', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!hotelsResponse.ok) throw new Error(`HTTP error! status: ${hotelsResponse.status}`);
        const hotelsData = await hotelsResponse.json();
        if (hotelsData.success) {
          setHotels(hotelsData.data);
          const roomPromises = hotelsData.data.map(hotel =>
            fetch(`http://localhost:5000/api/hotels/${hotel.id}/rooms`, {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
            }).then(res => res.json())
          );
          const roomData = await Promise.all(roomPromises);
          const roomsMap = {};
          roomData.forEach((data, index) => {
            if (data.success) roomsMap[hotelsData.data[index].id] = data.data;
          });
          setRooms(roomsMap);
          const bookingsResponse = await fetch('http://localhost:5000/booking/list', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });
          if (!bookingsResponse.ok) throw new Error(`HTTP error! status: ${bookingsResponse.status}`);
          const bookingsData = await bookingsResponse.json();
          if (bookingsData) {
            const bookingsArray = Object.keys(bookingsData).map(key => ({
              id: key,
              ...bookingsData[key],
            }));
            setBookings(bookingsArray);
          } else {
            setError('Failed to load bookings');
          }
        } else {
          setError('Failed to load hotels');
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
        if (data.success) {
          setBookings(bookings.filter(booking => booking.id !== bookingId));
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
      console.log('Sending:', updatedBooking); // Debug payload
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
      console.log('Response:', response.status, data); // Debug response
      if (response.ok) {
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking.id === updatedBooking.id ? { ...booking, ...data.booking } : booking
          )
        );
        setTimeout(() => {
          closeModal();
          window.location.reload(); // Refresh the page to load updated content
        }, 3000);
        setSuccessMessage('Update Successfully');
        setTimeout(() => setSuccessMessage(''), 6000);
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

  // Filter and group bookings (unchanged)
  // Inside the BookingList component
  const filteredBookings = bookings.filter((booking) => {
  // Get hotel name (default to empty string if not found)
  const hotelName = hotels.find(h => h.id === booking.hotelId)?.name || '';
  
  // Get room name (default to empty string if not found)
  const roomName = rooms[booking.hotelId]?.find(r => r.id === booking.roomId)?.RoomName || '';
  
  // Convert search query to lowercase for case-insensitive comparison
  const query = searchQuery.toLowerCase();

  // Check if any of the fields match the search query
  return (
    `${booking.id}`.includes(query) ||                              // Booking ID
    (booking.customerId && booking.customerId.toLowerCase().includes(query)) ||  // Customer ID
    hotelName.toLowerCase().includes(query) ||                    // Hotel Name
    roomName.toLowerCase().includes(query)                        // Room Name
  );
});



  //Group by day
  const groupedBookings = filteredBookings.reduce((acc, booking) => {
    const date = new Date(booking.bookIn).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(booking);
    return acc;
  }, {});

  // Updated Styles
  const styles = {
    container: {
      width: '100%',
      margin: 'auto',
      padding: '2rem',
      maxHeight: '100vh',
      boxSizing: 'border-box',
    },
    dateHeader: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginTop: '1rem',
      marginBottom: '0.5rem',
    },
    card: {
      width: '90%',
      margin: 'auto',
      marginBottom: '1rem',
      padding: '0.5rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      cursor: 'pointer',
    },
    errorMessage: { color: '#dc2626', marginTop: '1rem', textAlign: 'center' },
    loadingText: { marginTop: '1rem', textAlign: 'center', color: '#6b7280' },
    noBookings: { marginTop: '1rem', textAlign: 'center', color: '#6b7280' },
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
      maxHeight: '60vh', // Limit height to 60% of viewport height
      overflowY: 'auto', // Enable vertical scrolling if content overflows
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
      border: '1px solid #d1d5db',
      borderRadius: '0.25rem',
    },
    select: {
      width: '100%',
      padding: '0.5rem',
      marginBottom: '0.5rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.25rem',
    },
    formButton: {
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '0.25rem',
      fontSize: '0.875rem',
      cursor: 'pointer',
    },
    saveButton: {
      backgroundColor: '#3b82f6', // Blue for save
      color: '#fff',
      padding: '0.5rem 1.5rem', // Wider for emphasis
    },
    deleteButton: {
      backgroundColor: '#dc2626', // Red for delete
      color: '#fff',
      padding: '0.5rem 1rem', // Standard size
    },
  };

  return (
    <div style={styles.container} className="mx-auto mt-6 px-4 overflow-y-auto">
      <div>
        <h2 className="text-xl font-bold text-neutral-800 mb-4">Bookings List</h2>

        {/* Search Bar */}
        <input
          type="text"
          name="search"
          placeholder="Search by booking ID, customer name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 mb-4 border border-neutral-300 rounded text-sm"
          aria-label="Search Bookings"
        />

        {/* Loading State */}
        {loading && <p style={styles.loadingText}>Loading bookings...</p>}

        {/* Error Message */}
        {error && <p style={styles.errorMessage}>{error}</p>}

        {/* Success Message */}
        {successMessage && (
          <p style={{ color: 'green', textAlign: 'center', marginTop: '1rem' }}>
            {successMessage}
          </p>
        )}

        {/* No Bookings or Search Results */}
        {!loading && !error && Object.keys(groupedBookings).length === 0 && (
          <p style={styles.noBookings}>
            {searchQuery ? 'No bookings match your search.' : 'No bookings found.'}
          </p>
        )}

        {/* Grouped Bookings */}
        {!loading && !error && Object.keys(groupedBookings).length > 0 && (
          <div>
            {Object.entries(groupedBookings).map(([date, bookings]) => (
              <div key={date}>
                <h3 style={styles.dateHeader}>{date}</h3>
                {bookings.map((booking) => {
                  const hotelName = hotels.find(h => h.id === booking.hotelId)?.name || 'N/A';
                  const roomName = rooms[booking.hotelId]?.find(r => r.id === booking.roomId)?.RoomName || 'N/A';
                  return (
                    <div
                      key={booking.id}
                      style={styles.card}
                      onClick={() => openModal(booking)}
                    >
                      <p><strong>Hotel:</strong> {hotelName}</p>
                      <p><strong>Room:</strong> {roomName}</p>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

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
              <h2 className="text-lg font-bold mb-4">Update Booking</h2>
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
    </div>
  );
};

export default Booking;