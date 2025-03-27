import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

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

  const styles = {
    pageContainer: {
      paddingBottom: '2em',
      padding: '1em',
      width: '100vw',
      maxWidth: '480px',
      marginBottom: '4em',
    },
    headerTitle: {
      fontSize: '20px',
      fontWeight: '700',
      marginBottom: '12px',
      textAlign: 'center',
    },
    searchContainer: {
      marginBottom: '16px',
      position: 'relative',
    },
    searchInput: {
      padding: '8px 12px',
      borderRadius: '1em',
      border: '1px solid #e5e7eb',
      fontSize: '14px',
      width: '100%',
      color: '#111827',
    },
    suggestions: {
      position: 'absolute',
      top: '100%',
      left: 0,
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '1em',
      zIndex: 10,
      width: '100%',
      maxHeight: '200px',
      overflowY: 'auto',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
    suggestionItem: {
      padding: '8px 12px',
      cursor: 'pointer',
      color: '#111827',
      fontSize: '14px',
    },
    customerCard: {
      marginBottom: '16px',
      padding: '16px',
      backgroundColor: 'white',
      borderRadius: '2em',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
    infoRow: {
      marginBottom: '8px',
      display: 'flex',
      justifyContent: 'space-between',
    },
    label: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#666',
    },
    value: {
      fontSize: '14px',
      color: '#111827',
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px',
      marginTop: '12px',
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '48px 0',
    },
    loadingText: {
      color: '#666',
      fontSize: '14px',
    },
    errorText: {
      color: '#dc2626',
      fontSize: '14px',
      textAlign: 'center',
      padding: '8px 0',
    },
    successText: {
      color: '#10B981',
      fontSize: '14px',
      textAlign: 'center',
      padding: '8px 0',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderRadius: '1em',
      marginBottom: '16px',
    },
    noDataText: {
      fontSize: '14px',
      color: '#999',
      textAlign: 'center',
      padding: '8px 0',
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
      backgroundColor: 'white',
      padding: '16px',
      borderRadius: '2em',
      width: '90%',
      maxWidth: '400px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      position: 'relative',
    },
    modalHeader: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '12px',
      color: '#111827',
    },
    modalCloseButton: {
      position: 'absolute',
      top: '8px',
      right: '8px',
      background: 'none',
      border: 'none',
      fontSize: '20px',
      cursor: 'pointer',
      color: '#666',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    },
    formLabel: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#666',
    },
    formInput: {
      padding: '8px 12px',
      borderRadius: '1em',
      border: '1px solid #e5e7eb',
      fontSize: '14px',
      color: '#111827',
    },
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('http://localhost:5000/customer/list', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
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

  const filteredCustomers = customers.filter((customer) => {
    const fullName = `${customer.FirstName || ''} ${customer.LastName || ''}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const showErrorMessage = (message) => {
    setError(message);
    setTimeout(() => setError(''), 5000);
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (!formData.FirstName || formData.FirstName.trim() === '') {
      showErrorMessage('FirstName is required and must be a non-empty string');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/customer/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  const handleRemoveCustomer = async (customerId) => {
    if (!window.confirm(`Are you sure you want to delete customer ${customerId}?`)) return;
    try {
      const response = await fetch(`http://localhost:5000/customer/delete/${customerId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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
        headers: { 'Content-Type': 'application/json' },
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

  const openCreateModal = () => {
    setFormData({ FirstName: '', LastName: '', Email: '', PhoneNumber: '', Note: '' });
    setIsCreateModalOpen(true);
  };

  const closeModal = () => {
    setIsCreateModalOpen(false);
    setIsUpdateModalOpen(false);
    setSelectedCustomer(null);
    setFormData({ FirstName: '', LastName: '', Email: '', PhoneNumber: '', Note: '' });
  };

  return (
    <div style={styles.pageContainer}>
      <h2 style={styles.headerTitle}>Customer List</h2>

      {/* Search Bar */}
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
                onMouseEnter={(e) => (e.target.style.backgroundColor = '#f3f4f6')}
                onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
              >
                {customer.FirstName} {customer.LastName}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Success/Error Messages */}
      {successMessage && <p style={styles.successText}>{successMessage}</p>}
      {error && <p style={styles.errorText}>{error}</p>}

      {/* Customer List */}
      {loading ? (
        <div style={styles.loadingContainer}>
          <p style={styles.loadingText}>Loading customers...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <p style={styles.noDataText}>
          {searchQuery ? 'No matching customers' : 'No customers found.'}
        </p>
      ) : (
        filteredCustomers.map((customer) => (
          <Card key={customer.id} style={styles.customerCard}>
            <div>
              <div style={styles.infoRow}>
                <span style={styles.label}>First Name:</span>
                <span style={styles.value}>{customer.FirstName || '-'}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.label}>Last Name:</span>
                <span style={styles.value}>{customer.LastName || '-'}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.label}>Email:</span>
                <span style={styles.value}>{customer.Email || '-'}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.label}>Phone Number:</span>
                <span style={styles.value}>{customer.PhoneNumber || '-'}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.label}>Note:</span>
                <span style={styles.value}>{customer.Note || '-'}</span>
              </div>
            </div>
            <div style={styles.buttonContainer}>
              <Button
                variant="text"
                onClick={() => handleUpdateCustomer(customer)}
              >
                Update
              </Button>
              <Button
                variant="text"
                onClick={() => handleRemoveCustomer(customer.id)}
                style={{ color: '#dc2626' }}
              >
                Delete
              </Button>
            </div>
          </Card>
        ))
      )}

      {/* Create New Customer Button */}
      <Button
        variant="primary"
        onClick={openCreateModal}
        style={{ display: 'block', margin: '0 auto 16px', backgroundColor: '#FFD167', color: '#fff', padding: '0.2em 0.8em', borderRadius: '2em' }}
      >
        Create New Customer
      </Button>

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
              <Button type="submit" variant="primary" style={{ backgroundColor: '#FFD167', color: '#fff' }}>
                Create Customer
              </Button>
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
              <Button type="submit" variant="primary" style={{ backgroundColor: '#FFD167', color: '#fff' }}>
                Save Changes
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;