import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

/**
 * Settings Page Component
 * 
 * Provides configuration interface for system-wide parameters, user preferences,
 * and administrative controls with role-based permission enforcement.
 * 
 * @module Pages/Settings
 */
const Settings = () => {
  // Navigation and authentication context integration
  const navigate = useNavigate();
  const { currentUser, hasPermission } = useAuth();
  
  // Verify administrative access - redirect if insufficient permissions
  useEffect(() => {
    if (!hasPermission('canManageSettings')) {
      navigate('/dashboard');
    }
  }, [hasPermission, navigate]);
  
  // State declarations with explicit categorization
  const [generalSettings, setGeneralSettings] = useState({
    companyName: 'Hotel & HomeStay Management',
    contactEmail: 'admin@hmssystem.com',
    contactPhone: '(555) 123-4567',
    timeZone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    currency: 'USD',
    language: 'en',
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    taskAssignmentNotification: true,
    taskCompletionNotification: true,
    maintenanceAlerts: true,
    bookingNotifications: true,
    systemUpdates: true,
    dailyReports: false,
    weeklyReports: true,
    monthlyReports: true,
  });
  
  const [securitySettings, setSecuritySettings] = useState({
    passwordExpiryDays: 90,
    loginAttempts: 5,
    sessionTimeoutMinutes: 30,
    enforceStrongPasswords: true,
    twoFactorAuthentication: false,
    ipRestriction: false,
  });
  
  // Form state management
  const [activeSection, setActiveSection] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  
  /**
   * Updates general settings state with form changes
   * @param {Event} e - Input change event 
   */
  const handleGeneralSettingsChange = (e) => {
    const { name, value } = e.target;
    setGeneralSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  /**
   * Updates notification settings state with toggle changes
   * @param {string} setting - Setting identifier
   */
  const handleNotificationToggle = (setting) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };
  
  /**
   * Updates security settings state with form changes
   * @param {Event} e - Input change event
   */
  const handleSecuritySettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSecuritySettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  /**
   * Handles form submission with optimistic UI update pattern
   * @param {Event} e - Form submission event
   */
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    
    // Reset state
    setSaveSuccess(false);
    setSaveError(null);
    setIsSaving(true);
    
    try {
      // Consolidate settings into single object for API submission
      const settingsPayload = {
        general: generalSettings,
        notifications: notificationSettings,
        security: securitySettings,
      };
      
      // Simulate API call with artificial delay for UX validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful save
      console.log('Settings saved:', settingsPayload);
      setSaveSuccess(true);
      
      // Reset success status after delay
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveError('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  /**
   * Switches active settings section
   * @param {string} section - Section identifier
   */
  const handleSectionChange = (section) => {
    setActiveSection(section);
  };
  
  /**
   * Renders the general settings form section
   * @returns {JSX.Element} General settings form
   */
  const renderGeneralSettings = () => {
    return (
      <div>
        <h2 className="text-lg font-semibold mb-4">General Settings</h2>
        
        <div className="space-y-4">
          <Input
            id="companyName"
            name="companyName"
            label="Company Name"
            value={generalSettings.companyName}
            onChange={handleGeneralSettingsChange}
          />
          
          <Input
            id="contactEmail"
            name="contactEmail"
            label="Contact Email"
            type="email"
            value={generalSettings.contactEmail}
            onChange={handleGeneralSettingsChange}
          />
          
          <Input
            id="contactPhone"
            name="contactPhone"
            label="Contact Phone"
            value={generalSettings.contactPhone}
            onChange={handleGeneralSettingsChange}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium text-neutral-800">
                Time Zone
              </label>
              <select
                id="timeZone"
                name="timeZone"
                value={generalSettings.timeZone}
                onChange={handleGeneralSettingsChange}
                className="w-full px-3 py-2 rounded-md border border-neutral-300 outline-none transition-colors focus:ring-2 focus:ring-primary-color/30 focus:border-primary-color"
              >
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                <option value="Asia/Tokyo">Japan Standard Time (JST)</option>
              </select>
            </div>
            
            <div>
              <label className="block mb-1 font-medium text-neutral-800">
                Currency
              </label>
              <select
                id="currency"
                name="currency"
                value={generalSettings.currency}
                onChange={handleGeneralSettingsChange}
                className="w-full px-3 py-2 rounded-md border border-neutral-300 outline-none transition-colors focus:ring-2 focus:ring-primary-color/30 focus:border-primary-color"
              >
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
                <option value="GBP">British Pound (£)</option>
                <option value="JPY">Japanese Yen (¥)</option>
                <option value="CAD">Canadian Dollar (C$)</option>
                <option value="AUD">Australian Dollar (A$)</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium text-neutral-800">
                Date Format
              </label>
              <select
                id="dateFormat"
                name="dateFormat"
                value={generalSettings.dateFormat}
                onChange={handleGeneralSettingsChange}
                className="w-full px-3 py-2 rounded-md border border-neutral-300 outline-none transition-colors focus:ring-2 focus:ring-primary-color/30 focus:border-primary-color"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
            
            <div>
              <label className="block mb-1 font-medium text-neutral-800">
                Time Format
              </label>
              <select
                id="timeFormat"
                name="timeFormat"
                value={generalSettings.timeFormat}
                onChange={handleGeneralSettingsChange}
                className="w-full px-3 py-2 rounded-md border border-neutral-300 outline-none transition-colors focus:ring-2 focus:ring-primary-color/30 focus:border-primary-color"
              >
                <option value="12h">12-hour (AM/PM)</option>
                <option value="24h">24-hour</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block mb-1 font-medium text-neutral-800">
              Language
            </label>
            <select
              id="language"
              name="language"
              value={generalSettings.language}
              onChange={handleGeneralSettingsChange}
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
        </div>
      </div>
    );
  };
  
  /**
   * Renders the notification settings form section
   * @returns {JSX.Element} Notification settings form
   */
  const renderNotificationSettings = () => {
    return (
      <div>
        <h2 className="text-lg font-semibold mb-4">Notification Settings</h2>
        
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
                  checked={notificationSettings.emailNotifications}
                  onChange={() => handleNotificationToggle('emailNotifications')}
                />
                <label
                  htmlFor="emailNotifications"
                  className={`block h-6 overflow-hidden rounded-full cursor-pointer transition-colors duration-200 ${
                    notificationSettings.emailNotifications ? 'bg-primary-color' : 'bg-neutral-300'
                  }`}
                >
                  <span
                    className={`block h-6 w-6 rounded-full bg-white transform transition-transform duration-200 ${
                      notificationSettings.emailNotifications ? 'translate-x-6' : 'translate-x-0'
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
                  checked={notificationSettings.pushNotifications}
                  onChange={() => handleNotificationToggle('pushNotifications')}
                />
                <label
                  htmlFor="pushNotifications"
                  className={`block h-6 overflow-hidden rounded-full cursor-pointer transition-colors duration-200 ${
                    notificationSettings.pushNotifications ? 'bg-primary-color' : 'bg-neutral-300'
                  }`}
                >
                  <span
                    className={`block h-6 w-6 rounded-full bg-white transform transition-transform duration-200 ${
                      notificationSettings.pushNotifications ? 'translate-x-6' : 'translate-x-0'
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
                  id="taskAssignmentNotification"
                  className="absolute w-0 h-0 opacity-0"
                  checked={notificationSettings.taskAssignmentNotification}
                  onChange={() => handleNotificationToggle('taskAssignmentNotification')}
                />
                <label
                  htmlFor="taskAssignmentNotification"
                  className={`block h-6 overflow-hidden rounded-full cursor-pointer transition-colors duration-200 ${
                    notificationSettings.taskAssignmentNotification ? 'bg-primary-color' : 'bg-neutral-300'
                  }`}
                >
                  <span
                    className={`block h-6 w-6 rounded-full bg-white transform transition-transform duration-200 ${
                      notificationSettings.taskAssignmentNotification ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  ></span>
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
              <p className="font-medium">Task Completions</p>
              <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                <input
                  type="checkbox"
                  id="taskCompletionNotification"
                  className="absolute w-0 h-0 opacity-0"
                  checked={notificationSettings.taskCompletionNotification}
                  onChange={() => handleNotificationToggle('taskCompletionNotification')}
                />
                <label
                  htmlFor="taskCompletionNotification"
                  className={`block h-6 overflow-hidden rounded-full cursor-pointer transition-colors duration-200 ${
                    notificationSettings.taskCompletionNotification ? 'bg-primary-color' : 'bg-neutral-300'
                  }`}
                >
                  <span
                    className={`block h-6 w-6 rounded-full bg-white transform transition-transform duration-200 ${
                      notificationSettings.taskCompletionNotification ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  ></span>
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
              <p className="font-medium">Maintenance Alerts</p>
              <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                <input
                  type="checkbox"
                  id="maintenanceAlerts"
                  className="absolute w-0 h-0 opacity-0"
                  checked={notificationSettings.maintenanceAlerts}
                  onChange={() => handleNotificationToggle('maintenanceAlerts')}
                />
                <label
                  htmlFor="maintenanceAlerts"
                  className={`block h-6 overflow-hidden rounded-full cursor-pointer transition-colors duration-200 ${
                    notificationSettings.maintenanceAlerts ? 'bg-primary-color' : 'bg-neutral-300'
                  }`}
                >
                  <span
                    className={`block h-6 w-6 rounded-full bg-white transform transition-transform duration-200 ${
                      notificationSettings.maintenanceAlerts ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  ></span>
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
              <p className="font-medium">Booking Notifications</p>
              <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                <input
                  type="checkbox"
                  id="bookingNotifications"
                  className="absolute w-0 h-0 opacity-0"
                  checked={notificationSettings.bookingNotifications}
                  onChange={() => handleNotificationToggle('bookingNotifications')}
                />
                <label
                  htmlFor="bookingNotifications"
                  className={`block h-6 overflow-hidden rounded-full cursor-pointer transition-colors duration-200 ${
                    notificationSettings.bookingNotifications ? 'bg-primary-color' : 'bg-neutral-300'
                  }`}
                >
                  <span
                    className={`block h-6 w-6 rounded-full bg-white transform transition-transform duration-200 ${
                      notificationSettings.bookingNotifications ? 'translate-x-6' : 'translate-x-0'
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
                  checked={notificationSettings.systemUpdates}
                  onChange={() => handleNotificationToggle('systemUpdates')}
                />
                <label
                  htmlFor="systemUpdates"
                  className={`block h-6 overflow-hidden rounded-full cursor-pointer transition-colors duration-200 ${
                    notificationSettings.systemUpdates ? 'bg-primary-color' : 'bg-neutral-300'
                  }`}
                >
                  <span
                    className={`block h-6 w-6 rounded-full bg-white transform transition-transform duration-200 ${
                      notificationSettings.systemUpdates ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  ></span>
                </label>
              </div>
            </div>
          </div>
          
          <h3 className="text-md font-medium pt-2">Report Delivery</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
              <p className="font-medium">Daily Reports</p>
              <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                <input
                  type="checkbox"
                  id="dailyReports"
                  className="absolute w-0 h-0 opacity-0"
                  checked={notificationSettings.dailyReports}
                  onChange={() => handleNotificationToggle('dailyReports')}
                />
                <label
                  htmlFor="dailyReports"
                  className={`block h-6 overflow-hidden rounded-full cursor-pointer transition-colors duration-200 ${
                    notificationSettings.dailyReports ? 'bg-primary-color' : 'bg-neutral-300'
                  }`}
                >
                  <span
                    className={`block h-6 w-6 rounded-full bg-white transform transition-transform duration-200 ${
                      notificationSettings.dailyReports ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  ></span>
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
              <p className="font-medium">Weekly Reports</p>
              <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                <input
                  type="checkbox"
                  id="weeklyReports"
                  className="absolute w-0 h-0 opacity-0"
                  checked={notificationSettings.weeklyReports}
                  onChange={() => handleNotificationToggle('weeklyReports')}
                />
                <label
                  htmlFor="weeklyReports"
                  className={`block h-6 overflow-hidden rounded-full cursor-pointer transition-colors duration-200 ${
                    notificationSettings.weeklyReports ? 'bg-primary-color' : 'bg-neutral-300'
                  }`}
                >
                  <span
                    className={`block h-6 w-6 rounded-full bg-white transform transition-transform duration-200 ${
                      notificationSettings.weeklyReports ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  ></span>
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
              <p className="font-medium">Monthly Reports</p>
              <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                <input
                  type="checkbox"
                  id="monthlyReports"
                  className="absolute w-0 h-0 opacity-0"
                  checked={notificationSettings.monthlyReports}
                  onChange={() => handleNotificationToggle('monthlyReports')}
                />
                <label
                  htmlFor="monthlyReports"
                  className={`block h-6 overflow-hidden rounded-full cursor-pointer transition-colors duration-200 ${
                    notificationSettings.monthlyReports ? 'bg-primary-color' : 'bg-neutral-300'
                  }`}
                >
                  <span
                    className={`block h-6 w-6 rounded-full bg-white transform transition-transform duration-200 ${
                      notificationSettings.monthlyReports ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  ></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  /**
   * Renders the security settings form section
   * @returns {JSX.Element} Security settings form
   */
  const renderSecuritySettings = () => {
    return (
      <div>
        <h2 className="text-lg font-semibold mb-4">Security Settings</h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="passwordExpiryDays"
              name="passwordExpiryDays"
              label="Password Expiry (days)"
              type="number"
              min="0"
              max="365"
              value={securitySettings.passwordExpiryDays}
              onChange={handleSecuritySettingsChange}
            />
            
            <Input
              id="loginAttempts"
              name="loginAttempts"
              label="Max Login Attempts"
              type="number"
              min="1"
              max="10"
              value={securitySettings.loginAttempts}
              onChange={handleSecuritySettingsChange}
            />
          </div>
          
          <Input
            id="sessionTimeoutMinutes"
            name="sessionTimeoutMinutes"
            label="Session Timeout (minutes)"
            type="number"
            min="5"
            max="120"
            value={securitySettings.sessionTimeoutMinutes}
            onChange={handleSecuritySettingsChange}
          />
          
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
              <div>
                <p className="font-medium">Enforce Strong Passwords</p>
                <p className="text-sm text-neutral-600">Require complex passwords with minimum length</p>
              </div>
              <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                <input
                  type="checkbox"
                  id="enforceStrongPasswords"
                  name="enforceStrongPasswords"
                  className="absolute w-0 h-0 opacity-0"
                  checked={securitySettings.enforceStrongPasswords}
                  onChange={handleSecuritySettingsChange}
                />
                <label
                  htmlFor="enforceStrongPasswords"
                  className={`block h-6 overflow-hidden rounded-full cursor-pointer transition-colors duration-200 ${
                    securitySettings.enforceStrongPasswords ? 'bg-primary-color' : 'bg-neutral-300'
                  }`}
                >
                  <span
                    className={`block h-6 w-6 rounded-full bg-white transform transition-transform duration-200 ${
                      securitySettings.enforceStrongPasswords ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  ></span>
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-neutral-600">Require 2FA for all staff members</p>
              </div>
              <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                <input
                  type="checkbox"
                  id="twoFactorAuthentication"
                  name="twoFactorAuthentication"
                  className="absolute w-0 h-0 opacity-0"
                  checked={securitySettings.twoFactorAuthentication}
                  onChange={handleSecuritySettingsChange}
                />
                <label
                  htmlFor="twoFactorAuthentication"
                  className={`block h-6 overflow-hidden rounded-full cursor-pointer transition-colors duration-200 ${
                    securitySettings.twoFactorAuthentication ? 'bg-primary-color' : 'bg-neutral-300'
                  }`}
                >
                  <span
                    className={`block h-6 w-6 rounded-full bg-white transform transition-transform duration-200 ${
                      securitySettings.twoFactorAuthentication ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  ></span>
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
              <div>
                <p className="font-medium">IP Restriction</p>
                <p className="text-sm text-neutral-600">Limit access to specific IP addresses</p>
              </div>
              <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                <input
                  type="checkbox"
                  id="ipRestriction"
                  name="ipRestriction"
                  className="absolute w-0 h-0 opacity-0"
                  checked={securitySettings.ipRestriction}
                  onChange={handleSecuritySettingsChange}
                />
                <label
                  htmlFor="ipRestriction"
                  className={`block h-6 overflow-hidden rounded-full cursor-pointer transition-colors duration-200 ${
                    securitySettings.ipRestriction ? 'bg-primary-color' : 'bg-neutral-300'
                  }`}
                >
                  <span
                    className={`block h-6 w-6 rounded-full bg-white transform transition-transform duration-200 ${
                      securitySettings.ipRestriction ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  ></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="page-container pb-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Settings</h1>
      </div>
      
      <div className="flex border-b border-neutral-200 mb-4 overflow-x-auto">
        <button
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
            activeSection === 'general' 
              ? 'text-primary-color border-b-2 border-primary-color' 
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
          onClick={() => handleSectionChange('general')}
        >
          General
        </button>
        
        <button
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
            activeSection === 'notifications' 
              ? 'text-primary-color border-b-2 border-primary-color' 
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
          onClick={() => handleSectionChange('notifications')}
        >
          Notifications
        </button>
        
        <button
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
            activeSection === 'security' 
              ? 'text-primary-color border-b-2 border-primary-color' 
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
          onClick={() => handleSectionChange('security')}
        >
          Security
        </button>
      </div>
      
      <form onSubmit={handleSaveSettings}>
        <Card className="mb-4">
          {activeSection === 'general' && renderGeneralSettings()}
          {activeSection === 'notifications' && renderNotificationSettings()}
          {activeSection === 'security' && renderSecuritySettings()}
        </Card>
        
        {/* Status Messages */}
        {saveSuccess && (
          <div className="mb-4 p-3 bg-success-color/10 border border-success-color/30 rounded-md">
            <p className="text-success-color text-sm">Settings saved successfully!</p>
          </div>
        )}
        
        {saveError && (
          <div className="mb-4 p-3 bg-error-color/10 border border-error-color/30 rounded-md">
            <p className="text-error-color text-sm">{saveError}</p>
          </div>
        )}
        
        {/* Form Actions */}
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            className="mr-2"
            onClick={() => navigate('/dashboard')}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            variant="primary"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Settings;