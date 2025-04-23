import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { FaComment, FaTrash } from 'react-icons/fa'; // Added FaTrash for the clear button
import BottomNav from '../components/layout/BottomNavigation';
import '../styles/add.css'; // Import your CSS file for styles

const Add = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [category, setCategory] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(false);

  // Categories based on your database structure
  const categories = [
    'Booking',
    'Counters',
    'Customer',
    'Hotel',
    'Notifications',
    'Payment',
    'Staff',
    'Users'
  ];

  // Generate or retrieve userId from localStorage
  useEffect(() => {
    let storedUserId = localStorage.getItem('chatUserId');
    if (!storedUserId) {
      storedUserId = uuidv4();
      localStorage.setItem('chatUserId', storedUserId);
    }
    setUserId(storedUserId);
  }, []);

  // Fetch chat messages from the backend
  useEffect(() => {
    if (!userId || !showChat) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/chat/messages/${userId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, response: ${text}`);
        }

        const data = await response.json();
        if (data.success) {
          setChatMessages(data.messages.sort((a, b) => new Date(a.createTime) - new Date(b.createTime)));
        } else {
          setError(data.error || 'Failed to fetch chat messages');
        }
      } catch (err) {
        setError(`Failed to fetch chat messages: ${err.message}`);
        console.error('Fetch messages error:', err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [userId, showChat]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      setError('Please enter a message to send.');
      return;
    }

    if (!category) {
      setError('Please select a category to query.');
      return;
    }

    if (!userId) {
      setError('User ID not available.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          message: newMessage,
          category,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, response: ${text}`);
      }

      const data = await response.json();
      if (data.success) {
        setNewMessage('');
        setError('');
      } else {
        setError(data.error || 'Failed to send message');
      }
    } catch (err) {
      setError(`Failed to send message: ${err.message}`);
      console.error('Send message error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (!userId || !category) {
      setError('User ID or category not available.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/chat/clear/${userId}/${category}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, response: ${text}`);
      }

      const data = await response.json();
      if (data.success) {
        setChatMessages([]); // Clear the local chat messages
        setError('');
      } else {
        setError(data.error || 'Failed to clear chat messages');
      }
    } catch (err) {
      setError(`Failed to clear chat messages: ${err.message}`);
      console.error('Clear chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle button clicks and navigate to the chosen path
  const handleButtonClick = (path) => {
    if (path) {
      navigate(path);
    }
  };

  // Styles for the container and buttons
  const styles = {
    container: {
      width: '100vw',
      maxWidth: '480px',
      margin: 'auto',
      padding: '2rem',
      paddingBottom: 'calc(1rem + var(--footer-height))',
      minHeight: '100vh',
      boxSizing: 'border-box',
    },
    buttonBase: {
      color: '#FFFFFF',
      padding: '0.75rem 1.5rem',
      fontSize: '1.2rem',
      fontWeight: 'bold',
      border: 'none',
      borderRadius: '25px',
      cursor: 'pointer',
      textAlign: 'center',
      margin: '0.5rem 0',
      transition: 'background-color 0.3s ease',
    },
    roomButton: {
      backgroundColor: '#42A5F5',
    },
    roomButtonHover: {
      backgroundColor: '#1E88E5',
    },
    bookingButton: {
      backgroundColor: '#66BB6A',
    },
    bookingButtonHover: {
      backgroundColor: '#4CAF50',
    },
    propertyButton: {
      backgroundColor: '#FFC107',
    },
    propertyButtonHover: {
      backgroundColor: '#FFB300',
    },
  };

  return (
    <div style={styles.container}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
        <div style={{ fontSize: '1.6rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          What Do You Want To Add?
        </div>
        <button
          style={{ ...styles.buttonBase, ...styles.roomButton }}
          onClick={() => handleButtonClick('/hotel/createroom')}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = styles.roomButtonHover.backgroundColor)}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = styles.roomButton.backgroundColor)}
        >
          Room
        </button>
        <button
          style={{ ...styles.buttonBase, ...styles.bookingButton }}
          onClick={() => handleButtonClick('/booking/create')}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = styles.bookingButtonHover.backgroundColor)}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = styles.bookingButton.backgroundColor)}
        >
          Booking
        </button>
        <button
          style={{ ...styles.buttonBase, ...styles.propertyButton }}
          onClick={() => handleButtonClick('/hotel/create')}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = styles.propertyButtonHover.backgroundColor)}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = styles.propertyButton.backgroundColor)}
        >
          Property
        </button>

        {/* Chatbot Section */}
        <div className="card">
          <div className="chatbot-section">
            <h4>Ask the Hotel Assistant</h4>
            <div className="category-selector">
              <label>Select a category to query:</label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setChatMessages([]); // Clear chat when category changes
                  setShowChat(false);
                }}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            {category && (
              <>
                <div className="chat-buttons">
                  <button
                    className="toggle-chat-button"
                    onClick={() => setShowChat(!showChat)}
                  >
                    <FaComment /> {showChat ? 'Hide Chat' : 'Show Chat'}
                  </button>
                  {showChat && (
                    <button
                      className="clear-chat-button"
                      onClick={handleClearChat}
                      disabled={loading}
                    >
                      <FaTrash /> Clear Chat
                    </button>
                  )}
                </div>
                {showChat && (
                  <div className="chat-container">
                    <div className="chat-messages">
                      {chatMessages
                        .filter((msg) => msg.category === category)
                        .map((msg) => (
                          <div key={msg.id} className="chat-message">
                            <div className="user-message">
                              <strong>You:</strong> {msg.prompt}
                            </div>
                            {msg.response && (
                              <div className="bot-message">
                                <strong>Assistant:</strong> {msg.response}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                    <div className="chat-input">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Ask the hotel assistant..."
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        disabled={loading}
                      />
                      <button onClick={handleSendMessage} disabled={loading}>
                        {loading ? 'Sending...' : 'Send'}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
            {error && <p className="error-text">{error}</p>}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Add;