import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Property = () => {
  const [properties, setProperties] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // Fetch properties when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/hotels', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (data.success) {
          setProperties(data.data || []);
        } else {
          setError(data.message || 'Failed to load properties');
        }
      } catch (err) {
        setError(`Network error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Handle property deletion
  const handleDelete = async (hotelId) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        const response = await fetch(`http://localhost:5000/hotels/${hotelId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();
        if (response.ok) {
          setProperties(properties.filter(property => property.hotelId !== hotelId));
          setSuccessMessage('Property deleted successfully');
          setTimeout(() => setSuccessMessage(''), 3000);
          closeModal();
        } else {
          setError(data.error || 'Failed to delete property');
        }
      } catch (err) {
        setError(`Network error: ${err.message}`);
      }
    }
  };

  // Handle property update
  const handleUpdate = async (updatedProperty) => {
    try {
      const response = await fetch(`http://localhost:5000/hotels/${updatedProperty.hotelId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Name: updatedProperty.Name,
          Description: updatedProperty.Description,
          Location: updatedProperty.Location,
          Email: updatedProperty.Email,
          PhoneNumber: updatedProperty.PhoneNumber,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setProperties((prevProperties) =>
          prevProperties.map((property) =>
            property.hotelId === updatedProperty.hotelId ? { ...property, ...data.data } : property
          )
        );
        setSuccessMessage('Property updated successfully');
        setTimeout(() => {
          closeModal();
          setSuccessMessage('');
        }, 3000);
      } else {
        setError(data.error || 'Failed to update property');
      }
    } catch (err) {
      setError(`Network error: ${err.message}`);
    }
  };

  // Open/close modal functions
  const openModal = (property) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProperty(null);
  };

  // Filter properties by Name or Location with safeguards
  const filteredProperties = properties.filter((property) => {
    const name = property.Name || '';
    const location = property.Location || '';
    const query = searchQuery.toLowerCase();
    return (
      name.toLowerCase().includes(query) ||
      location.toLowerCase().includes(query)
    );
  });

  // Styles
  const styles = {
    container: {
      width: '100%',
      margin: 'auto',
      padding: '2rem',
      maxHeight: '100vh',
      boxSizing: 'border-box',
    },
    card: {
      width: '90%',
      margin: 'auto',
      marginBottom: '1rem',
      padding: '0.5rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      cursor: 'pointer',
    },
    errorMessage: { color: '#dc2626', marginTop: '1rem', textAlign: 'center' },
    loadingText: { marginTop: '1rem', textAlign: 'center', color: '#6b7280' },
    noProperties: { marginTop: '1rem', textAlign: 'center', color: '#6b7280' },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    modalContent: {
      backgroundColor: '#fff',
      padding: '1.5rem',
      borderRadius: '0.5rem',
      width: '80%',
      maxWidth: '400px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      maxHeight: '60vh',
      overflowY: 'auto',
      position: 'relative', // Ensure the close button positions relative to this
    },
    closeButton: {
      position: 'absolute',
      top: '0.5rem',
      right: '0.5rem',
      fontSize: '1.5rem',
      cursor: 'pointer',
      color: '#dc2626',
      background: 'none', // Remove any background to match the screenshot
      border: 'none', // Remove border for a cleaner look
      padding: 0, // Remove padding to fit snugly
    },
    input: {
      width: '100%',
      padding: '0.5rem',
      marginBottom: '0.5rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.25rem',
    },
    formButton: {
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '0.25rem',
      fontSize: '0.875rem',
      cursor: 'pointer',
    },
    saveButton: { backgroundColor: '#3b82f6', color: '#fff', padding: '0.5rem 1.5rem' },
    deleteButton: { backgroundColor: '#dc2626', color: '#fff', padding: '0.5rem 1rem' },
  };

  return (
    <div style={styles.container} className="mx-auto mt-6 px-4 overflow-y-auto">
      <div>
        <h2 className="text-xl font-bold text-neutral-800 mb-4">Property List</h2>

        {/* Search Bar */}
        <input
          type="text"
          name="search"
          placeholder="Search by Hotel Name or Location"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 mb-4 border border-neutral-300 rounded text-sm"
          aria-label="Search Properties"
        />

        {/* Loading State */}
        {loading && <p style={styles.loadingText}>Loading properties...</p>}

        {/* Error Message */}
        {error && <p style={styles.errorMessage}>{error}</p>}

        {/* Success Message */}
        {successMessage && (
          <p style={{ color: 'green', textAlign: 'center', marginTop: '1rem' }}>
            {successMessage}
          </p>
        )}

        {/* No Properties or Search Results */}
        {!loading && !error && filteredProperties.length === 0 && (
          <p style={styles.noProperties}>
            {searchQuery ? 'No properties match your search.' : 'No properties found.'}
          </p>
        )}

        {/* Property List */}
        {!loading && !error && filteredProperties.length > 0 && (
          <div>
            {filteredProperties.map((property) => (
              <div
                key={property.hotelId}
                style={styles.card}
                onClick={() => openModal(property)}
              >
                <p><strong>Name:</strong> {property.Name || 'N/A'}</p>
                <p><strong>Location:</strong> {property.Location || 'N/A'}</p>
              </div>
            ))}
          </div>
        )}

        {/* Modal for Update and Delete */}
        {isModalOpen && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <button
                style={styles.closeButton}
                onClick={closeModal}
                aria-label="Close Modal"
              >
                ❌
              </button>
              <h2 className="text-lg font-bold mb-4">Update Property</h2>
              {error && <p style={styles.errorMessage}>{error}</p>}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdate(selectedProperty);
                }}
              >
                <label className="block mb-2">
                  Name:
                  <input
                    style={styles.input}
                    type="text"
                    value={selectedProperty?.Name || ''}
                    onChange={(e) => setSelectedProperty({ ...selectedProperty, Name: e.target.value })}
                  />
                </label>
                <label className="block mb-2">
                  Location:
                  <input
                    style={styles.input}
                    type="text"
                    value={selectedProperty?.Location || ''}
                    onChange={(e) => setSelectedProperty({ ...selectedProperty, Location: e.target.value })}
                  />
                </label>
                <label className="block mb-2">
                  Description:
                  <input
                    style={styles.input}
                    type="text"
                    value={selectedProperty?.Description || ''}
                    onChange={(e) => setSelectedProperty({ ...selectedProperty, Description: e.target.value })}
                  />
                </label>
                <label className="block mb-2">
                  Email:
                  <input
                    style={styles.input}
                    type="email"
                    value={selectedProperty?.Email || ''}
                    onChange={(e) => setSelectedProperty({ ...selectedProperty, Email: e.target.value })}
                  />
                </label>
                <label className="block mb-2">
                  Phone Number:
                  <input
                    style={styles.input}
                    type="text"
                    value={selectedProperty?.PhoneNumber || ''}
                    onChange={(e) => setSelectedProperty({ ...selectedProperty, PhoneNumber: e.target.value })}
                  />
                </label>
                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                  <button
                    type="submit"
                    style={{ ...styles.formButton, ...styles.saveButton }}
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(selectedProperty.hotelId)}
                    style={{ ...styles.formButton, ...styles.deleteButton }}
                  >
                    Delete
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Property;