import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';

const CreateRoom = () => {
  const [roomData, setRoomData] = useState({
    hotelId: '',
    RoomType: '',
    RoomName: '',
    Description: '',
    PriceByHour: '',
    PriceByNight: '',
    PriceBySection: '',
    RoomNumber: '',
  });
  const [hotelIds, setHotelIds] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [loadingRoomTypes, setLoadingRoomTypes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // Fetch hotel IDs on mount
  useEffect(() => {
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

  // Fetch room types when hotelId changes
  useEffect(() => {
    if (!roomData.hotelId) {
      setRoomTypes([]);
      return;
    }

    const fetchRoomTypes = async () => {
      setLoadingRoomTypes(true);
      setError('');
      try {
        const response = await fetch(`http://localhost:5000/api/hotel/${roomData.hotelId}/roomTypes`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();
        if (data.success) {
          setRoomTypes(data.data);
        } else {
          setError(`Failed to load room types: ${data.error || 'Unknown error'}`);
        }
      } catch (err) {
        setError(`Network error: ${err.message}`);
        console.error('Fetch error:', err);
      } finally {
        setLoadingRoomTypes(false);
      }
    };
    fetchRoomTypes();
  }, [roomData.hotelId]);

  const handleChange = (e) => {
    setRoomData({ ...roomData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const errors = {};
    if (!roomData.hotelId) errors.hotelId = 'Please select a property';
    if (!roomData.RoomType) errors.RoomType = 'Please select a room type';
    if (!roomData.RoomName || roomData.RoomName.length < 2) errors.RoomName = 'Room name must be at least 2 characters';
    if (roomData.Description.length < 10) errors.Description = 'Description must be at least 10 characters';
    if (!roomData.RoomNumber) errors.RoomNumber = 'Please enter a room number'; // Relaxed numeric-only restriction

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
      const { hotelId, RoomType, RoomName, Description, PriceByHour, PriceByNight, PriceBySection, RoomNumber } = roomData;

      const matchedRoomType = roomTypes.find(rt => rt.type === RoomType) || {};

      const response = await fetch(`http://localhost:5000/api/rooms/${hotelId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          RoomType,
          RoomName,
          Description,
          PriceByHour: PriceByHour || matchedRoomType.priceByHour || 0,
          PriceByNight: PriceByNight || matchedRoomType.priceByNight || 0,
          PriceBySection: PriceBySection || matchedRoomType.priceBySection || 0,
          RoomNumber,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMessage(`${data.message} (Room ID: ${data.data.roomId})`); // Include roomId in success message
        setRoomData({
          hotelId: '',
          RoomType: '',
          RoomName: '',
          Description: '',
          PriceByHour: '',
          PriceByNight: '',
          PriceBySection: '',
          RoomNumber: '',
        });
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        setError(data.error || 'Failed to create room');
      }
    } catch (err) {
      setError(err.message.includes('Network') 
        ? 'Unable to connect to the server. Please check your internet connection.'
        : 'An unexpected error occurred. Please try again.');
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = {
    container: { width: '400px', margin: '0 auto', padding: '1rem', minHeight: '100vh', boxSizing: 'border-box' },
    select: {
      width: '100%',
      padding: '0.5rem 0.75rem',
      borderRadius: '0.375rem',
      border: '1px solid #d1d5db',
      outline: 'none',
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 0.75rem center',
      backgroundSize: '1.5em',
      appearance: 'none',
    },
    selectFocus: { borderColor: 'rgba(59, 130, 246, 0.5)', boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.3)' },
    selectDisabled: { backgroundColor: '#f3f4f6', color: '#6b7280', cursor: 'not-allowed' },
    selectOptionDefault: { color: '#6b7280', fontStyle: 'italic' },
    label: { display: 'block', marginBottom: '0.25rem', fontWeight: '500', color: '#1f2937' },
    requiredStar: { color: '#dc2626', marginLeft: '0.25rem' },
    loadingText: { marginTop: '0.25rem', fontSize: '0.875rem', color: '#6b7280' },
    message: { marginTop: '1rem', textAlign: 'center' },
    successMessage: { color: '#16a34a' },
    errorMessage: { color: '#dc2626' },
  };

  return (
    <div style={styles.container} className="sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto mt-6 sm:mt-10 px-4 sm:px-6 overflow-y-auto">
      <Card
        header={<h2 className="text-xl sm:text-2xl font-bold text-neutral-800">Create a New Room</h2>}
        className="shadow-lg rounded-lg border border-neutral-200"
        bodyClassName="p-4 sm:p-6"
      >
        <form onSubmit={handleCreateRoom} className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="hotelId" style={styles.label}>
              Property<span style={styles.requiredStar}>*</span>
            </label>
            <select
              id="hotelId"
              name="hotelId"
              value={roomData.hotelId}
              onChange={handleChange}
              required
              disabled={loadingHotels}
              style={{ ...styles.select, ...(loadingHotels ? styles.selectDisabled : {}) }}
              onFocus={(e) => { e.target.style.borderColor = styles.selectFocus.borderColor; e.target.style.boxShadow = styles.selectFocus.boxShadow; }}
              onBlur={(e) => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none'; }}
              className="w-full text-sm sm:text-base"
            >
              <option value="" disabled style={styles.selectOptionDefault}>Select a Property</option>
              {hotelIds.sort((a, b) => a.name.localeCompare(b.name)).map(hotel => (
                <option key={hotel.id} value={hotel.id}>
                  {hotel.name.charAt(0).toUpperCase() + hotel.name.slice(1)}
                </option>
              ))}
            </select>
            {loadingHotels && <p style={styles.loadingText}>Loading hotels...</p>}
          </div>

          <div>
            <label htmlFor="RoomType" style={styles.label}>
              Room Type<span style={styles.requiredStar}>*</span>
            </label>
            <select
              id="RoomType"
              name="RoomType"
              value={roomData.RoomType}
              onChange={handleChange}
              required
              disabled={loadingRoomTypes || !roomData.hotelId}
              style={{ ...styles.select, ...(loadingRoomTypes || !roomData.hotelId ? styles.selectDisabled : {}) }}
              onFocus={(e) => { e.target.style.borderColor = styles.selectFocus.borderColor; e.target.style.boxShadow = styles.selectFocus.boxShadow; }}
              onBlur={(e) => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none'; }}
              className="w-full text-sm sm:text-base"
            >
              <option value="" disabled style={styles.selectOptionDefault}>Select a Room Type</option>
              {roomTypes.map((rt, index) => (
                <option key={index} value={rt.type}>{rt.type}</option>
              ))}
            </select>
            {loadingRoomTypes && <p style={styles.loadingText}>Loading room types...</p>}
          </div>

          <Input
            name="RoomName"
            label="Room Name"
            value={roomData.RoomName}
            onChange={handleChange}
            required
            placeholder="Enter room name (e.g., Ocean View Single)"
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
            name="PriceByHour"
            label="Price by Hour"
            type="number"
            value={roomData.PriceByHour}
            onChange={handleChange}
            placeholder="Enter price per hour (optional)"
            className="text-sm sm:text-base"
            aria-label="Price by Hour"
            step="0.01"
          />

          <Input
            name="PriceByNight"
            label="Price by Night"
            type="number"
            value={roomData.PriceByNight}
            onChange={handleChange}
            placeholder="Enter price per night (optional)"
            className="text-sm sm:text-base"
            aria-label="Price by Night"
            step="0.01"
          />

          <Input
            name="PriceBySection"
            label="Price by Section"
            type="number"
            value={roomData.PriceBySection}
            onChange={handleChange}
            placeholder="Enter price per section (optional)"
            className="text-sm sm:text-base"
            aria-label="Price by Section"
            step="0.01"
          />

          <Input
            name="RoomNumber"
            label="Room Number"
            type="text"
            value={roomData.RoomNumber}
            onChange={handleChange}
            required
            placeholder="Enter room number (e.g., 101 or A101)"
            className="text-sm sm:text-base"
            aria-label="Room Number"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={loadingHotels || loadingRoomTypes || isSubmitting}
            className="mt-4 text-sm sm:text-base"
          >
            {isSubmitting ? 'Creating...' : 'Create Room'}
          </Button>
        </form>

        {successMessage && (
          <p style={{ ...styles.message, ...styles.successMessage }} className="text-sm sm:text-base">
            {successMessage}
          </p>
        )}
        {error && (
          <p style={{ ...styles.message, ...styles.errorMessage }} className="text-sm sm:text-base">
            {error}
          </p>
        )}
      </Card>
    </div>
  );
};

export default CreateRoom;