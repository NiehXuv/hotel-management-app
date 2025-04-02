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
    if (!roomData.RoomNumber) errors.RoomNumber = 'Please enter a room number';

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
        setSuccessMessage(`${data.message} (Room ID: ${data.data.roomId})`);
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

  return (
    <div className="container">
      <style>
        {`
          .container {
            width: 100vw;
            max-width: 480px;
            margin: 0 auto;
            padding: 2rem;
            padding-bottom: calc(1rem + var(--footer-height));
            min-height: 100vh;
            box-sizing: border-box;
          }

          .form {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .select {
            width: 100%;
            padding: 0.5rem 0.75rem;
            border-radius: 0.375rem;
            border: 1px solid #d1d5db;
            outline: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 0.75rem center;
            background-size: 1.5em;
            appearance: none;
            font-size: 13px; /* Reduced font size for consistency */
          }

          .select:focus {
            border-color: rgba(59, 130, 246, 0.5);
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
          }

          .select:disabled {
            background-color: #f3f4f6;
            color: #6b7280;
            cursor: not-allowed;
          }

          .select-option-default {
            color: #6b7280;
            font-style: italic;
          }

          .label {
            display: block;
            margin-bottom: 0.25rem;
            font-weight: 500;
            color: #1f2937;
            font-size: 13px; /* Reduced font size for consistency */
          }

          .required-star {
            color: #dc2626;
            margin-left: 0.25rem;
          }

          .loading-text {
            margin-top: 0.25rem;
            font-size: 0.875rem;
            color: #6b7280;
          }

          .message {
            margin-top: 1rem;
            text-align: center;
          }

          .success-message {
            color: #16a34a;
          }

          .error-message {
            color: #dc2626;
          }

          .input-field {
            font-size: 13px; /* Reduced font size for consistency */
          }

          .input-field::placeholder {
            font-size: 13px;
          }

          .submit-btn {
            background-color: #28a745;
            color: white;
            padding: 10px;
            width: 100%;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 13px; /* Reduced font size for consistency */
            transition: background-color 0.2s;
          }

          .submit-btn:hover {
            background-color: #218838;
          }

          .submit-btn:disabled {
            background-color: #6c757d;
            cursor: not-allowed;
          }

          @media (max-width: 480px) {
            .input-field {
              font-size: 14px; /* Slightly larger on mobile for readability */
            }

            .input-field::placeholder {
              font-size: 14px;
            }

            .select {
              font-size: 14px;
            }
          }
        `}
      </style>

      <Card
        header={<h2 className="text-xl font-bold text-neutral-800">Create a New Room</h2>}
        className="shadow-lg rounded-lg border border-neutral-200"
        bodyClassName="p-4"
      >
        <form onSubmit={handleCreateRoom} className="form">
          <div>
            <label htmlFor="hotelId" className="label">
              Property<span className="required-star">*</span>
            </label>
            <select
              id="hotelId"
              name="hotelId"
              value={roomData.hotelId}
              onChange={handleChange}
              required
              disabled={loadingHotels}
              className="select"
            >
              <option value="" disabled className="select-option-default">Select a Property</option>
              {hotelIds.sort((a, b) => a.name.localeCompare(b.name)).map(hotel => (
                <option key={hotel.id} value={hotel.id}>
                  {hotel.name.charAt(0).toUpperCase() + hotel.name.slice(1)}
                </option>
              ))}
            </select>
            {loadingHotels && <p className="loading-text">Loading hotels...</p>}
          </div>

          <div>
            <label htmlFor="RoomType" className="label">
              Room Type<span className="required-star">*</span>
            </label>
            <select
              id="RoomType"
              name="RoomType"
              value={roomData.RoomType}
              onChange={handleChange}
              required
              disabled={loadingRoomTypes || !roomData.hotelId}
              className="select"
            >
              <option value="" disabled className="select-option-default">Select a Room Type</option>
              {roomTypes.map((rt, index) => (
                <option key={index} value={rt.type}>{rt.type}</option>
              ))}
            </select>
            {loadingRoomTypes && <p className="loading-text">Loading room types...</p>}
          </div>

          <Input
            name="RoomName"
            label="Room Name"
            value={roomData.RoomName}
            onChange={handleChange}
            required
            placeholder="Enter room name (e.g., Ocean View Single)"
            className="input-field"
            aria-label="Room Name"
          />

          <Input
            name="Description"
            label="Description"
            value={roomData.Description}
            onChange={handleChange}
            required
            placeholder="Enter room description"
            className="input-field"
            aria-label="Description"
          />

          <Input
            name="PriceByHour"
            label="Price by Hour"
            type="number"
            value={roomData.PriceByHour}
            onChange={handleChange}
            placeholder="Enter price per hour (optional)"
            className="input-field"
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
            className="input-field"
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
            className="input-field"
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
            className="input-field"
            aria-label="Room Number"
          />

          <button
            type="submit"
            disabled={loadingHotels || loadingRoomTypes || isSubmitting}
            className="submit-btn"
          >
            {isSubmitting ? 'Creating...' : 'Create Room'}
          </button>
        </form>

        {successMessage && (
          <p className="message success-message">
            {successMessage}
          </p>
        )}
        {error && (
          <p className="message error-message">
            {error}
          </p>
        )}
      </Card>
    </div>
  );
};

export default CreateRoom;