import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

/**
 * Profile Page Component
 * 
 * Provides user profile management interface with personal information editing,
 * password management, notification preferences, and activity history.
 * 
 * @module Pages/Profile
 */
const Profile = () => {
  // Navigation and authentication hooks
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  
  // Active section state management with controlled enumeration
  const sections = {
    PERSONAL_INFO: 'personalInfo',
    CHANGE_PASSWORD: 'changePassword',
    NOTIFICATION_PREFERENCES: 'notificationPreferences',
    ACTIVITY_HISTORY: 'activityHistory'
  };
  
  // Component state declarations
  const [activeSection, setActiveSection] = useState(sections.PERSONAL_INFO);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  
  // Form state initialization with user data
  const [userInfo, setUserInfo] = useState({
    id: currentUser?.id || '',
    name: currentUser?.name || '',
    username: currentUser?.username || '',
    email: currentUser?.email || 'user@example.com',
    phone: currentUser?.phone || '(555) 123-4567',
    role: currentUser?.role || 'staff',
    jobTitle: currentUser?.jobTitle || 'Employee',
    department: currentUser?.department || 'Operations',
    avatar: currentUser?.avatar || '👤',
    language: 'en',
    theme: 'light'
  });
  
  // Password change form state
  const [passwordInfo, setPasswordInfo] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Password form validation state
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Notification preferences state
  const [notificationPreferences, setNotificationPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    taskAssignments: true,
    systemUpdates: true,
    newsletterAndPromotions: false
  });
  
  // Mock activity history data
  const activityHistory = [
    { id: 1, action: 'login', details: 'Logged in from 192.168.1.1', timestamp: '2025-03-02T09:15:00' },
    { id: 2, action: 'task-complete', details: 'Completed task: Clean room 304', timestamp: '2025-03-01T14:30:00' },
    { id: 3, action: 'task-assigned', details: 'Assigned new task: Restock toiletries', timestamp: '2025-03-01T11:45:00' },
    { id: 4, action: 'profile-update', details: 'Updated profile information', timestamp: '2025-02-28T16:20:00' },
    { id: 5, action: 'login', details: 'Logged in from 192.168.1.1', timestamp: '2025-02-28T08:05:00' }
  ];
  
  /**
   * Handles section tab changes
   * @param {string} section - Section identifier
   */
  const handleSectionChange = (section) => {
    setActiveSection(section);
    
    // Reset editing state when changing sections
    if (section !== sections.PERSONAL_INFO) {
      setIsEditing(false);
    }
    
    // Reset success/error messages
    setSaveSuccess(false);
    setSaveError(null);
  };
  
  /**
   * Toggles profile editing mode
   */
  const toggleEditMode = () => {
    setIsEditing(prevState => !prevState);
    setSaveSuccess(false);
    setSaveError(null);
  };
  
  /**
   * Updates user info form state
   * @param {Event} e - Input change event
   */
  const handleUserInfoChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prevInfo => ({
      ...prevInfo,
      [name]: value
    }));
  };
  
  /**
   * Updates password form state
   * @param {Event} e - Input change event
   */
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordInfo(prevInfo => ({
      ...prevInfo,
      [name]: value
    }));
    
    // Clear error when user types
    if (passwordErrors[name]) {
      setPasswordErrors(prevErrors => ({
        ...prevErrors,
        [name]: ''
      }));
    }
  };
  
  /**
   * Updates notification preference
   * @param {string} preference - Preference identifier
   */
  const handleNotificationToggle = (preference) => {
    setNotificationPreferences(prevPrefs => ({
      ...prevPrefs,
      [preference]: !prevPrefs[preference]
    }));
  };
  
  /**
   * Validates password form and returns validation state
   * @returns {boolean} Validation result
   */
  const validatePasswordForm = () => {
    const errors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    let isValid = true;
    
    // Current password validation
    if (!passwordInfo.currentPassword) {
      errors.currentPassword = 'Current password is required';
      isValid = false;
    }
    
    // New password validation
    if (!passwordInfo.newPassword) {
      errors.newPassword = 'New password is required';
      isValid = false;
    } else if (passwordInfo.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
      isValid = false;
    }
    
    // Confirm password validation
    if (!passwordInfo.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
      isValid = false;
    } else if (passwordInfo.confirmPassword !== passwordInfo.newPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    setPasswordErrors(errors);
    return isValid;
  };
  
  /**
   * Handles profile information save with optimistic updates
   * @param {Event} e - Form submission event
   */
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaveSuccess(false);
    setSaveError(null);
    setIsSaving(true);
    
    try {
      // Simulate API call with network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, we would make an API call to update the user profile
      console.log('Saving user info:', userInfo);
      
      // Simulating successful save
      setSaveSuccess(true);
      setIsEditing(false);
      
      // Automatically clear success message after delay
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveError('Failed to save profile information. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  /**
   * Handles password change submission with validation
   * @param {Event} e - Form submission event
   */
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSaveSuccess(false);
    setSaveError(null);
    
    // Validate password form
    if (!validatePasswordForm()) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock password validation - in a real app, this would be handled by an API
      if (passwordInfo.currentPassword !== 'password') {
        throw new Error('Current password is incorrect');
      }
      
      // Simulating successful password change
      console.log('Password changed successfully');
      setSaveSuccess(true);
      
      // Reset form
      setPasswordInfo({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Automatically clear success message after delay
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error changing password:', error);
      setSaveError(error.message || 'Failed to change password. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  /**
   * Handles save notification preferences
   */
  const handleSaveNotifications = async () => {
    setSaveSuccess(false);
    setSaveError(null);
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, we would make an API call to update notification preferences
      console.log('Saving notification preferences:', notificationPreferences);
      
      // Simulating successful save
      setSaveSuccess(true);
      
      // Automatically clear success message after delay
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      setSaveError('Failed to save notification preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  /**
   * Handles user logout with confirmation
   */
  const handleLogout = () => {
    // In a real app, you might want to show a confirmation dialog
    logout();
    navigate('/login');
  };
  
  /**
   * Formats relative time for activity history
   * @param {string} timestamp - ISO timestamp string
   * @returns {string} Formatted relative time
   */
  const formatRelativeTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 0) {
      return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    }
    if (diffHour > 0) {
      return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    }
    if (diffMin > 0) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    }
    return 'Just now';
  };
  
  /**
   * Renders the appropriate icon for activity history entries
   * @param {string} action - Activity action type
   * @returns {string} Emoji icon
   */
  const getActivityIcon = (action) => {
    switch (action) {
      case 'login':
        return '🔐';
      case 'task-complete':
        return '✅';
      case 'task-assigned':
        return '📋';
      case 'profile-update':
        return '👤';
      default:
        return '📝';
    }
  };
  
  /**
   * Renders personal information section with toggle between view/edit modes
   * @returns {JSX.Element} Personal info section
   */
  const renderPersonalInfoSection = () => {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Personal Information</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleEditMode}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>
        
        {isEditing ? (
          <form onSubmit={handleSaveProfile}>
            <div className="space-y-4">
              <Input
                id="name"
                name="name"
                label="Full Name"
                value={userInfo.name}
                onChange={handleUserInfoChange}
                required
              />
              
              <Input
                id="email"
                name="email"
                label="Email"
                type="email"
                value={userInfo.email}
                onChange={handleUserInfoChange}
                required
              />
              
              <Input
                id="phone"
                name="phone"
                label="Phone Number"
                value={userInfo.phone}
                onChange={handleUserInfoChange}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium text-neutral-800">
                    Job Title
                  </label>
                  <input
                    type="text"
                    id="jobTitle"
                    name="jobTitle"
                    value={userInfo.jobTitle}
                    onChange={handleUserInfoChange}
                    className="w-full px-3 py-2 rounded-md border border-neutral-300 outline-none transition-colors focus:ring-2 focus:ring-primary-color/30 focus:border-primary-color"
                  />
                </div>
                
                <div>
                  <label className="block mb-1 font-medium text-neutral-800">
                    Department
                  </label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={userInfo.department}
                    onChange={handleUserInfoChange}
                    className="w-full px-3 py-2 rounded-md border border-neutral-300 outline-none transition-colors focus:ring-2 focus:ring-primary-color/30 focus:border-primary-color"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium text-neutral-800">
                    Language
                  </label>
                  <select
                    id="language"
                    name="language"
                    value={userInfo.language}
                    onChange={handleUserInfoChange}
                    className="w-full px-3 py-2 rounded-md border border-neutral-300 outline-none transition-colors focus:ring-2 focus:ring-primary-color/30 focus:border-primary-color"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="zh">Chinese</option>
                    <option value="ja">Japanese</option>
                  </select>
                </div>
                
                <div>
                  <label className="block mb-1 font-medium text-neutral-800">
                    Theme
                  </label>
                  <select
                    id="theme"
                    name="theme"
                    value={userInfo.theme}
                    onChange={handleUserInfoChange}
                    className="w-full px-3 py-2 rounded-md border border-neutral-300 outline-none transition-colors focus:ring-2 focus:ring-primary-color/30 focus:border-primary-color"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System Default</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-full bg-primary-color flex items-center justify-center text-white text-3xl mr-4">
                {userInfo.avatar}
              </div>
              <div>
                <h3 className="text-xl font-semibold">{userInfo.name}</h3>
                <p className="text-neutral-600 capitalize">{userInfo.role}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm text-neutral-500">Email</p>
                <p className="font-medium">{userInfo.email}</p>
              </div>
              
              <div>
                <p className="text-sm text-neutral-500">Phone</p>
                <p className="font-medium">{userInfo.phone}</p>
              </div>
              
              <div>
                <p className="text-sm text-neutral-500">Job Title</p>
                <p className="font-medium">{userInfo.jobTitle}</p>
              </div>
              
              <div>
                <p className="text-sm text-neutral-500">Department</p>
                <p className="font-medium">{userInfo.department}</p>
              </div>
              
              <div>
                <p className="text-sm text-neutral-500">Username</p>
                <p className="font-medium">{userInfo.username}</p>
              </div>
              
              <div>
                <p className="text-sm text-neutral-500">Language</p>
                <p className="font-medium">
                  {userInfo.language === 'en' ? 'English' :
                   userInfo.language === 'es' ? 'Spanish' :
                   userInfo.language === 'fr' ? 'French' :
                   userInfo.language === 'de' ? 'German' :
                   userInfo.language === 'zh' ? 'Chinese' :
                   userInfo.language === 'ja' ? 'Japanese' : 'English'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  /**
   * Renders password change form section
   * @returns {JSX.Element} Password change section
   */
  const renderChangePasswordSection = () => {
    return (
      <div>
        <h2 className="text-lg font-semibold mb-4">Change Password</h2>
        
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <Input
            id="currentPassword"
            name="currentPassword"
            label="Current Password"
            type="password"
            value={passwordInfo.currentPassword}
            onChange={handlePasswordChange}
            error={passwordErrors.currentPassword}
            required
          />
          
          <Input
            id="newPassword"
            name="newPassword"
            label="New Password"
            type="password"
            value={passwordInfo.newPassword}
            onChange={handlePasswordChange}
            error={passwordErrors.newPassword}
            helperText="Password must be at least 8 characters"
            required
          />
          
          <Input
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm New Password"
            type="password"
            value={passwordInfo.confirmPassword}
            onChange={handlePasswordChange}
            error={passwordErrors.confirmPassword}
            required
          />
          
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              disabled={isSaving}
            >
              {isSaving ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </div>
    );
  };
  
  /**
   * Renders notification preferences section
   * @returns {JSX.Element} Notification preferences section
   */
  const renderNotificationPreferencesSection = () => {
    return (
      <div>
        <h2 className="text-lg font-semibold mb-4">Notification Preferences</h2>
        
        <div className="space-y-4">
          <h3 className="text-md font-medium">Notification Channels</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-neutral-600">Receive notifications via email</p>
              </div>
              <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  className="absolute w-0 h-0 opacity-0"
                  checked={notificationPreferences.emailNotifications}
                  onChange={() => handleNotificationToggle('emailNotifications')}
                />
                <label
                  htmlFor="emailNotifications"
                  className={`block h-6 overflow-hidden rounded-full cursor-pointer transition-colors duration-200 ${
                    notificationPreferences.emailNotifications ? 'bg-primary-color' : 'bg-neutral-300'
                  }`}
                >
                  <span
                    className={`block h-6 w-6 rounded-full bg-white transform transition-transform duration-200 ${
                      notificationPreferences.emailNotifications ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  ></span>
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-neutral-600">Receive notifications on your device</p>
              </div>
              <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                <input
                  type="checkbox"
                  id="pushNotifications"
                  className="absolute w-0 h-0 opacity-0"
                  checked={notificationPreferences.pushNotifications}
                  onChange={() => handleNotificationToggle('pushNotifications')}
                />
                <label
                  htmlFor="pushNotifications"
                  className={`block h-6 overflow-hidden rounded-full cursor-pointer transition-colors duration-200 ${
                    notificationPreferences.pushNotifications ? 'bg-primary-color' : 'bg-neutral-300'
                  }`}
                >
                  <span
                    className={`block h-6 w-6 rounded-full bg-white transform transition-transform duration-200 ${
                      notificationPreferences.pushNotifications ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  ></span>
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
              <div>
                <p className="font-medium">SMS Notifications</p>
                <p className="text-sm text-neutral-600">Receive text message notifications</p>
              </div>
              <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                <input
                  type="checkbox"
                  id="smsNotifications"
                  className="absolute w-0 h-0 opacity-0"
                  checked={notificationPreferences.smsNotifications}
                  onChange={() => handleNotificationToggle('smsNotifications')}
                />
                <label
                  htmlFor="smsNotifications"
                  className={`block h-6 overflow-hidden rounded-full cursor-pointer transition-colors duration-200 ${
                    notificationPreferences.smsNotifications ? 'bg-primary-color' : 'bg-neutral-300'
                  }`}
                >
                  <span
                    className={`block h-6 w-6 rounded-full bg-white transform transition-transform duration-200 ${
                      notificationPreferences.smsNotifications ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  ></span>
                </label>
              </div>
            </div>
          </div>
          
          <h3 className="text-md font-medium pt-2">Notification Types</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
              <p className="font-medium">Task Assignments</p>
              <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                <input
                  type="checkbox"
                  id="taskAssignments"
                  className="absolute w-0 h-0 opacity-0"
                  checked={notificationPreferences.taskAssignments}
                  onChange={() => handleNotificationToggle('taskAssignments')}
                />
                <label
                  htmlFor="taskAssignments"
                  className={`block h-6 overflow-hidden rounded-full cursor-pointer transition-colors duration-200 ${
                    notificationPreferences.taskAssignments ? 'bg-primary-color' : 'bg-neutral-300'
                  }`}
                >
                  <span
                    className={`block h-6 w-6 rounded-full bg-white transform transition-transform duration-200 ${
                      notificationPreferences.taskAssignments ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  ></span>
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
              <p className="font-medium">System Updates</p>
              <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                <input
                  type="checkbox"
                  id="systemUpdates"
                  className="absolute w-0 h-0 opacity-0"
                  checked={notificationPreferences.systemUpdates}
                  onChange={() => handleNotificationToggle('systemUpdates')}
                />
                <label
                  htmlFor="systemUpdates"
                  className={`block h-6 overflow-hidden rounded-full cursor-pointer transition-colors duration-200 ${
                    notificationPreferences.systemUpdates ? 'bg-primary-color' : 'bg-neutral-300'
                  }`}
                >
                  <span
                    className={`block h-6 w-6 rounded-full bg-white transform transition-transform duration-200 ${
                      notificationPreferences.systemUpdates ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  ></span>
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
              <p className="font-medium">Newsletter & Promotions</p>
              <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                <input
                  type="checkbox"
                  id="newsletterAndPromotions"
                  className="absolute w-0 h-0 opacity-0"
                  checked={notificationPreferences.newsletterAndPromotions}
                  onChange={() => handleNotificationToggle('newsletterAndPromotions')}
                />
                <label
                  htmlFor="newsletterAndPromotions"
                  className={`block h-6 overflow-hidden rounded-full cursor-pointer transition-colors duration-200 ${
                    notificationPreferences.newsletterAndPromotions ? 'bg-primary-color' : 'bg-neutral-300'
                  }`}
                >
                  <span
                    className={`block h-6 w-6 rounded-full bg-white transform transition-transform duration-200 ${
                      notificationPreferences.newsletterAndPromotions ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  ></span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <Button
              variant="primary"
              onClick={handleSaveNotifications}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </div>
      </div>
    );
  };
  
  /**
   * Renders activity history section
   * @returns {JSX.Element} Activity history section
   */
  const renderActivityHistorySection = () => {
    return (
      <div>
        <h2 className="text-lg font-semibold mb-4">Activity History</h2>
        
        <div className="space-y-2">
          {activityHistory.map((activity) => (
            <div key={activity.id} className="flex items-start py-3 border-b border-neutral-100 last:border-0">
              <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center mr-3">
                {getActivityIcon(activity.action)}
              </div>
              <div className="flex-1">
                <p className="font-medium">{activity.details}</p>
                <p className="text-xs text-neutral-500">{formatRelativeTime(activity.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mt-4">
          <Button
            variant="outline"
            size="sm"
          >
            View Full History
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="page-container pb-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Your Profile</h1>
        
        <Button 
          variant="outline"
          size="sm"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>
      
      {/* Status Messages */}
      {saveSuccess && (
        <div className="mb-4 p-3 bg-success-color/10 border border-success-color/30 rounded-md">
          <p className="text-success-color text-sm">Changes saved successfully!</p>
        </div>
      )}
      
      {saveError && (
        <div className="mb-4 p-3 bg-error-color/10 border border-error-color/30 rounded-md">
          <p className="text-error-color text-sm">{saveError}</p>
        </div>
      )}
      
      {/* Section Navigation */}
      <div className="flex border-b border-neutral-200 mb-4 overflow-x-auto">
        <button
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
            activeSection === sections.PERSONAL_INFO 
              ? 'text-primary-color border-b-2 border-primary-color' 
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
          onClick={() => handleSectionChange(sections.PERSONAL_INFO)}
        >
          Personal Info
        </button>
        
        <button
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
            activeSection === sections.CHANGE_PASSWORD 
              ? 'text-primary-color border-b-2 border-primary-color' 
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
          onClick={() => handleSectionChange(sections.CHANGE_PASSWORD)}
        >
          Change Password
        </button>
        
        <button
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
            activeSection === sections.NOTIFICATION_PREFERENCES 
              ? 'text-primary-color border-b-2 border-primary-color' 
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
          onClick={() => handleSectionChange(sections.NOTIFICATION_PREFERENCES)}
        >
          Notifications
        </button>
        
        <button
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
            activeSection === sections.ACTIVITY_HISTORY 
              ? 'text-primary-color border-b-2 border-primary-color' 
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
          onClick={() => handleSectionChange(sections.ACTIVITY_HISTORY)}
        >
          Activity
        </button>
      </div>
      
      {/* Section Content */}
      <Card>
        {activeSection === sections.PERSONAL_INFO && renderPersonalInfoSection()}
        {activeSection === sections.CHANGE_PASSWORD && renderChangePasswordSection()}
        {activeSection === sections.NOTIFICATION_PREFERENCES && renderNotificationPreferencesSection()}
        {activeSection === sections.ACTIVITY_HISTORY && renderActivityHistorySection()}
      </Card>
    </div>
  );
};

export default Profile;