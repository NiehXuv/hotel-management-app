import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { ref, get } from 'firebase/database';
import { database } from '../config/firebaseconfig';
import bcrypt from 'bcryptjs';
import { rolePermissions } from '../contexts/AuthContext';

/**
 * Login Page Component
 * Handles user authentication with Firebase
 */
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

  // Handle Forgot Password Submission
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

      // Call backend API to send the email
      const response = await fetch('http://localhost:5000/api/send-reset-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resetEmail, resetCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send reset email');
      }

      setResetSuccess('A reset code has been sent to your email.');
      
       setTimeout(() => {
      navigate('/reset-password', { state: { email: resetEmail, username: data.username } });
    }, 1000);
    
    } catch (err) {
      console.error('Forgot Password Error:', err);
      setResetError(err.message || 'Failed to send reset email. Please try again or contact support.');
    }
  };

  return (
    <div className="h-full flex flex-col justify-center items-center p-6 bg-neutral-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-color">Heart of Hoan Kiem</h1>
          <p className="text-neutral-600 mt-2">
            Hotel & HomeStay Management System
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Log In</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-error-color/10 border border-error-color/30 rounded text-error-color text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <Input
              id="username"
              name="username"
              label="Username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
            />
            
            <Input
              id="password"
              name="password"
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
            
            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              disabled={isSubmitting}
              className="mt-6"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                'Log In'
              )}
            </Button>
          </form>

          {/* Forgot Password Link */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-primary-color hover:underline text-sm"
            >
              Forgot Password?
            </button>
          </div>
        </div>

        {/* Forgot Password Popup */}
        {showForgotPassword && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-10 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Reset Password</h3>
              
              {resetError && (
                <div className="mb-4 p-3 bg-error-color/10 border border-error-color/30 rounded text-error-color text-sm">
                  {resetError}
                </div>
              )}
              
              {resetSuccess ? (
                <div className="mb-4 p-3 bg-success-color/10 border border-success-color/30 rounded text-success-color text-sm">
                  {resetSuccess}
                </div>
              ) : (
                <form onSubmit={handleForgotPasswordSubmit}>
                  <Input
                    id="reset-email"
                    name="reset-email"
                    label="Email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                  
                  <div className="flex justify-end gap-3 mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowForgotPassword(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
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
    </div>
  );
};

export default Login;