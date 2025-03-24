import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const Room = () => {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hotelName, setHotelName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const hotelResponse = await fetch(`http://localhost:5000/hotels/${hotelId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!hotelResponse.ok) throw new Error('Failed to fetch hotel');
        const hotelData = await hotelResponse.json();
        if (hotelData.success) {
          setHotelName(hotelData.data?.Name || 'Unknown Hotel');
        } else {
          setError(hotelData.error || 'Failed to load hotel name');
        }

        const roomsResponse = await fetch(`http://localhost:5000/api/hotels/${hotelId}/rooms`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!roomsResponse.ok) throw new Error('Failed to fetch rooms');
        const roomsData = await roomsResponse.json();
        if (roomsData.success) {
          setRooms(roomsData.data || []);
        } else {
          setError(roomsData.error || 'Failed to load rooms');
        }
      } catch (err) {
        setError(`Network error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [hotelId]);

  const handleUpdateRoom = async (e) => {
    e.preventDefault();
    if (selectedRoom.RoomName.trim().length < 2) {
      setError('Room Name must be at least 2 characters');
      return;
    }
    if (selectedRoom.Description.trim().length < 10) {
      setError('Description must be at least 10 characters');
      return;
    }
    if ([selectedRoom.PriceByDay, selectedRoom.PriceByNight, selectedRoom.PriceBySection].some(price => isNaN(Number(price)) || Number(price) < 0)) {
      setError('Prices must be non-negative numbers');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/hotels/${hotelId}/rooms/${selectedRoom.RoomNumber}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          RoomName: selectedRoom.RoomName.trim(),
          Description: selectedRoom.Description.trim(),
          PriceByDay: Number(selectedRoom.PriceByDay),
          PriceByNight: Number(selectedRoom.PriceByNight),
          PriceBySection: Number(selectedRoom.PriceBySection),
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setRooms(rooms.map((room) =>
          room.RoomNumber === selectedRoom.RoomNumber ? { ...room, ...data.data } : room
        ));
        setSuccessMessage('Room updated successfully');
        setTimeout(() => {
          setIsModalOpen(false);
          setSuccessMessage('');
        }, 3000);
      } else {
        setError(data.error || 'Failed to update room');
      }
    } catch (err) {
      setError(`Network error: ${err.message}`);
    }
  };

  const handleDeleteRoom = async (roomNumber) => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      setRoomToDelete(roomNumber);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/hotels/${hotelId}/rooms/${roomNumber}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (response.ok) {
        setRooms(rooms.filter((room) => room.RoomNumber !== roomNumber));
        setSuccessMessage('Room deleted successfully');
        setIsModalOpen(false);
        setShowDeleteConfirm(false);
        setRoomToDelete(null);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.error || 'Failed to delete room');
      }
    } catch (err) {
      setError(`Network error: ${err.message}`);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setRoomToDelete(null);
  };

  const handleUpdateStatus = async (roomNumber, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/hotels/${hotelId}/rooms/${roomNumber}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (response.ok) {
        setRooms(rooms.map((room) =>
          room.RoomNumber === roomNumber ? { ...room, Status: newStatus } : room
        ));
        setSuccessMessage(`Room status updated to ${newStatus}`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.error || 'Failed to update status');
      }
    } catch (err) {
      setError(`Network error: ${err.message}`);
    }
  };

  const openModal = (room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRoom(null);
    setError('');
    setShowDeleteConfirm(false);
    setRoomToDelete(null);
  };

  const filteredRooms = rooms.filter((room) => {
    const name = room.RoomName || '';
    const number = room.RoomNumber ? room.RoomNumber.toString() : '';
    const query = searchQuery.toLowerCase();
    return (
      name.toLowerCase().includes(query) ||
      number.includes(query)
    );
  });

  const styles = {
    container: { width: '100vw', maxWidth: '480px'
      , margin: 'auto', padding: '2rem', maxHeight: '100vh', boxSizing: 'border-box', overflowY: 'auto' },
    header: { display: 'flex', alignItems: 'center', marginBottom: '1.5rem', position: 'relative' },
    backArrow: { fontSize: '1.5rem', cursor: 'pointer', color: '#374151', marginRight: '1rem', background: 'none', border: 'none', padding: 0 },
    roomCard: { 
      width: '100%',
      margin: 'auto', 
      marginBottom: '1rem', 
      padding: '1rem', 
      border: '1px solid #d1d5db', 
      borderRadius: '1em', 
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      cursor: 'pointer',
      backgroundColor: 'white',
    },
    roomCardOccupied: {
      backgroundColor: '#F04770',
      color: 'white',
    },
    roomCardAvailable: {
      backgroundColor: '#ADD8E6',
      color: 'white',
    },
    loadingText: { marginTop: '1rem', textAlign: 'center', color: '#6b7280' },
    errorMessage: { color: '#dc2626', marginTop: '1rem', textAlign: 'center' },
    successMessage: { color: '#10b981', marginTop: '1rem', textAlign: 'center' },
    noRooms: { marginTop: '1rem', textAlign: 'center', color: '#6b7280' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: '#fff', padding: '1.5rem', borderRadius: '0.5rem', width: '80%', maxWidth: '500px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', maxHeight: '80vh', overflowY: 'auto', position: 'relative' },
    closeButton: { position: 'absolute', top: '0.5rem', right: '0.5rem', fontSize: '1.5rem', cursor: 'pointer', color: '#dc2626', background: 'none', border: 'none', padding: 0 },
    input: { width: '100%', padding: '0.5rem', marginBottom: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' },
    formButton: { padding: '0.5rem 1rem', border: 'none', borderRadius: '0.25rem', fontSize: '0.875rem', cursor: 'pointer', margin: '0.25rem' },
    saveButton: {
      backgroundColor: '#ADD8E6',
      color: '#fff',
      padding: '0.5rem 1.5rem',
    },
    deleteButton: { backgroundColor: '#dc2626', color: '#fff' },
    createButton: {
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
    confirmButton: { backgroundColor: '#10b981', color: '#fff' },
    cancelButton: { backgroundColor: '#6b7280', color: '#fff' },
    searchInput: { width: '100%', padding: '0.5rem', marginBottom: '1.5rem', border: '1px solid #d1d5db', borderRadius: '1rem', fontSize: '0.875rem', padding: '1em' }, 
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button
          style={styles.backArrow}
          onClick={() => navigate('/properties')}
          aria-label="Back to Property"
        >
          ←
        </button>
        <h2 className="text-xl font-bold text-neutral-800"> {hotelName} </h2>
      </div>


      <input
        type="text"
        placeholder="Search by Room Name or Number"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={styles.searchInput}
        aria-label="Search Rooms"
      />

      {loading && <p style={styles.loadingText}>Loading rooms...</p>}
      {error && <p style={styles.errorMessage}>{error}</p>}
      {successMessage && <p style={styles.successMessage}>{successMessage}</p>}
      {!loading && !error && filteredRooms.length === 0 && (
        <p style={styles.noRooms}>
          {searchQuery ? 'No rooms match your search.' : 'No rooms found for this property.'}
        </p>
      )}

      {!loading && !error && filteredRooms.length > 0 && (
        <div>
          {filteredRooms.map((room) => (
            <div 
              key={room.RoomNumber} 
              style={{
                ...styles.roomCard,
                ...(room.Status === 'Occupied' ? styles.roomCardOccupied : styles.roomCardAvailable)
              }}
              onClick={() => openModal(room)}
            >
              <p><strong>Name:</strong> {room.RoomName}</p>
              <p><strong>Status:</strong> {room.Status}</p>
            </div>
          ))}
        </div>
      )}

      
<button
        style={styles.createButton}
        onClick={() => navigate(`/hotel/createroom?hotelId=${hotelId}`)}
      >
        Create New Room
      </button>

      {isModalOpen && selectedRoom && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <button style={styles.closeButton} onClick={closeModal}>❌</button>
            <h2 className="text-lg font-bold mb-4">Room {selectedRoom.RoomNumber}</h2>
            {error && <p style={styles.errorMessage}>{error}</p>}
            {!showDeleteConfirm ? (
              <form onSubmit={handleUpdateRoom}>
                <p><strong>Room Number:</strong> {selectedRoom.RoomNumber}</p>
                <label className="block mb-2">
                  Name:
                  <input
                    style={styles.input}
                    value={selectedRoom.RoomName}
                    onChange={(e) => setSelectedRoom({ ...selectedRoom, RoomName: e.target.value })}
                  />
                </label>
                <label className="block mb-2">
                  Description:
                  <input
                    style={styles.input}
                    value={selectedRoom.Description}
                    onChange={(e) => setSelectedRoom({ ...selectedRoom, Description: e.target.value })}
                  />
                </label>
                <label className="block mb-2">
                  Price by Day:
                  <input
                    style={styles.input}
                    type="number"
                    value={selectedRoom.PriceByDay}
                    onChange={(e) => setSelectedRoom({ ...selectedRoom, PriceByDay: e.target.value })}
                    min="0"
                  />
                </label>
                <label className="block mb-2">
                  Price by Night:
                  <input
                    style={styles.input}
                    type="number"
                    value={selectedRoom.PriceByNight}
                    onChange={(e) => setSelectedRoom({ ...selectedRoom, PriceByNight: e.target.value })}
                    min="0"
                  />
                </label>
                <label className="block mb-2">
                  Price by Section:
                  <input
                    style={styles.input}
                    type="number"
                    value={selectedRoom.PriceBySection}
                    onChange={(e) => setSelectedRoom({ ...selectedRoom, PriceBySection: e.target.value })}
                    min="0"
                  />
                </label>
                <label className="block mb-2">
                  Status:
                  <select
                    value={selectedRoom.Status}
                    onChange={(e) => {
                      setSelectedRoom({ ...selectedRoom, Status: e.target.value });
                      handleUpdateStatus(selectedRoom.RoomNumber, e.target.value);
                    }}
                    style={{ ...styles.input }}
                  >
                    <option value="Available">Available</option>
                    <option value="Occupied">Occupied</option>
                  </select>
                </label>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                  <button type="submit" style={{ ...styles.formButton, ...styles.saveButton }}>Save Changes</button>
                  <button
                    type="button"
                    onClick={() => handleDeleteRoom(selectedRoom.RoomNumber)}
                    style={{ ...styles.formButton, ...styles.deleteButton }}
                  >
                    Delete
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <p style={{ marginBottom: '1rem', textAlign: 'center' }}>
                  Are you sure you want to delete Room {roomToDelete}?
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button
                    onClick={() => handleDeleteRoom(roomToDelete)}
                    style={{ ...styles.formButton, ...styles.confirmButton }}
                  >
                    Yes
                  </button>
                  <button
                    onClick={cancelDelete}
                    style={{ ...styles.formButton, ...styles.cancelButton }}
                  >
                    No
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Room;