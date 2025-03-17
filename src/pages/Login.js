import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

/**
 * Login Page Component
 * Handles user authentication
 */
const Login = () => {
  // State for form data
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  
  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Navigation and auth hooks
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate form
    if (!formData.username || !formData.password) {
      setError('Username and password are required');
      return;
    }
    
    // Attempt login
    try {
      setIsSubmitting(true);
      await login(formData.username, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Demo user credentials
  const demoUsers = [
    { username: 'boss', role: 'Boss' },
    { username: 'manager', role: 'Manager' },
    { username: 'host', role: 'Host' },
    { username: 'cleaner', role: 'Cleaner' },
    { username: 'reception', role: 'Receptionist' },
    { username: 'sales', role: 'Sales' },
    { username: 'accountant', role: 'Accountant' },
  ];
  
  // Function to login as demo user
  const loginAsUser = (username) => {
    setFormData({
      username,
      password: 'password'
    });
  };
  
  return (
    <div className="h-full flex flex-col justify-center items-center p-6 bg-neutral-50">
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-color">Heart of Hoan Kiem</h1>
          <p className="text-neutral-600 mt-2">
            Hotel & HomeStay Management System
          </p>
        </div>
        
        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Log In</h2>
          
          {/* Error Message */}
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
              fullWidth
              disabled={isSubmitting}
              className="mt-6"
            >
              {isSubmitting ? 'Logging in...' : 'Log In'}
            </Button>
          </form>
        </div>
        
        {/* Demo User Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-md font-semibold mb-2">Demo Users</h3>
          <p className="text-neutral-600 text-sm mb-4">
            Password for all demo users: <strong>password</strong>
          </p>
          
          <div className="grid grid-cols-2 gap-2">
            {demoUsers.map((user) => (
              <Button
                key={user.username}
                variant="outline"
                size="sm"
                onClick={() => loginAsUser(user.username)}
              >
                {user.role}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;