import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';

const CreateRoom = () => {
  const [roomData, setRoomData] = useState({
    hotelId: '',
    RoomName: '',
    Description: '',
    PriceByDay: '',
    PriceByNight: '',
    PriceBySection: '',
    RoomNumber: '',
  });
  const [hotelIds, setHotelIds] = useState([]);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

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

        const text = await response.text();
        console.log('Raw response:', text);

        try {
          const data = JSON.parse(text);
          if (data.success) {
            setHotelIds(data.data);
          } else {
            setError(`Failed to load hotels: ${data.error || 'Unknown error'}`);
          }
        } catch (jsonError) {
          setError(`Invalid JSON response: ${jsonError.message}`);
          console.error('JSON parse error:', jsonError);
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

  const handleChange = (e) => {
    setRoomData({ ...roomData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const errors = {};
    if (!roomData.hotelId) errors.hotelId = 'Please select a property';
    if (roomData.RoomName.length < 2) errors.RoomName = 'Name must be at least 2 characters';
    if (roomData.Description.length < 10) errors.Description = 'Description must be at least 10 characters';
    if (Number(roomData.PriceByDay) < 0) errors.PriceByDay = 'Price cannot be negative';
    if (Number(roomData.PriceByNight) < 0) errors.PriceByNight = 'Price cannot be negative';
    if (Number(roomData.PriceBySection) < 0) errors.PriceBySection = 'Price cannot be negative';
    if (!/^\d+$/.test(roomData.RoomNumber)) errors.RoomNumber = 'Room number must be numeric';

    setError(Object.values(errors)[0] || '');
    return Object.keys(errors).length === 0;
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const { hotelId, RoomName, Description, PriceByDay, PriceByNight, PriceBySection, RoomNumber } = roomData;

      const response = await fetch(`http://localhost:5000/api/rooms/${hotelId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          RoomName,
          Description,
          PriceByDay,
          PriceByNight,
          PriceBySection,
          RoomNumber,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMessage(data.message || 'Room created successfully!');
        setRoomData({
          hotelId: '',
          RoomName: '',
          Description: '',
          PriceByDay: '',
          PriceByNight: '',
          PriceBySection: '',
          RoomNumber: '',
        });
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        setError(data.error || 'Failed to create room');
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
      width: '400px',
      margin: '0 auto',
      padding: '1rem',
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
        header={<h2 className="text-xl sm:text-2xl font-bold text-neutral-800">Create a New Room</h2>}
        className="shadow-lg rounded-lg border border-neutral-200"
        bodyClassName="p-4 sm:p-6"
      >
        <form onSubmit={handleCreateRoom} className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="hotelId" style={styles.label}>
              Property
              <span style={styles.requiredStar}>*</span>
            </label>
            <select
              id="hotelId"
              name="hotelId"
              value={roomData.hotelId}
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

          <Input
            name="RoomName"
            label="Room Name"
            value={roomData.RoomName}
            onChange={handleChange}
            required
            placeholder="Enter room name"
            className="text-sm sm:text-base"
            aria-label="Room Name"
          />

          <Input
            name="Description"
            label="Description"
            value={roomData.Description}
            onChange={handleChange}
            required
            placeholder="Enter room description"
            className="text-sm sm:text-base"
            aria-label="Description"
          />

          <Input
            name="PriceByDay"
            label="Price by Day"
            type="number"
            value={roomData.PriceByDay}
            onChange={handleChange}
            required
            placeholder="Enter price per day"
            className="text-sm sm:text-base"
            aria-label="Price by Day"
          />

          <Input
            name="PriceByNight"
            label="Price by Night"
            type="number"
            value={roomData.PriceByNight}
            onChange={handleChange}
            required
            placeholder="Enter price per night"
            className="text-sm sm:text-base"
            aria-label="Price by Night"
          />

          <Input
            name="PriceBySection"
            label="Price by Section"
            type="number"
            value={roomData.PriceBySection}
            onChange={handleChange}
            required
            placeholder="Enter price per section"
            className="text-sm sm:text-base"
            aria-label="Price by Section"
          />

          <Input
            name="RoomNumber"
            label="Room Number"
            type="text"
            value={roomData.RoomNumber}
            onChange={handleChange}
            required
            placeholder="Enter room number"
            className="text-sm sm:text-base"
            aria-label="Room Number"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={loadingHotels || isSubmitting}
            className="mt-4 text-sm sm:text-base"
          >
            {isSubmitting ? 'Creating...' : 'Create Room'}
          </Button>
        </form>

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

export default CreateRoom;