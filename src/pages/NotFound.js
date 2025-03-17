import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';

/**
 * NotFound Page Component
 * 
 * Provides a user-friendly 404 error experience with navigation options
 * to help users recover from incorrect URL paths.
 * 
 * @module Pages/NotFound
 */
const NotFound = () => {
  // Navigation hook for programmatic routing
  const navigate = useNavigate();

  /**
   * Navigates user back to dashboard (application entry point)
   * @function handleBackToDashboard
   * @returns {void}
   */
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  /**
   * Navigates user back one step in history
   * @function handleGoBack
   * @returns {void}
   */
  const handleGoBack = () => {
    navigate(-1); // Navigate back one step in history
  };

  return (
    <div className="page-container flex flex-col items-center justify-center min-h-screen py-12 text-center px-4">
      {/* Error status code */}
      <h1 className="text-6xl font-bold text-primary-color mb-4">404</h1>
      
      {/* Error message */}
      <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
      
      {/* Explanatory text */}
      <p className="text-neutral-600 max-w-md mb-8">
        The page you are looking for might have been removed, had its name changed,
        or is temporarily unavailable.
      </p>
      
      {/* Navigation options for user recovery */}
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
        <Button
          variant="primary"
          onClick={handleBackToDashboard}
        >
          Back to Dashboard
        </Button>
        
        <Button
          variant="outline"
          onClick={handleGoBack}
        >
          Go Back
        </Button>
      </div>
    </div>
  );
};

export default NotFound;