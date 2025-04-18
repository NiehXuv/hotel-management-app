import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { database } from '../config/firebaseconfig';
import { ref, get } from 'firebase/database';

const CreateAccount = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    phoneNumber: '',
    role: '',
    hotelId: '', // Add hotelId to form data
    confirmationCode: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState(1); // 1: Form, 2: Confirmation
  const navigate = useNavigate();

  const styles = {
    pageContainer: {
      padding: '1em',
      width: '100vw',
      maxWidth: '480px',
      margin: '0 auto',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#f5f5f5',
    },
    headerContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 20px',
      backgroundColor: '#fff',
      borderBottom: '1px solid #e5e7eb',
    },
    title: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#111827',
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    userAvatar: {
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      backgroundColor: '#e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
    },
    userName: {
      fontSize: '14px',
      color: '#111827',
    },
    userRole: {
      fontSize: '12px',
      color: '#666',
    },
    formCard: {
      padding: '16px',
      backgroundColor: 'white',
      borderRadius: '1em',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      margin: '20px',
    },
    formTitle: {
      fontSize: '20px',
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: '16px',
      color: '#111827',
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
      borderRadius: '2em',
      border: '1px solid #e5e7eb',
      fontSize: '14px',
      color: '#111827',
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
    },
    select: {
      padding: '8px 12px',
      borderRadius: '2em',
      border: '1px solid #e5e7eb',
      fontSize: '14px',
      color: '#111827',
      backgroundColor: 'white',
    },
    button: {
      backgroundColor: '#FFD167',
      color: '#fff',
      padding: '10px',
      borderRadius: '2em',
      border: 'none',
      fontSize: '16px',
      cursor: 'pointer',
      marginTop: '12px',
    },
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitStep1 = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate all fields
    if (!formData.username || !formData.password || !formData.email || 
        !formData.phoneNumber || !formData.role || !formData.hotelId) {
      setError('All fields are required');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Check if username already exists
      const userRef = ref(database, `Users/${formData.username}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        throw new Error('Username already exists');
      }

      // Generate and send confirmation code
      const confirmationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      const response = await fetch('http://localhost:5000/api/send-confirmation-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email, 
          confirmationCode,
          username: formData.username
        }),
      });

      const responseText = await response.text();
      console.log('Raw response from send-confirmation-email:', responseText);

      if (!response.ok) {
        throw new Error(responseText || 'Failed to send confirmation code');
      }

      const data = JSON.parse(responseText);
      setSuccess('Confirmation code sent to your email');
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to process request');
      console.error('Error in handleSubmitStep1:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitStep2 = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.confirmationCode) {
      setError('Please enter the confirmation code');
      return;
    }

    try {
      setIsSubmitting(true);

      // Verify confirmation code
      const response = await fetch('http://localhost:5000/api/verify-confirmation-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          code: formData.confirmationCode
        })
      });

      const responseText = await response.text();
      console.log('Raw response from verify-confirmation-code:', responseText);

      if (!response.ok) {
        throw new Error(responseText || 'Invalid or expired confirmation code');
      }

      const data = JSON.parse(responseText);

      // Create the account
      const createResponse = await fetch('http://localhost:5000/api/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          role: formData.role,
          hotelId: formData.hotelId // Include hotelId in the request
        })
      });

      const createResponseText = await createResponse.text();
      console.log('Raw response from create-account:', createResponseText);

      if (!createResponse.ok) {
        let errorMessage = createResponseText;
        try {
          const errorData = JSON.parse(createResponseText);
          errorMessage = errorData.error || createResponseText;
        } catch (parseError) {
          console.error('Failed to parse create-account response:', parseError);
        }
        throw new Error(errorMessage || 'Failed to create account');
      }

      const createData = JSON.parse(createResponseText);
      setSuccess(createData.message || 'Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to verify code');
      console.error('Error in handleSubmitStep2:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.pageContainer}>
      

      <div style={styles.formCard}>
        {step === 1 ? (
          <form style={styles.form} onSubmit={handleSubmitStep1}>
            <h2 style={styles.formTitle}>Create Account</h2>
            {error && <p style={styles.errorText}>{error}</p>}
            {success && <p style={styles.successText}>{success}</p>}
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Username</label>
              <input name="username" value={formData.username} onChange={handleChange} style={styles.formInput} required />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Password</label>
              <input name="password" type="password" value={formData.password} onChange={handleChange} style={styles.formInput} required />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Email</label>
              <input name="email" type="email" value={formData.email} onChange={handleChange} style={styles.formInput} required />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Phone Number</label>
              <input name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleChange} style={styles.formInput} required />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Role</label>
              <select name="role" value={formData.role} onChange={handleChange} style={styles.select} required>
                <option value="">Select Role</option>
                
                <option value="sales">Sales</option>
                <option value="receptionist">Receptionist</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Hotel ID</label>
              <input
                name="hotelId"
                value={formData.hotelId}
                onChange={handleChange}
                style={styles.formInput}
                placeholder="Enter Hotel ID"
                required
              />
            </div>
            <button type="submit" style={styles.button} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Create Account'}
            </button>
          </form>
        ) : (
          <form style={styles.form} onSubmit={handleSubmitStep2}>
            <h2 style={styles.formTitle}>Create Account</h2>
            {error && <p style={styles.errorText}>{error}</p>}
            {success && <p style={styles.successText}>{success}</p>}
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Confirmation Code</label>
              <input
                name="confirmationCode"
                value={formData.confirmationCode}
                onChange={handleChange}
                style={styles.formInput}
                placeholder="Enter the code sent to your email"
                required
              />
            </div>
            <button type="submit" style={styles.button} disabled={isSubmitting}>
              {isSubmitting ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateAccount;