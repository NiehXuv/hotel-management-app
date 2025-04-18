import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/layout/BottomNavigation';
import '../styles/room-map.css';

const RoomMap = () => {
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState('');
  const [rooms, setRooms] = useState([]);
  const [floors, setFloors] = useState([]);
  const [openFloors, setOpenFloors] = useState({});
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchHotelIds();
  }, []);

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
        if (data.data.length > 0) {
          setSelectedHotel(data.data[0].id);
        }
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

  useEffect(() => {
    if (selectedHotel) {
      fetchRooms();
    }
  }, [selectedHotel]);

  const fetchRooms = async () => {
    setLoadingRooms(true);
    setError('');
    try {
      const response = await fetch(`http://localhost:5000/api/hotels/${selectedHotel}/rooms`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.success) {
        setRooms(data.data);
        const floorSet = new Set(data.data.map(room => room.Floor || 'Unknown'));
        const floorArray = Array.from(floorSet).sort((a, b) => {
          if (a === 'Unknown') return 1;
          if (b === 'Unknown') return -1;
          return parseInt(a) - parseInt(b);
        });
        setFloors(floorArray);
        const initialOpen = {};
        floorArray.forEach(floor => {
          initialOpen[floor] = true; // Open all floors by default
        });
        setOpenFloors(initialOpen);
      } else {
        setError(`Failed to load rooms: ${data.error || 'Unknown error'}`);
        setRooms([]);
        setFloors([]);
      }
    } catch (err) {
      setError(`Network error: ${err.message}`);
      console.error('Fetch rooms error:', err);
      setRooms([]);
      setFloors([]);
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleHotelChange = (e) => {
    setSelectedHotel(e.target.value);
  };

  const toggleFloor = (floor) => {
    setOpenFloors(prev => ({
      ...prev,
      [floor]: !prev[floor]
    }));
  };

  const handleRoomClick = (room) => {
    // Navigate to RoomDetail page with hotelId and roomId
    navigate(`/hotels/${selectedHotel}/rooms/${room.roomNumber}`);
  };

  const getRoomsForFloor = (floor) => {
    return rooms.filter(room => (room.Floor || 'Unknown') === floor);
  };

  return (
    <div className="room-map-container">
      <h2>Room Map</h2>
      {error && <p className="error-text">{error}</p>}

      <div className="filter-container">
        <label htmlFor="hotelFilter" className="label">Select Hotel</label>
        <select
          id="hotelFilter"
          value={selectedHotel}
          onChange={handleHotelChange}
          disabled={loadingHotels || hotels.length === 0}
          className="select"
        >
          <option value="">Select a hotel</option>
          {hotels
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((hotel) => (
              <option key={hotel.id} value={hotel.id}>
                {hotel.name.charAt(0).toUpperCase() + hotel.name.slice(1)}
              </option>
            ))}
        </select>
        {loadingHotels && <p className="loading-text">Loading hotels...</p>}
      </div>

      {loadingRooms ? (
        <p className="loading-text">Loading rooms...</p>
      ) : rooms.length === 0 ? (
        <p className="no-rooms">No rooms found for this hotel.</p>
      ) : (
        <div className="floor-sections">
          {floors.map((floor) => {
            const floorRooms = getRoomsForFloor(floor);
            return (
              <div key={floor} className="floor-section">
                <div className="floor-header" onClick={() => toggleFloor(floor)}>
                  <h3>Floor {floor}</h3>
                  <span>{openFloors[floor] ? '▲' : '▼'}</span>
                </div>
                {openFloors[floor] && (
                  <div className="room-grid">
                    {floorRooms.map((room) => (
                      <div
                        key={room.id}
                        className={`room-card ${room.Status === 'Available' ? 'available' : 'occupied'}`}
                        onClick={() => handleRoomClick(room)}
                      >
                        <span className="room-number">{room.roomNumber}</span> <span> </span> 
                        <span className="room-name">{room.RoomName || 'N/A'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default RoomMap;