import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';

const Add = () => {
  const navigate = useNavigate();

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
      color: '#FFFFFF', // White text
      padding: '0.75rem 1.5rem',
      fontSize: '1.2rem',
      fontWeight: 'bold',
      border: 'none',
      borderRadius: '25px', // Rounded edges to match the button style
      cursor: 'pointer',
      textAlign: 'center',
      margin: '0.5rem 0',
      transition: 'background-color 0.3s ease',
    },
    roomButton: {
      backgroundColor: '#42A5F5', // Blue for Room
    },
    roomButtonHover: {
      backgroundColor: '#1E88E5', // Darker blue for hover
    },
    bookingButton: {
      backgroundColor: '#66BB6A', // Green for Booking
    },
    bookingButtonHover: {
      backgroundColor: '#4CAF50', // Darker green for hover
    },
    propertyButton: {
      backgroundColor: '#FFC107', // Keep yellow for Property (matches the original)
    },
    propertyButtonHover: {
      backgroundColor: '#FFB300', // Slightly darker yellow for hover
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
      </div>
    </div>
  );
};

export default Add;