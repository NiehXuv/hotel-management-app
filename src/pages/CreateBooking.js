import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';

const CreateBooking = () => {
  const [bookingData, setBookingData] = useState({
    bookIn: '',
    bookOut: '',
    customerName: '',
    eta: '',
    etd: '',
    extraFee: '',
    hotelId: '',
    roomId: '',
    staffId: '',
    paymentStatus: 'Unpaid',
    bookingStatus: 'Pending'
  });
  const [hotelIds, setHotelIds] = useState([]);
  const [roomIds, setRoomIds] = useState([]);
  const [staffIds, setStaffIds] = useState([]);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // Fetch Hotel IDs
  useEffect(() => {
    const fetchHotelIds = async () => {
      setLoadingHotels(true);
      setError('');
      try {
        const response = await fetch('http://localhost:5000/api/hotels/ids', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        if (data.success) {
          setHotelIds(data.data);
        } else {
          setError(`Failed to load hotels: ${data.error || 'Unknown error'}`);
        }
      } catch (err) {
        setError(`Network error: ${err.message}`);
        console.error('Fetch error:', err);
      } finally {
        setLoadingHotels(false);
      }
    };
    fetchHotelIds();
  }, []);

  // Fetch Room IDs based on selected hotelId
  useEffect(() => {
    if (bookingData.hotelId) {
      const fetchRoomIds = async () => {
        setLoadingRooms(true);
        setError('');
        try {
          const response = await fetch(`http://localhost:5000/api/hotels/${bookingData.hotelId}/rooms`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          const data = await response.json();
          if (data.success) {
            setRoomIds(data.data);
          } else {
            setError(`Failed to load rooms: ${data.error || 'Unknown error'}`);
          }
        } catch (err) {
          setError(`Network error: ${err.message}`);
          console.error('Fetch error:', err);
        } finally {
          setLoadingRooms(false);
        }
      };
      fetchRoomIds();
    } else {
      setRoomIds([]);
      setBookingData((prev) => ({ ...prev, roomId: '' }));
    }
  }, [bookingData.hotelId]);

  // Fetch Staff IDs using listStaff endpoint
  useEffect(() => {
    if (bookingData.hotelId) {
      const fetchStaffIds = async () => {
        setLoadingStaff(true);
        setError('');
        try {
          const response = await fetch(`http://localhost:5000/api/staff/list/${bookingData.hotelId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          const data = await response.json();
          if (response.ok) {
            setStaffIds(data); // Data is in the correct format: [{ id: "john", name: "John" }, ...]
          } else {
            setError(data.error || 'Failed to load staff');
          }
        } catch (err) {
          setError(`Network error: ${err.message}`);
          console.error('Fetch error:', err);
        } finally {
          setLoadingStaff(false);
        }
      };
      fetchStaffIds();
    } else {
      setStaffIds([]);
      setBookingData((prev) => ({ ...prev, staffId: '' }));
    }
  }, [bookingData.hotelId]);

  const handleChange = (e) => {
    setBookingData({ ...bookingData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const errors = {};
    if (!bookingData.hotelId) errors.hotelId = 'Please select a property';
    if (!bookingData.roomId) errors.roomId = 'Please select a room';
    if (!bookingData.staffId) errors.staffId = 'Please select a staff member';
    if (!bookingData.bookIn) errors.bookIn = 'Please select a check-in date';
    if (!bookingData.bookOut) errors.bookOut = 'Please select a check-out date';
    if (!bookingData.customerName) errors.customerName = 'Please enter a customer name';
    if (!bookingData.eta) errors.eta = 'Please enter an ETA';
    if (!bookingData.etd) errors.etd = 'Please enter an ETD';
    if (bookingData.extraFee && Number(bookingData.extraFee) < 0) errors.extraFee = 'Extra fee cannot be negative';

    setError(Object.values(errors)[0] || '');
    return Object.keys(errors).length === 0;
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const {
        bookIn,
        bookOut,
        customerName,
        eta,
        etd,
        extraFee,
        hotelId,
        roomId,
        staffId,
        paymentStatus,
        bookingStatus
      } = bookingData;

      const response = await fetch('http://localhost:5000/booking/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookIn,
          bookOut,
          customerName,
          eta,
          etd,
          extraFee,
          hotelId,
          roomId,
          staffId, // This will be the lowercase Name (e.g., "john")
          paymentStatus,
          bookingStatus
        }),
      });

      const data = await response.json();

      if (response.ok && data.message) {
        setSuccessMessage(data.message);
        setBookingData({
          bookIn: '',
          bookOut: '',
          customerName: '',
          eta: '',
          etd: '',
          extraFee: '',
          hotelId: '',
          roomId: '',
          staffId: '',
          paymentStatus: 'Unpaid',
          bookingStatus: 'Pending'
        });
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        setError(data.message || 'Failed to create booking');
      }
    } catch (err) {
      if (err.message.includes('Network')) {
        setError('Unable to connect to the server. Please check your internet connection.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = {
    container: {
      width: '480px',
      margin: 'auto',
      padding: '2rem',
      paddingBottom: 'calc(1rem + var(--footer-height))',
      minHeight: '100vh',
      boxSizing: 'border-box',
    },
    select: {
      width: '100%',
      padding: '0.5rem 0.75rem',
      borderRadius: '0.375rem',
      border: '1px solid #d1d5db',
      outline: 'none',
      transition: 'all 0.3s ease',
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 0.75rem center',
      backgroundSize: '1.5em',
      appearance: 'none',
    },
    selectFocus: {
      borderColor: 'rgba(59, 130, 246, 0.5)',
      boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.3)',
    },
    selectDisabled: {
      backgroundColor: '#f3f4f6',
      color: '#6b7280',
      cursor: 'not-allowed',
    },
    selectOptionDefault: {
      color: '#6b7280',
      fontStyle: 'italic',
    },
    label: {
      display: 'block',
      marginBottom: '0.25rem',
      fontWeight: '500',
      color: '#1f2937',
    },
    requiredStar: {
      color: '#dc2626',
      marginLeft: '0.25rem',
    },
    loadingText: {
      marginTop: '0.25rem',
      fontSize: '0.875rem',
      color: '#6b7280',
    },
    message: {
      marginTop: '1rem',
      textAlign: 'center',
    },
    successMessage: {
      color: '#16a34a',
    },
    errorMessage: {
      color: '#dc2626',
    },
  };

  return (
    <div
      style={styles.container}
      className="sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto mt-6 sm:mt-10 px-4 sm:px-6 overflow-y-auto"
    >
      <Card
        header={<h2 className="text-xl sm:text-2xl font-bold text-neutral-800">Create a New Booking</h2>}
        className="shadow-lg rounded-lg border border-neutral-200"
        bodyClassName="p-4 sm:p-6"
      >
        <form onSubmit={handleCreateBooking} className="space-y-4 sm:space-y-6">
          {/* Hotel Dropdown */}
          <div>
            <label htmlFor="hotelId" style={styles.label}>
              Property
              <span style={styles.requiredStar}>*</span>
            </label>
            <select
              id="hotelId"
              name="hotelId"
              value={bookingData.hotelId}
              onChange={handleChange}
              required
              disabled={loadingHotels}
              style={{
                ...styles.select,
                ...(loadingHotels ? styles.selectDisabled : {}),
              }}
              onFocus={(e) => {
                e.target.style.borderColor = styles.selectFocus.borderColor;
                e.target.style.boxShadow = styles.selectFocus.boxShadow;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
              className="w-full text-sm sm:text-base"
            >
              <option value="" disabled style={styles.selectOptionDefault}>
                Select a Property
              </option>
              {hotelIds
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((hotel) => (
                  <option key={hotel.id} value={hotel.id}>
                    {hotel.name.charAt(0).toUpperCase() + hotel.name.slice(1)}
                  </option>
                ))}
            </select>
            {loadingHotels && <p style={styles.loadingText}>Loading hotels...</p>}
          </div>

          {/* Room Dropdown */}
          <div>
            <label htmlFor="roomId" style={styles.label}>
              Room
              <span style={styles.requiredStar}>*</span>
            </label>
            <select
              id="roomId"
              name="roomId"
              value={bookingData.roomId}
              onChange={handleChange}
              required
              disabled={loadingRooms || !bookingData.hotelId}
              style={{
                ...styles.select,
                ...(loadingRooms || !bookingData.hotelId ? styles.selectDisabled : {}),
              }}
              onFocus={(e) => {
                e.target.style.borderColor = styles.selectFocus.borderColor;
                e.target.style.boxShadow = styles.selectFocus.boxShadow;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
              className="w-full text-sm sm:text-base"
            >
              <option value="" disabled style={styles.selectOptionDefault}>
                {bookingData.hotelId ? "Select a Room" : "Select a Property First"}
              </option>
              {roomIds
                .sort((a, b) => a.RoomNumber - b.RoomNumber)
                .map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.RoomName} (Room {room.RoomNumber})
                  </option>
                ))}
            </select>
            {loadingRooms && <p style={styles.loadingText}>Loading rooms...</p>}
          </div>

          {/* Staff Dropdown */}
          <div>
            <label htmlFor="staffId" style={styles.label}>
              Staff
              <span style={styles.requiredStar}>*</span>
            </label>
            <select
              id="staffId"
              name="staffId"
              value={bookingData.staffId}
              onChange={handleChange}
              required
              disabled={loadingStaff || !bookingData.hotelId}
              style={{
                ...styles.select,
                ...(loadingStaff || !bookingData.hotelId ? styles.selectDisabled : {}),
              }}
              onFocus={(e) => {
                e.target.style.borderColor = styles.selectFocus.borderColor;
                e.target.style.boxShadow = styles.selectFocus.boxShadow;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
              className="w-full text-sm sm:text-base"
            >
              <option value="" disabled style={styles.selectOptionDefault}>
                {bookingData.hotelId ? "Select a Staff Member" : "Select a Property First"}
              </option>
              {staffIds
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name.charAt(0).toUpperCase() + staff.name.slice(1)}
                  </option>
                ))}
            </select>
            {loadingStaff && <p style={styles.loadingText}>Loading staff...</p>}
          </div>

          {/* Check-In Date */}
          <Input
            name="bookIn"
            label="Check-In Date"
            type="date"
            value={bookingData.bookIn}
            onChange={handleChange}
            required
            className="text-sm sm:text-base"
            aria-label="Check-In Date"
          />

          {/* Check-Out Date */}
          <Input
            name="bookOut"
            label="Check-Out Date"
            type="date"
            value={bookingData.bookOut}
            onChange={handleChange}
            required
            className="text-sm sm:text-base"
            aria-label="Check-Out Date"
          />

          {/* Customer Name */}
          <Input
            name="customerName"
            label="Customer Name"
            value={bookingData.customerName}
            onChange={handleChange}
            required
            placeholder="Enter customer name (e.g., Jane Smith)"
            className="text-sm sm:text-base"
            aria-label="Customer Name"
          />

          {/* ETA */}
          <Input
            name="eta"
            label="ETA"
            type="time"
            value={bookingData.eta}
            onChange={handleChange}
            required
            className="text-sm sm:text-base"
            aria-label="ETA"
          />

          {/* ETD */}
          <Input
            name="etd"
            label="ETD"
            type="time"
            value={bookingData.etd}
            onChange={handleChange}
            required
            className="text-sm sm:text-base"
            aria-label="ETD"
          />

          {/* Extra Fee */}
          <Input
            name="extraFee"
            label="Extra Fee"
            type="number"
            value={bookingData.extraFee}
            onChange={handleChange}
            placeholder="Enter extra fee (optional)"
            className="text-sm sm:text-base"
            aria-label="Extra Fee"
          />

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={loadingHotels || loadingRooms || loadingStaff || isSubmitting}
            className="mt-4 text-sm sm:text-base"
          >
            {isSubmitting ? 'Creating...' : 'Create Booking'}
          </Button>
        </form>

        {/* Success/Error Messages */}
        {successMessage && (
          <p
            style={{ ...styles.message, ...styles.successMessage }}
            className="text-sm sm:text-base"
          >
            {successMessage}
          </p>
        )}
        {error && (
          <p
            style={{ ...styles.message, ...styles.errorMessage }}
            className="text-sm sm:text-base"
          >
            {error}
          </p>
        )}
      </Card>
    </div>
  );
};

export default CreateBooking;