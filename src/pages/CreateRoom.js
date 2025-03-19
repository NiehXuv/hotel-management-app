import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const CreateRoom = () => {
  const [roomData, setRoomData] = useState({
    hotelId: '', // Allow user to input/select Hotel ID
    name: '',
    description: '',
    pricebyDay: '',
    pricebyNight: '',
    pricebySection: '',
    roomNumber: '',
  });

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setRoomData({ ...roomData, [e.target.name]: e.target.value });
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const { hotelId, ...roomDetails } = roomData;

    // Validate hotelId before making the request
    if (!hotelId) {
      setError('Please enter a valid Hotel ID.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/hotel/${hotelId}/room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roomDetails), // Send only room details
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Room created successfully!');
        setTimeout(() => navigate('/dashboard'), 1000); // Redirect after success
      } else {
        setError(data.error || 'Failed to create room');
      }
    } catch (err) {
      setError('Error connecting to the server: ' + err.message);
    }
  };

  return (
    <div>
      <h2>Create Room</h2>
      <form onSubmit={handleCreateRoom}>
        <Input name="hotelId" label="Hotel ID" value={roomData.hotelId} onChange={handleChange} required />
        <Input name="name" label="Room Name" value={roomData.name} onChange={handleChange} required />
        <Input name="description" label="Description" value={roomData.description} onChange={handleChange} required />
        <Input name="pricebyDay" label="Price by Day" type="number" value={roomData.pricebyDay} onChange={handleChange} required />
        <Input name="pricebyNight" label="Price by Night" type="number" value={roomData.pricebyNight} onChange={handleChange} required />
        <Input name="pricebySection" label="Price by Section" type="number" value={roomData.pricebySection} onChange={handleChange} required />
        <Input name="roomNumber" label="Room Number" type="text" value={roomData.roomNumber} onChange={handleChange} required />

        <Button type="submit" variant="primary" fullWidth>
          Create Room
        </Button>
      </form>

      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default CreateRoom;
