import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import { ref, get } from 'firebase/database';
import { database } from '../config/firebaseconfig';
import bcrypt from 'bcryptjs';
import { rolePermissions } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();

  const styles = {
    pageContainer: {
      paddingBottom: '2em',
      padding: '1em',
      width: '100vw',
      maxWidth: '480px',
      margin: '0 auto',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    },
    headerContainer: {
      textAlign: 'center',
      marginBottom: '16px',
    },
    title: {
      fontSize: '20px',
      fontWeight: '700',
      color: '#111827',
    },
    subtitle: {
      fontSize: '14px',
      color: '#666',
      marginTop: '4px',
    },
    formCard: {
      marginBottom: '16px',
      padding: '16px',
      backgroundColor: 'white',
      borderRadius: '2em',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
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
    errorText: {
      color: '#dc2626',
      fontSize: '14px',
      textAlign: 'center',
      padding: '8px 0',
    },
    forgotLink: {
      fontSize: '16px',
      color: 'black',
      textAlign: 'center',
      cursor: 'pointer',
      marginTop: '4px',
    },
    createAccountLink: {
      fontSize: '16px',
      color: 'black',
      textAlign: 'center',
      cursor: 'pointer',
      marginTop: '4px',
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
    successText: {
      color: '#10B981',
      fontSize: '14px',
      textAlign: 'center',
      padding: '8px 0',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderRadius: '1em',
      marginBottom: '12px',
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px',
      marginTop: '12px',
    },
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.username || !formData.password) {
      setError('Username and password are required');
      return;
    }
  
    try {
      setIsSubmitting(true);
      const usersRef = ref(database, 'Users');
      const snapshot = await get(usersRef);
  
      if (!snapshot.exists()) {
        throw new Error('No users found');
      }
  
      let foundUser = null;
      let userId = null;
      const users = snapshot.val();
      
      for (const key in users) {
        if (users[key].username === formData.username) {
          foundUser = users[key];
          userId = key;
          break;
        }
      }
  
      if (!foundUser) {
        throw new Error('User not found');
      }
  
      const passwordMatch = await bcrypt.compare(formData.password, foundUser.password);
      
      if (!passwordMatch) {
        throw new Error('Invalid password');
      }
  
      const userRole = foundUser.role || 'receptionist';
      const userRoleLower = userRole.toLowerCase();
  
      const userWithPermissions = {
        id: userId,
        username: formData.username,
        password: formData.password,
        name: foundUser.username,
        role: userRole,
        avatar: getAvatarForRole(userRoleLower),
        permissions: {
          ...rolePermissions[userRoleLower] || rolePermissions['receptionist']
        }
      };
  
      await login(formData.username, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAvatarForRole = (role) => {
    const roleMap = {
      boss: '👨‍💼',
      manager: '👩‍💼',
      host: '🧑‍💼',
      cleaner: '🧹',
      receptionist: '💁‍♀️',
      sales: '📊',
      accountant: '🧮'
    };
    return roleMap[role] || '👤';
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    try {
      const usersRef = ref(database, 'Users');
      const snapshot = await get(usersRef);

      if (!snapshot.exists()) {
        throw new Error('No users found');
      }

      let foundUser = null;
      const users = snapshot.val();
      
      for (const key in users) {
        if (users[key].email === resetEmail) {
          foundUser = users[key];
          break;
        }
      }

      if (!foundUser) {
        throw new Error('Invalid email');
      }

      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

      const response = await fetch('http://localhost:5000/api/send-reset-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, resetCode }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send reset email');
      }

      const data = await response.json();
      setResetSuccess('A reset code has been sent to your email.');
      
      setTimeout(() => {
        navigate('/reset-password', { state: { email: resetEmail, username: data.username } });
      }, 1000);
    
    } catch (err) {
      console.error('Forgot Password Error:', err);
      setResetError(err.message || 'Failed to send reset email. Please try again or contact support.');
    }
  };

  const handleCreateAccount = () => {
    navigate('/create-account');
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.headerContainer}>
        <h1 style={styles.title}>INSPEREST BOOKING</h1>
        <p style={styles.subtitle}>Hotel & HomeStay Management System</p>
      </div>

      <div style={styles.formCard}>
        <form style={styles.form} onSubmit={handleSubmit}>
          {error && <p style={styles.errorText}>{error}</p>}
          
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Username</label>
            <input
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              style={styles.formInput}
              placeholder="Enter your username"
              required
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Password</label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              style={styles.formInput}
              placeholder="Enter your password"
              required
            />
          </div>
          
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            style={{
              margin: '0.4em auto',
              width: '12em',
              display: 'block',
              padding: '0.3em 0.8em',
              backgroundColor: '#FFD167',
              color: '#fff',
              border: 'none',
              borderRadius: '2em',
              fontSize: '1em',
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            {isSubmitting ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg style={{ height: '20px', width: '10em', marginRight: '8px', animation: 'spin 1s linear infinite' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </span>
            ) : (
              'Log In'
            )}
          </Button>
          
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            style={styles.forgotLink}
            onMouseEnter={(e) => (e.target.style.color = '#black')}
            onMouseLeave={(e) => (e.target.style.color = '#black')}
          >
            Forgot Password?
          </button>

          <button
            type="button"
            onClick={() => handleCreateAccount(true)}
            style={styles.forgotLink}
            onMouseEnter={(e) => (e.target.style.color = '#black')}
            onMouseLeave={(e) => (e.target.style.color = '#black')}
          >
            Don't have an account? 
          </button>
        </form>
      </div>

      {showForgotPassword && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <button style={styles.modalCloseButton} onClick={() => setShowForgotPassword(false)} aria-label="Close">
              ×
            </button>
            <h3 style={styles.modalHeader}>Reset Password</h3>
            
            {resetError && <p style={styles.errorText}>{resetError}</p>}
            {resetSuccess && <p style={styles.successText}>{resetSuccess}</p>}
            
            {!resetSuccess && (
              <form style={styles.form} onSubmit={handleForgotPasswordSubmit}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Email</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    style={styles.formInput}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                
                <div style={styles.buttonContainer}>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForgotPassword(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    style={{ backgroundColor: '#FFD167', color: '#fff' }}
                  >
                    Send Reset Code
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;