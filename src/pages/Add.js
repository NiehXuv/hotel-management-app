import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';

const Add = () => {
  const navigate = useNavigate();

  // Handle dropdown selection and navigate to the chosen path
  const handleSelectChange = (event) => {
    const path = event.target.value;
    if (path) {
      navigate(path);
    }
  };

  // Styles remain largely the same, with adjustments for the dropdown
  const styles = {
    container: {
      width: '480px',
      margin: 'auto',
      padding: '3rem',
      paddingBottom: 'calc(1rem + var(--footer-height))',
      minHeight: '100vh',
      boxSizing: 'border-box',
    },
  };

  return (
    <div style={styles.container}>
      <Card
        header={<h2 className="text-xl sm:text-2xl font-bold text-neutral-800">Add New</h2>}
        className="shadow-lg rounded-lg border border-neutral-200"
        bodyClassName="p-4 sm:p-6"
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <label htmlFor="action-select" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
            Choose an action:
          </label>
          <select
            id="action-select"
            onChange={handleSelectChange}
            defaultValue=""
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '0.5rem',
              fontSize: '1rem',
              borderRadius: '4px',
              border: '1px solid #ccc',
              backgroundColor: '#fff',
              cursor: 'pointer',
            }}
          >
            <option value="" disabled>
              Select an action
            </option>
            <option value="/hotel/createroom">Create Room</option>
            <option value="/booking/create">Create Booking</option>
          </select>
        </div>
      </Card>
    </div>
  );
};

export default Add;