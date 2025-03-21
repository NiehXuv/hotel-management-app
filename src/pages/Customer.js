import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({
    FirstName: '',
    LastName: '',
    Email: '',
    PhoneNumber: '',
    Note: '',
  });
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();

  // Fetch customers from the API
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('http://localhost:5000/customer/list', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        if (response.ok) {
          const customerArray = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          setCustomers(customerArray);
        } else {
          setError(data.error || 'Failed to load customers');
          setCustomers([]);
        }
      } catch (err) {
        setError(`Network error: ${err.message}`);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  // Filter customers based on search query
  const filteredCustomers = customers.filter((customer) => {
    const fullName = `${customer.FirstName || ''} ${customer.LastName || ''}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query);
  });

  // Show success message and auto-hide after 3 seconds
  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Show error message and auto-hide after 5 seconds
  const showErrorMessage = (message) => {
    setError(message);
    setTimeout(() => setError(''), 5000);
  };

  // Handle customer creation
  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (!formData.FirstName || formData.FirstName.trim() === '') {
      showErrorMessage('FirstName is required and must be a non-empty string');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/customer/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        setCustomers([...customers, { id: data.customerId, ...formData }]);
        setIsCreateModalOpen(false);
        setFormData({ FirstName: '', LastName: '', Email: '', PhoneNumber: '', Note: '' });
        showSuccessMessage('Create Successful');
      } else {
        showErrorMessage(data.error || 'Failed to create customer');
      }
    } catch (err) {
      showErrorMessage(`Network error: ${err.message}`);
    }
  };

  // Handle customer removal
  const handleRemoveCustomer = async (customerId) => {
    if (!window.confirm(`Are you sure you want to delete customer ${customerId}?`)) return;
    try {
      const response = await fetch(`http://localhost:5000/customer/delete/${customerId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (response.ok) {
        setCustomers(customers.filter((customer) => customer.id !== customerId));
        showSuccessMessage('Delete Successful');
      } else {
        showErrorMessage(data.error || 'Failed to delete customer');
      }
    } catch (err) {
      showErrorMessage(`Network error: ${err.message}`);
    }
  };

  // Open the update modal with the customer's current data
  const handleUpdateCustomer = (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      FirstName: customer.FirstName || '',
      LastName: customer.LastName || '',
      Email: customer.Email || '',
      PhoneNumber: customer.PhoneNumber || '',
      Note: customer.Note || '',
    });
    setIsUpdateModalOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission to update the customer
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.FirstName || formData.FirstName.trim() === '') {
      showErrorMessage('FirstName is required and must be a non-empty string');
      return;
    }
    if (!selectedCustomer) return;
    try {
      const response = await fetch(`http://localhost:5000/customer/update/${selectedCustomer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        setCustomers(
          customers.map((customer) =>
            customer.id === selectedCustomer.id ? { ...customer, ...formData } : customer
          )
        );
        setIsUpdateModalOpen(false);
        setSelectedCustomer(null);
        setFormData({ FirstName: '', LastName: '', Email: '', PhoneNumber: '', Note: '' });
        showSuccessMessage('Update Successful');
      } else {
        showErrorMessage(data.error || 'Failed to update customer');
      }
    } catch (err) {
      showErrorMessage(`Network error: ${err.message}`);
    }
  };

  // Open the create modal
  const openCreateModal = () => {
    setFormData({ FirstName: '', LastName: '', Email: '', PhoneNumber: '', Note: '' });
    setIsCreateModalOpen(true);
  };

  // Close the modals and reset form data
  const closeModal = () => {
    setIsCreateModalOpen(false);
    setIsUpdateModalOpen(false);
    setSelectedCustomer(null);
    setFormData({ FirstName: '', LastName: '', Email: '', PhoneNumber: '', Note: '' });
  };

  const styles = {
    container: {
      width: '100vw',
      maxWidth: '500px',
      margin: 'auto',
      padding: '1rem',
      paddingBottom: 'calc(1rem + var(--footer-height))',
      minHeight: '100vh',
      boxSizing: 'border-box',
    },
    title: {
      textAlign: 'center',
    },
    searchContainer: {
      width: '80%',
      margin: 'auto',
      position: 'relative',
      marginBottom: '2rem',
    },
    searchInput: {
      padding: '0.5rem',
      width: '100%',
      border: '1px solid #e5e7eb',
      borderRadius: '0.25rem',
      fontSize: '0.875rem',
    },
    suggestions: {
      position: 'absolute',
      top: '100%',
      left: 0,
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '0.25rem',
      zIndex: 10,
      width: '100%',
      maxHeight: '200px',
      overflowY: 'auto',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    },
    suggestionItem: {
      padding: '0.5rem',
      cursor: 'pointer',
      color: '#374151',
    },
    suggestionItemHover: {
      backgroundColor: '#f3f4f6',
    },
    createButton: {
      display: 'block',
      margin: '0 auto 1rem',
      padding: '0.5rem 1rem',
      backgroundColor: '#3b82f6',
      color: '#fff',
      border: 'none',
      borderRadius: '0.25rem',
      fontSize: '0.875rem',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
    },
    createButtonHover: {
      backgroundColor: '#2563eb',
    },
    customerCard: {
      width: '80%',
      margin: 'auto',
      marginBottom: '1rem',
      borderRadius: '0.5rem',
      border: '1px solid #e5e7eb',
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    },
    customerInfo: {
      padding: '1rem',
      fontSize: '0.875rem',
      color: '#374151',
    },
    infoRow: {
      marginBottom: '0.25rem',
    },
    label: {
      fontWeight: '500',
      color: '#1f2937',
    },
    value: {
      color: '#374151',
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      borderTop: '1px solid #e5e7eb',
    },
    updateButton: {
      color: '#3b82f6',
      background: 'none',
      border: 'none',
      padding: '0.25rem 0.5rem',
      fontSize: '0.875rem',
      cursor: 'pointer',
      transition: 'color 0.3s ease',
    },
    deleteButton: {
      color: '#ef4444',
      background: 'none',
      border: 'none',
      padding: '0.25rem 0.5rem',
      fontSize: '0.875rem',
      cursor: 'pointer',
      transition: 'color 0.3s ease',
    },
    loadingText: {
      marginTop: '1rem',
      fontSize: '0.875rem',
      color: '#6b7280',
      textAlign: 'center',
    },
    successMessage: {
      marginTop: '1rem',
      textAlign: 'center',
      color: '#10b981',
      fontSize: '0.875rem',
      padding: '0.5rem',
      backgroundColor: '#ecfdf5',
      borderRadius: '0.25rem',
    },
    errorMessage: {
      marginTop: '1rem',
      textAlign: 'center',
      color: '#dc2626',
      fontSize: '0.875rem',
      padding: '0.5rem',
      backgroundColor: '#fef2f2',
      borderRadius: '0.25rem',
    },
    noData: {
      marginTop: '1rem',
      textAlign: 'center',
      color: '#6b7280',
    },
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
      width: '90%',
      maxWidth: '400px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      position: 'relative',
    },
    modalHeader: {
      fontSize: '1.25rem',
      fontWeight: '600',
      marginBottom: '1rem',
      color: '#1f2937',
    },
    modalCloseButton: {
      position: 'absolute',
      top: '0.5rem',
      right: '0.5rem',
      background: 'none',
      border: 'none',
      fontSize: '1.25rem',
      cursor: 'pointer',
      color: '#6b7280',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem',
    },
    formLabel: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#1f2937',
    },
    formInput: {
      padding: '0.5rem',
      border: '1px solid #e5e7eb',
      borderRadius: '0.25rem',
      fontSize: '0.875rem',
      color: '#374151',
    },
    formButton: {
      padding: '0.5rem 1rem',
      backgroundColor: '#3b82f6',
      color: '#fff',
      border: 'none',
      borderRadius: '0.25rem',
      fontSize: '0.875rem',
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.container} className="sm:max-w-md mx-auto mt-6 px-4 overflow-y-auto">
      <h2 style={styles.title} className="text-xl font-bold text-neutral-800 mb-4">
        Customer List
      </h2>

      {/* Search Bar with Recommendations */}
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search by name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
        {searchQuery && (
          <div style={styles.suggestions}>
            {filteredCustomers.slice(0, 5).map((customer) => (
              <div
                key={customer.id}
                style={styles.suggestionItem}
                onClick={() => setSearchQuery(`${customer.FirstName} ${customer.LastName}`)}
                onMouseEnter={(e) => (e.target.style.backgroundColor = styles.suggestionItemHover.backgroundColor)}
                onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
              >
                {customer.FirstName} {customer.LastName}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Customer List */}
      {loading ? (
        <p style={styles.loadingText}>Loading customers...</p>
      ) : filteredCustomers.length === 0 ? (
        <p style={styles.noData} className="text-sm">
          {searchQuery ? 'No matching customers' : 'No customers found.'}
        </p>
      ) : (
        filteredCustomers.map((customer) => (
          <Card key={customer.id} style={styles.customerCard} className="rounded-lg">
            <div style={styles.customerInfo}>
              <div style={styles.infoRow}>
                <span style={styles.label}>First Name: </span>
                <span style={styles.value}>{customer.FirstName || '-'}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.label}>Last Name: </span>
                <span style={styles.value}>{customer.LastName || '-'}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.label}>Email: </span>
                <span style={styles.value}>{customer.Email || '-'}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.label}>Phone Number: </span>
                <span style={styles.value}>{customer.PhoneNumber || '-'}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.label}>Note: </span>
                <span style={styles.value}>{customer.Note || '-'}</span>
              </div>
            </div>
            <div style={styles.buttonContainer}>
              <button
                style={styles.updateButton}
                onClick={() => handleUpdateCustomer(customer)}
                onMouseEnter={(e) => (e.target.style.color = '#2563eb')}
                onMouseLeave={(e) => (e.target.style.color = '#3b82f6')}
              >
                Update
              </button>
              <button
                style={styles.deleteButton}
                onClick={() => handleRemoveCustomer(customer.id)}
                onMouseEnter={(e) => (e.target.style.color = '#dc2626')}
                onMouseLeave={(e) => (e.target.style.color = '#ef4444')}
              >
                Delete
              </button>
            </div>
          </Card>
        ))
      )}

      {/* Create New Customer Button */}
      <button
        style={styles.createButton}
        onClick={openCreateModal}
        onMouseEnter={(e) => (e.target.style.backgroundColor = styles.createButtonHover.backgroundColor)}
        onMouseLeave={(e) => (e.target.style.backgroundColor = styles.createButton.backgroundColor)}
      >
        Create New Customer
      </button>

      {/* Success Message */}
      {successMessage && <p style={styles.successMessage}>{successMessage}</p>}

      {/* Error Message */}
      {error && <p style={styles.errorMessage}>{error}</p>}

      {/* Create Customer Modal */}
      {isCreateModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <button style={styles.modalCloseButton} onClick={closeModal} aria-label="Close">
              ×
            </button>
            <h3 style={styles.modalHeader}>Create New Customer</h3>
            <form style={styles.form} onSubmit={handleCreateCustomer}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>First Name</label>
                <input
                  type="text"
                  name="FirstName"
                  value={formData.FirstName}
                  onChange={handleInputChange}
                  style={styles.formInput}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Last Name</label>
                <input
                  type="text"
                  name="LastName"
                  value={formData.LastName}
                  onChange={handleInputChange}
                  style={styles.formInput}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Email</label>
                <input
                  type="email"
                  name="Email"
                  value={formData.Email}
                  onChange={handleInputChange}
                  style={styles.formInput}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Phone Number</label>
                <input
                  type="text"
                  name="PhoneNumber"
                  value={formData.PhoneNumber}
                  onChange={handleInputChange}
                  style={styles.formInput}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Note</label>
                <input
                  type="text"
                  name="Note"
                  value={formData.Note}
                  onChange={handleInputChange}
                  style={styles.formInput}
                />
              </div>
              <button type="submit" style={styles.formButton}>
                Create Customer
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Update Customer Modal */}
      {isUpdateModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <button style={styles.modalCloseButton} onClick={closeModal} aria-label="Close">
              ×
            </button>
            <h3 style={styles.modalHeader}>Update Customer</h3>
            <form style={styles.form} onSubmit={handleUpdateSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>First Name</label>
                <input
                  type="text"
                  name="FirstName"
                  value={formData.FirstName}
                  onChange={handleInputChange}
                  style={styles.formInput}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Last Name</label>
                <input
                  type="text"
                  name="LastName"
                  value={formData.LastName}
                  onChange={handleInputChange}
                  style={styles.formInput}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Email</label>
                <input
                  type="email"
                  name="Email"
                  value={formData.Email}
                  onChange={handleInputChange}
                  style={styles.formInput}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Phone Number</label>
                <input
                  type="text"
                  name="PhoneNumber"
                  value={formData.PhoneNumber}
                  onChange={handleInputChange}
                  style={styles.formInput}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Note</label>
                <input
                  type="text"
                  name="Note"
                  value={formData.Note}
                  onChange={handleInputChange}
                  style={styles.formInput}
                />
              </div>
              <button type="submit" style={styles.formButton}>
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;