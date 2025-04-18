import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BottomNav from '../components/layout/BottomNavigation';
import '../styles/room-detail.css';

const RoomDetail = () => {
  const { hotelId, roomId } = useParams();
  const navigate = useNavigate();
  const [roomData, setRoomData] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [newActivity, setNewActivity] = useState({
    Action: '',
    Details: '',
    User: '',
  });
  const [newIssue, setNewIssue] = useState({
    Description: '',
    Status: 'PENDING',
  });
  const [editData, setEditData] = useState({
    RoomType: '',
    RoomName: '',
    Description: '',
    PriceByHour: '',
    PriceByNight: '',
    PriceBySection: '',
    RoomNumber: '',
    Floor: '',
    Status: '',
  });

  // Fetch hotel IDs on mount
  useEffect(() => {
    const fetchHotelIds = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/hotels/ids', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
          setHotels(data.data);
        } else {
          setError(`Failed to load hotels: ${data.error || 'Unknown error'}`);
        }
      } catch (err) {
        setError(`Network error: ${err.message}`);
        console.error('Fetch hotels error:', err);
      }
    };
    fetchHotelIds();
  }, []);

  // Fetch room types when hotelId is available
  useEffect(() => {
    if (!hotelId) return;

    const fetchRoomTypes = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/hotel/${hotelId}/roomTypes`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
          setRoomTypes(data.data);
        } else {
          setError(`Failed to load room types: ${data.error || 'Unknown error'}`);
        }
      } catch (err) {
        setError(`Network error: ${err.message}`);
        console.error('Fetch room types error:', err);
      }
    };
    fetchRoomTypes();
  }, [hotelId]);

  // Fetch room details on mount
  useEffect(() => {
    if (!hotelId || !roomId) return;

    const fetchRoomDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`http://localhost:5000/api/hotels/${hotelId}/rooms/${roomId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, response: ${text}`);
        }
        const data = await response.json();
        if (data.success) {
          console.log('Fetched room data:', data.data); // Debug log
          setRoomData(data.data);
          setEditData({
            RoomType: data.data.roomType || '',
            RoomName: data.data.roomName || '',
            Description: data.data.description || '',
            PriceByHour: data.data.priceByHour || '',
            PriceByNight: data.data.priceByNight || '',
            PriceBySection: data.data.priceBySection || '',
            RoomNumber: data.data.roomNumber || '',
            Floor: data.data.floor || '',
            Status: data.data.status || 'Available',
          });
        } else {
          setError(`Failed to load room details: ${data.error || 'Unknown error'}`);
        }
      } catch (err) {
        setError(`Network error: ${err.message}`);
        console.error('Fetch room details error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoomDetails();
  }, [hotelId, roomId]);

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleActivityChange = (e) => {
    setNewActivity({ ...newActivity, [e.target.name]: e.target.value });
    setError(''); // Clear error on change
  };

  const handleIssueChange = (e) => {
    setNewIssue({ ...newIssue, [e.target.name]: e.target.value });
    setError(''); // Clear error on change
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    // Use HTML5 form validation
    const form = e.target;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // Additional client-side validation
    if (!newActivity.Action.trim() || !newActivity.Details.trim() || !newActivity.User.trim()) {
      setError('Please fill in all activity fields.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/hotels/${hotelId}/rooms/${roomId}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: newActivity.Action, // Match backend field name
          details: newActivity.Details,
          user: newActivity.User,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, response: ${text}`);
      }

      const data = await response.json();
      if (data.success) {
        // Refresh room details
        const updatedResponse = await fetch(`http://localhost:5000/api/hotels/${hotelId}/rooms/${roomId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!updatedResponse.ok) {
          const text = await updatedResponse.text();
          throw new Error(`HTTP error! status: ${updatedResponse.status}, response: ${text}`);
        }
        const updatedData = await updatedResponse.json();
        if (updatedData.success) {
          setRoomData(updatedData.data);
          setNewActivity({ Action: '', Details: '', User: '' });
          setShowActivityForm(false);
          setError(''); // Clear error on success
        } else {
          setError('Failed to refresh room details after adding activity');
        }
      } else {
        setError(data.error || 'Failed to add activity');
      }
    } catch (err) {
      setError(`Failed to add activity: ${err.message}`);
      console.error('Add activity error:', err);
    }
  };

  const handleAddIssue = async (e) => {
    e.preventDefault();
    // Use HTML5 form validation
    const form = e.target;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // Additional client-side validation
    if (!newIssue.Description.trim()) {
      setError('Please provide a description for the issue.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/hotels/${hotelId}/rooms/${roomId}/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Description: newIssue.Description,
          Status: newIssue.Status,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, response: ${text}`);
      }

      const data = await response.json();
      if (data.success) {
        // Refresh room details
        const updatedResponse = await fetch(`http://localhost:5000/api/hotels/${hotelId}/rooms/${roomId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!updatedResponse.ok) {
          const text = await updatedResponse.text();
          throw new Error(`HTTP error! status: ${updatedResponse.status}, response: ${text}`);
        }
        const updatedData = await updatedResponse.json();
        if (updatedData.success) {
          setRoomData(updatedData.data);
          setNewIssue({ Description: '', Status: 'PENDING' });
          setShowIssueForm(false);
          setError(''); // Clear error on success
        } else {
          setError('Failed to refresh room details after adding issue');
        }
      } else {
        setError(data.error || 'Failed to add issue');
      }
    } catch (err) {
      setError(`Failed to add issue: ${err.message}`);
      console.error('Add issue error:', err);
    }
  };

  const handleRemoveActivity = async (activityId) => {
    try {
      const response = await fetch(`http://localhost:5000/hotels/${hotelId}/rooms/${roomId}/activities/${activityId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, response: ${text}`);
      }

      const data = await response.json();
      if (data.success) {
        // Refresh room details
        const updatedResponse = await fetch(`http://localhost:5000/api/hotels/${hotelId}/rooms/${roomId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!updatedResponse.ok) {
          const text = await updatedResponse.text();
          throw new Error(`HTTP error! status: ${updatedResponse.status}, response: ${text}`);
        }
        const updatedData = await updatedResponse.json();
        if (updatedData.success) {
          setRoomData(updatedData.data);
          setError(''); // Clear error on success
        } else {
          setError('Failed to refresh room details after removing activity');
        }
      } else {
        setError(data.error || 'Failed to remove activity');
      }
    } catch (err) {
      setError(`Failed to remove activity: ${err.message}`);
      console.error('Remove activity error:', err);
    }
  };

  const handleRemoveIssue = async (issueId) => {
    try {
      const response = await fetch(`http://localhost:5000/hotels/${hotelId}/rooms/${roomId}/issues/${issueId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, response: ${text}`);
      }

      const data = await response.json();
      if (data.success) {
        // Refresh room details
        const updatedResponse = await fetch(`http://localhost:5000/api/hotels/${hotelId}/rooms/${roomId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!updatedResponse.ok) {
          const text = await updatedResponse.text();
          throw new Error(`HTTP error! status: ${updatedResponse.status}, response: ${text}`);
        }
        const updatedData = await updatedResponse.json();
        if (updatedData.success) {
          setRoomData(updatedData.data);
          setError(''); // Clear error on success
        } else {
          setError('Failed to refresh room details after removing issue');
        }
      } else {
        setError(data.error || 'Failed to remove issue');
      }
    } catch (err) {
      setError(`Failed to remove issue: ${err.message}`);
      console.error('Remove issue error:', err);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`http://localhost:5000/api/rooms/${hotelId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          RoomType: editData.RoomType,
          RoomName: editData.RoomName,
          Description: editData.Description,
          PriceByHour: editData.PriceByHour || 0,
          PriceByNight: editData.PriceByNight || 0,
          PriceBySection: editData.PriceBySection || 0,
          RoomNumber: editData.RoomNumber,
          Floor: editData.Floor,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, response: ${text}`);
      }

      const data = await response.json();

      if (data.success) {
        // Refresh room details after update
        const updatedResponse = await fetch(`http://localhost:5000/api/hotels/${hotelId}/rooms/${roomId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!updatedResponse.ok) {
          const text = await updatedResponse.text();
          throw new Error(`HTTP error! status: ${updatedResponse.status}, response: ${text}`);
        }
        const updatedData = await updatedResponse.json();
        if (updatedData.success) {
          setRoomData(updatedData.data);
          setIsEditing(false);
          setError('');
        } else {
          setError('Failed to refresh room details after update');
        }
      } else {
        setError(data.error || 'Failed to update room');
      }
    } catch (err) {
      setError(err.message.includes('Network')
        ? 'Unable to connect to the server. Please check your internet connection.'
        : `An unexpected error occurred: ${err.message}`);
      console.error('Submission error:', err);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  if (loading) {
    return <div className="room-detail-container"><p className="loading-text">Loading...</p></div>;
  }

  if (error) {
    return <div className="room-detail-container"><p className="error-text">{error}</p></div>;
  }

  if (!roomData) {
    return <div className="room-detail-container"><p className="no-room">Room not found.</p></div>;
  }

  const hotel = hotels.find(h => h.id === hotelId) || {};

  return (
    <div className="room-detail-container">
      <div className="room-header">
        <h2>{roomData.roomName || 'Room Details'}</h2>
      </div>

      <div className="room-image">
        <img src="https://i0.wp.com/thesefourwallsblog.com/wp-content/uploads/2021/02/Zones-example.jpg?w=2000&ssl=1" alt="Room" />
      </div>

      <div className="card">
      <div className="room-info">
        <div className="room-info-header">
          <div>
            <h3>{roomData.roomName}</h3>
            <p className="location">Floor {roomData.floor || 'Unknown Location'}</p>
          </div>
          <div className="price">
            ${roomData.priceByNight || 0} /night
          </div>
        </div>
        <div className="room-stats">
          <div className="stat-item">
            <span className="icon">★</span>
            <span>4.5</span>
          </div>
          <div className="stat-item">
            <span className="icon">🛏️</span>
            <span>1</span>
          </div>
          <div className="stat-item">
            <span className="icon">🛁</span>
            <span>2</span>
          </div>
          <div className="stat-item">
            <span className="icon">📏</span>
            <span>1200 sqft</span>
          </div>
        </div>
      </div>
      </div>

      <div className="card">
      <div className="room-description">
        <h4>Description</h4>
        <p>{roomData.description || 'No description available.'}</p>
      </div>
      </div>
      <div className="room-counters">
        <div className="card">
          <div className="counter-item">
            <h4>Activities ({roomData.activityCounter || 0})</h4>
            <button className="add-button" onClick={() => setShowActivityForm(true)}>Add Activity</button>
            {showActivityForm && (
              <form onSubmit={handleAddActivity} className="counter-form">
                <div className="form-group">
                  <label>Action</label>
                  <input
                    type="text"
                    name="Action"
                    value={newActivity.Action}
                    onChange={handleActivityChange}
                    required
                    placeholder="Enter action (e.g., Checked In)"
                  />
                </div>
                <div className="form-group">
                  <label>Details</label>
                  <input
                    type="text"
                    name="Details"
                    value={newActivity.Details}
                    onChange={handleActivityChange}
                    required
                    placeholder="Enter details"
                  />
                </div>
                <div className="form-group">
                  <label>User</label>
                  <input
                    type="text"
                    name="User"
                    value={newActivity.User}
                    onChange={handleActivityChange}
                    required
                    placeholder="Enter user"
                  />
                </div>
                <div className="form-buttons">
                  <button type="submit" className="save-button">Add</button>
                  <button type="button" className="cancel-button" onClick={() => setShowActivityForm(false)}>Cancel</button>
                </div>
              </form>
            )}
            <div className="counter-list">
              {roomData.activities && roomData.activities.length > 0 ? (
                roomData.activities.map((activity) => (
                  activity ? (
                    <div key={activity.ActivityId} className="counter-entry">
                      <div>
                        <p><strong>Action:</strong> {activity.Action || 'N/A'}</p>
                        <p><strong>Details:</strong> {activity.Details || 'N/A'}</p>
                        <p><strong>User:</strong> {activity.User || 'N/A'}</p>
                        <p><strong>Timestamp:</strong> {activity.Timestamp ? new Date(activity.Timestamp).toLocaleString() : 'N/A'}</p>
                      </div>
                      <button className="remove-button" onClick={() => handleRemoveActivity(activity.ActivityId)}>Remove</button>
                    </div>
                  ) : null
                ))
              ) : (
                <p>No activities available.</p>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="counter-item">
            <h4>Issues ({roomData.issueCounter || 0})</h4>
            <button className="add-button" onClick={() => setShowIssueForm(true)}>Add Issue</button>
            {showIssueForm && (
              <form onSubmit={handleAddIssue} className="counter-form">
                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    name="Description"
                    value={newIssue.Description}
                    onChange={handleIssueChange}
                    required
                    placeholder="Enter issue description"
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="Status"
                    value={newIssue.Status}
                    onChange={handleIssueChange}
                    required
                  >
                    <option value="PENDING">Pending</option>
                    <option value="RESOLVED">Resolved</option>
                  </select>
                </div>
                <div className="form-buttons">
                  <button type="submit" className="save-button">Add</button>
                  <button type="button" className="cancel-button" onClick={() => setShowIssueForm(false)}>Cancel</button>
                </div>
              </form>
            )}
            <div className="counter-list">
              {roomData.issues && roomData.issues.length > 0 ? (
                roomData.issues.map((issue) => (
                  issue ? (
                    <div key={issue.IssueId} className="counter-entry">
                      <div>
                        <p><strong>Description:</strong> {issue.Description || 'N/A'}</p>
                        <p><strong>Status:</strong> {issue.Status || 'N/A'}</p>
                        <p><strong>Reported At:</strong> {issue.ReportedAt ? new Date(issue.ReportedAt).toLocaleString() : 'N/A'}</p>
                      </div>
                      <button className="remove-button" onClick={() => handleRemoveIssue(issue.IssueId)}>Remove</button>
                    </div>
                  ) : null
                ))
              ) : (
                <p>No issues available.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <button className="edit-button" onClick={handleEditToggle}>
        {isEditing ? 'Cancel' : 'Edit Room'}
      </button>

      {isEditing && (
        <div className="card2">
        <form onSubmit={handleEditSubmit} className="edit-form">
          <div className="form-group">
            <label>Room Name</label>
            <input
              type="text"
              name="RoomName"
              value={editData.RoomName}
              onChange={handleEditChange}
              required
              placeholder="Enter room name"
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="Description"
              value={editData.Description}
              onChange={handleEditChange}
              required
              placeholder="Enter room description"
            />
          </div>
          <div className="form-group">
            <label>Room Type</label>
            <select
              name="RoomType"
              value={editData.RoomType}
              onChange={handleEditChange}
              required
            >
              <option value="">Select Room Type</option>
              {roomTypes.map((rt, index) => (
                <option key={index} value={rt.type}>{rt.type}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Price by Hour</label>
            <input
              type="number"
              name="PriceByHour"
              value={editData.PriceByHour}
              onChange={handleEditChange}
              placeholder="Enter price per hour"
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label>Price by Night</label>
            <input
              type="number"
              name="PriceByNight"
              value={editData.PriceByNight}
              onChange={handleEditChange}
              placeholder="Enter price per night"
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label>Price by Section</label>
            <input
              type="number"
              name="PriceBySection"
              value={editData.PriceBySection}
              onChange={handleEditChange}
              placeholder="Enter price per section"
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label>Room Number</label>
            <input
              type="text"
              name="RoomNumber"
              value={editData.RoomNumber}
              onChange={handleEditChange}
              required
              placeholder="Enter room number"
            />
          </div>
          <div className="form-group">
            <label>Floor</label>
            <input
              type="text"
              name="Floor"
              value={editData.Floor}
              onChange={handleEditChange}
              required
              placeholder="Enter floor number"
            />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              name="Status"
              value={editData.Status}
              onChange={handleEditChange}
              required
            >
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
            </select>
          </div>
          <button type="submit" className="save-button2">Save Changes</button>
        </form>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default RoomDetail;