import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { StatusBadge } from '../components/common/Badge';

/**
 * Users Page Component
 * 
 * Administrative interface for user management with staff directory,
 * role assignment, property access control, and account administration.
 * 
 * @module Pages/Users
 */
const Users = () => {
  // Navigation and authentication hooks
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  
  // Access control verification
  useEffect(() => {
    if (!hasPermission('canManageUsers')) {
      navigate('/dashboard');
    }
  }, [hasPermission, navigate]);
  
  // Component state declarations with explicit typing via JSDoc
  /**
   * @typedef {Object} User
   * @property {number} id - Unique identifier
   * @property {string} name - User's full name
   * @property {string} username - Login username
   * @property {string} email - Email address
   * @property {string} phone - Contact phone number
   * @property {string} role - System role (e.g., boss, manager, cleaner)
   * @property {string} status - Account status (active, inactive, pending)
   * @property {string} avatar - Avatar representation (emoji or initials)
   * @property {Array<number>} assignedProperties - IDs of properties user has access to
   * @property {string} lastLogin - ISO timestamp of last login
   * @property {string} createdAt - ISO timestamp of account creation
   */
  
  /** @type {[User[], function]} - User list state */
  const [users, setUsers] = useState([]);
  
  /** @type {[boolean, function]} - Loading state tracker */
  const [loading, setLoading] = useState(true);
  
  /** @type {[Object, function]} - Filter criteria state */
  const [filters, setFilters] = useState({
    search: '',
    role: 'all',
    status: 'all',
    property: 'all'
  });
  
  /** @type {[Array, function]} - Available properties for filtering */
  const [properties, setProperties] = useState([]);
  
  /** @type {[User|null, function]} - Currently selected user for details view */
  const [selectedUser, setSelectedUser] = useState(null);
  
  /** @type {[boolean, function]} - Modal visibility controller */
  const [showUserModal, setShowUserModal] = useState(false);
  
  /** @type {[string, function]} - Modal operation type (create, edit) */
  const [modalMode, setModalMode] = useState('create');
  
  /**
   * Fetches user data from simulated API endpoint
   * In production this would connect to a user management service
   */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock properties data
        const mockProperties = [
          { id: 1, name: 'Sunrise Hotel' },
          { id: 2, name: 'Mountain View Lodge' },
          { id: 3, name: 'Riverside Resort' },
          { id: 4, name: 'Urban Boutique Hotel' },
          { id: 5, name: 'Lakeside Cabin Retreat' }
        ];
        
        // Mock users data with comprehensive structure
        const mockUsers = [
          {
            id: 1,
            name: 'Sam Wilson',
            username: 'boss',
            email: 'sam.wilson@hmssystem.com',
            phone: '(555) 123-4567',
            role: 'boss',
            status: 'active',
            avatar: '👨‍💼',
            assignedProperties: [1, 2, 3, 4, 5],
            lastLogin: '2025-03-02T08:30:00',
            createdAt: '2024-01-01T10:00:00'
          },
          {
            id: 2,
            name: 'Emily Johnson',
            username: 'manager',
            email: 'emily.johnson@hmssystem.com',
            phone: '(555) 234-5678',
            role: 'manager',
            status: 'active',
            avatar: '👩‍💼',
            assignedProperties: [1, 2, 3],
            lastLogin: '2025-03-01T09:15:00',
            createdAt: '2024-01-15T11:30:00'
          },
          {
            id: 3,
            name: 'David Lee',
            username: 'host',
            email: 'david.lee@hmssystem.com',
            phone: '(555) 345-6789',
            role: 'host',
            status: 'active',
            avatar: '🧑‍💼',
            assignedProperties: [2, 5],
            lastLogin: '2025-03-01T14:20:00',
            createdAt: '2024-02-01T09:45:00'
          },
          {
            id: 4,
            name: 'Maria Garcia',
            username: 'cleaner',
            email: 'maria.garcia@hmssystem.com',
            phone: '(555) 456-7890',
            role: 'cleaner',
            status: 'active',
            avatar: '🧹',
            assignedProperties: [1, 3],
            lastLogin: '2025-03-02T07:45:00',
            createdAt: '2024-02-15T13:20:00'
          },
          {
            id: 5,
            name: 'Alex Brown',
            username: 'reception',
            email: 'alex.brown@hmssystem.com',
            phone: '(555) 567-8901',
            role: 'receptionist',
            status: 'active',
            avatar: '💁‍♀️',
            assignedProperties: [1, 4],
            lastLogin: '2025-03-02T08:00:00',
            createdAt: '2024-03-01T10:15:00'
          },
          {
            id: 6,
            name: 'James Wilson',
            username: 'sales',
            email: 'james.wilson@hmssystem.com',
            phone: '(555) 678-9012',
            role: 'sales',
            status: 'active',
            avatar: '📊',
            assignedProperties: [1, 2, 3, 4, 5],
            lastLogin: '2025-03-01T16:30:00',
            createdAt: '2024-03-15T09:00:00'
          },
          {
            id: 7,
            name: 'Sophia Chen',
            username: 'accountant',
            email: 'sophia.chen@hmssystem.com',
            phone: '(555) 789-0123',
            role: 'accountant',
            status: 'active',
            avatar: '🧮',
            assignedProperties: [1, 2, 3, 4, 5],
            lastLogin: '2025-03-01T11:45:00',
            createdAt: '2024-04-01T08:30:00'
          },
          {
            id: 8,
            name: 'Michael Taylor',
            username: 'michael.taylor',
            email: 'michael.taylor@hmssystem.com',
            phone: '(555) 890-1234',
            role: 'cleaner',
            status: 'inactive',
            avatar: '🧹',
            assignedProperties: [2],
            lastLogin: '2025-02-15T10:30:00',
            createdAt: '2024-04-15T13:45:00'
          },
          {
            id: 9,
            name: 'Jessica Martinez',
            username: 'jessica.martinez',
            email: 'jessica.martinez@hmssystem.com',
            phone: '(555) 901-2345',
            role: 'receptionist',
            status: 'pending',
            avatar: '💁‍♀️',
            assignedProperties: [3],
            lastLogin: null,
            createdAt: '2025-03-01T14:00:00'
          }
        ];
        
        setProperties(mockProperties);
        setUsers(mockUsers);
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  /**
   * New user form state with type-safe default values
   * @type {[User, function]}
   */
  const [userForm, setUserForm] = useState({
    id: null,
    name: '',
    username: '',
    email: '',
    phone: '',
    role: 'cleaner',
    status: 'active',
    avatar: '👤',
    assignedProperties: [],
    password: '',
    confirmPassword: ''
  });
  
  /**
   * Form validation state
   * @type {[Object, function]}
   */
  const [formErrors, setFormErrors] = useState({});
  
  /**
   * Form processing state
   * @type {[boolean, function]}
   */
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  /**
   * Handles filter changes with input name mapping
   * @param {string} filterName - Name of filter to update
   * @param {string} value - New filter value
   */
  const handleFilterChange = (filterName, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterName]: value
    }));
  };
  
  /**
   * Applies current filters to user list
   * @returns {User[]} Filtered user list
   */
  const getFilteredUsers = () => {
    return users.filter(user => {
      // Search filter - check name, username, email
      const matchesSearch = filters.search === '' || 
        user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.username.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.search.toLowerCase());
      
      // Role filter
      const matchesRole = filters.role === 'all' || user.role === filters.role;
      
      // Status filter
      const matchesStatus = filters.status === 'all' || user.status === filters.status;
      
      // Property filter
      const matchesProperty = filters.property === 'all' || 
        user.assignedProperties.includes(parseInt(filters.property));
      
      return matchesSearch && matchesRole && matchesStatus && matchesProperty;
    });
  };
  
  /**
   * Opens user modal in create mode
   */
  const handleCreateUser = () => {
    // Reset form to defaults
    setUserForm({
      id: null,
      name: '',
      username: '',
      email: '',
      phone: '',
      role: 'cleaner',
      status: 'active',
      avatar: '👤',
      assignedProperties: [],
      password: '',
      confirmPassword: ''
    });
    
    // Reset any previous errors
    setFormErrors({});
    
    // Set mode and open modal
    setModalMode('create');
    setShowUserModal(true);
  };
  
  /**
   * Opens user modal in edit mode with populated data
   * @param {User} user - User object to edit
   */
  const handleEditUser = (user) => {
    // Clone user data for form
    setUserForm({
      ...user,
      password: '',
      confirmPassword: ''
    });
    
    // Reset any previous errors
    setFormErrors({});
    
    // Set mode and open modal
    setModalMode('edit');
    setShowUserModal(true);
  };
  
  /**
   * Closes user modal and resets state
   */
  const handleCloseModal = () => {
    setShowUserModal(false);
    setFormErrors({});
  };
  
  /**
   * Handles form input changes
   * @param {Event} e - Input change event
   */
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Special handling for checkboxes
    if (type === 'checkbox') {
      if (name === 'assignedProperties') {
        const propertyId = parseInt(value);
        
        // Toggle property selection
        setUserForm(prevForm => {
          if (checked) {
            // Add property to selection
            return {
              ...prevForm,
              assignedProperties: [...prevForm.assignedProperties, propertyId]
            };
          } else {
            // Remove property from selection
            return {
              ...prevForm,
              assignedProperties: prevForm.assignedProperties.filter(id => id !== propertyId)
            };
          }
        });
      } else {
        // Regular checkbox handling
        setUserForm(prevForm => ({
          ...prevForm,
          [name]: checked
        }));
      }
    } else {
      // Regular input handling
      setUserForm(prevForm => ({
        ...prevForm,
        [name]: value
      }));
    }
    
    // Clear error when field is modified
    if (formErrors[name]) {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        [name]: undefined
      }));
    }
  };
  
  /**
   * Validates user form before submission
   * @returns {boolean} Validation result
   */
  const validateForm = () => {
    const errors = {};
    let isValid = true;
    
    // Required fields validation
    if (!userForm.name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    }
    
    if (!userForm.username.trim()) {
      errors.username = 'Username is required';
      isValid = false;
    }
    
    if (!userForm.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(userForm.email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }
    
    // Password validation for new users
    if (modalMode === 'create') {
      if (!userForm.password) {
        errors.password = 'Password is required';
        isValid = false;
      } else if (userForm.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
        isValid = false;
      }
      
      if (!userForm.confirmPassword) {
        errors.confirmPassword = 'Please confirm password';
        isValid = false;
      } else if (userForm.password !== userForm.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
        isValid = false;
      }
    } else if (userForm.password && userForm.password.length > 0) {
      // Password validation for existing users (only if they're changing it)
      if (userForm.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
        isValid = false;
      }
      
      if (!userForm.confirmPassword) {
        errors.confirmPassword = 'Please confirm password';
        isValid = false;
      } else if (userForm.password !== userForm.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
        isValid = false;
      }
    }
    
    // At least one property must be assigned
    if (userForm.assignedProperties.length === 0) {
      errors.assignedProperties = 'Assign at least one property';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  /**
   * Handles user form submission with optimistic updates
   * @param {Event} e - Form submission event
   */
  const handleSubmitUser = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare user data - omit confirmation fields
      const userData = {
        ...userForm,
        // Additional fields that would be set by the server
        lastLogin: modalMode === 'create' ? null : userForm.lastLogin,
        createdAt: modalMode === 'create' ? new Date().toISOString() : userForm.createdAt
      };
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (modalMode === 'create') {
        // Generate a new ID (would be done by the server in a real app)
        userData.id = Math.max(...users.map(u => u.id)) + 1;
        
        // Add new user to the list
        setUsers(prevUsers => [...prevUsers, userData]);
      } else {
        // Update existing user
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userData.id ? { ...userData } : user
          )
        );
      }
      
      // Close modal after successful operation
      handleCloseModal();
    } catch (error) {
      console.error('Error saving user:', error);
      setFormErrors(prevErrors => ({
        ...prevErrors,
        submit: 'Failed to save user. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  /**
   * Handles user deletion with confirmation
   * @param {User} user - User to delete
   */
  const handleDeleteUser = async (user) => {
    // In a real app, you would show a confirmation dialog
    if (!window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      return;
    }
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Remove user from list
      setUsers(prevUsers => prevUsers.filter(u => u.id !== user.id));
      
      // If the user was selected, clear selection
      if (selectedUser && selectedUser.id === user.id) {
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. Please try again.');
    }
  };
  
  /**
   * Toggles user active status
   * @param {User} user - User to update
   */
  const handleToggleUserStatus = async (user) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update user status
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === user.id ? { ...u, status: newStatus } : u
        )
      );
      
      // Update selected user if needed
      if (selectedUser && selectedUser.id === user.id) {
        setSelectedUser(prevUser => ({
          ...prevUser,
          status: newStatus
        }));
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status. Please try again.');
    }
  };
  
  /**
   * Selects a user for detailed view
   * @param {User} user - User to display
   */
  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };
  
  /**
   * Clears user selection
   */
  const handleClearSelection = () => {
    setSelectedUser(null);
  };
  
  /**
   * Formats timestamp for user-friendly display
   * @param {string|null} timestamp - ISO timestamp string or null
   * @returns {string} Formatted date/time or 'Never'
   */
  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  /**
   * Formats relative time for recent timestamps
   * @param {string|null} timestamp - ISO timestamp string or null
   * @returns {string} Relative time or 'Never'
   */
  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 7) {
      return formatDateTime(timestamp);
    } else if (diffDay > 0) {
      return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    } else if (diffHour > 0) {
      return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else if (diffMin > 0) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };
  
  /**
   * Generates a user-friendly role display name
   * @param {string} role - Role identifier
   * @returns {string} Formatted role name
   */
  const formatRole = (role) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };
  
  // Get filtered users for display
  const filteredUsers = getFilteredUsers();
  
  return (
    <div className="page-container pb-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">User Management</h1>
        
        <Button 
          variant="primary"
          size="sm"
          onClick={handleCreateUser}
        >
          Add User
        </Button>
      </div>
      
      {/* Filters and Search */}
      <Card className="mb-4">
        <div className="mb-3">
          <Input
            placeholder="Search users..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            startIcon={<span>🔍</span>}
            className="mb-0"
          />
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {/* Role Filter */}
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">
              Role
            </label>
            <select 
              className="w-full px-2 py-1.5 rounded-md border border-neutral-300 text-sm"
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="boss">Boss</option>
              <option value="manager">Manager</option>
              <option value="host">Host</option>
              <option value="cleaner">Cleaner</option>
              <option value="receptionist">Receptionist</option>
              <option value="sales">Sales</option>
              <option value="accountant">Accountant</option>
            </select>
          </div>
          
          {/* Status Filter */}
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">
              Status
            </label>
            <select 
              className="w-full px-2 py-1.5 rounded-md border border-neutral-300 text-sm"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          
          {/* Property Filter */}
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">
              Property
            </label>
            <select 
              className="w-full px-2 py-1.5 rounded-md border border-neutral-300 text-sm"
              value={filters.property}
              onChange={(e) => handleFilterChange('property', e.target.value)}
            >
              <option value="all">All Properties</option>
              {properties.map(property => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>
      
      {/* User List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`col-span-1 ${selectedUser ? 'md:col-span-2' : 'md:col-span-3'}`}>
          <Card>
            <h2 className="text-lg font-semibold mb-3">Users ({filteredUsers.length})</h2>
            
            {loading ? (
              <div className="text-center py-8">
                <p className="text-neutral-600">Loading users...</p>
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="divide-y divide-neutral-100">
                {filteredUsers.map(user => (
                  <div 
                    key={user.id}
                    className={`py-3 ${selectedUser?.id === user.id ? 'bg-primary-color/5' : ''}`}
                  >
                    <div className="flex items-center">
                      <div 
                        className="w-10 h-10 rounded-full bg-primary-color/10 flex items-center justify-center text-primary-color mr-3 flex-shrink-0 cursor-pointer"
                        onClick={() => handleSelectUser(user)}
                      >
                        {user.avatar}
                      </div>
                      
                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleSelectUser(user)}>
                        <h3 className="font-medium truncate">{user.name}</h3>
                        <div className="flex items-center text-sm text-neutral-500 space-x-2">
                          <span className="truncate">{user.email}</span>
                          <span className="hidden sm:inline">|</span>
                          <span className="hidden sm:inline capitalize">{user.role}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center ml-2">
                        <StatusBadge 
                          status={user.status === 'active' ? 'active' : user.status === 'pending' ? 'pending' : 'inactive'}
                          size="sm"
                        />
                        
                        <div className="flex ml-2">
                          <button
                            className="p-1 text-neutral-500 hover:text-primary-color"
                            onClick={() => handleEditUser(user)}
                            aria-label="Edit user"
                          >
                            ✏️
                          </button>
                          
                          <button
                            className="p-1 text-neutral-500 hover:text-error-color"
                            onClick={() => handleDeleteUser(user)}
                            aria-label="Delete user"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-neutral-600 mb-2">No users match your filters</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setFilters({
                    search: '',
                    role: 'all',
                    status: 'all',
                    property: 'all'
                  })}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </Card>
        </div>
        
        {/* User Details Panel */}
        {selectedUser && (
          <div className="md:col-span-1">
            <Card>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-semibold">User Details</h2>
                <button
                  className="p-1 text-neutral-500 hover:text-neutral-700"
                  onClick={handleClearSelection}
                  aria-label="Close details"
                >
                  ✕
                </button>
              </div>
              
              <div className="flex flex-col items-center mb-4">
                <div className="w-20 h-20 rounded-full bg-primary-color/10 flex items-center justify-center text-primary-color text-4xl mb-2">
                  {selectedUser.avatar}
                </div>
                <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                <p className="text-neutral-600 capitalize">{selectedUser.role}</p>
                <StatusBadge 
                  status={selectedUser.status === 'active' ? 'active' : selectedUser.status === 'pending' ? 'pending' : 'inactive'}
                  className="mt-2"
                />
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-neutral-500">Username</p>
                  <p className="font-medium">{selectedUser.username}</p>
                </div>
                
                <div>
                  <p className="text-sm text-neutral-500">Email</p>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                
                <div>
                  <p className="text-sm text-neutral-500">Phone</p>
                  <p className="font-medium">{selectedUser.phone || 'Not provided'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-neutral-500">Last Login</p>
                  <p className="font-medium">{formatRelativeTime(selectedUser.lastLogin)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-neutral-500">Created</p>
                  <p className="font-medium">{formatDateTime(selectedUser.createdAt)}</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-neutral-200">
                <p className="text-sm font-medium text-neutral-800 mb-2">Assigned Properties</p>
                {selectedUser.assignedProperties.length > 0 ? (
                  <div className="space-y-1">
                    {selectedUser.assignedProperties.map(propId => {
                      const property = properties.find(p => p.id === propId);
                      return property ? (
                        <div 
                          key={propId}
                          className="text-sm py-1 px-2 bg-neutral-100 rounded"
                        >
                          {property.name}
                        </div>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500">No properties assigned</p>
                )}
              </div>
              
              <div className="flex space-x-2 mt-6">
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={() => handleEditUser(selectedUser)}
                >
                  Edit User
                </Button>
                
                <Button
                  variant={selectedUser.status === 'active' ? 'danger' : 'success'}
                  size="sm"
                  fullWidth
                  onClick={() => handleToggleUserStatus(selectedUser)}
                >
                  {selectedUser.status === 'active' ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
      
      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {modalMode === 'create' ? 'Add New User' : 'Edit User'}
                </h2>
                <button
                  className="p-1 text-neutral-500 hover:text-neutral-700"
                  onClick={handleCloseModal}
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>
              
              {formErrors.submit && (
                <div className="mb-4 p-3 bg-error-color/10 border border-error-color/30 rounded-md">
                  <p className="text-error-color text-sm">{formErrors.submit}</p>
                </div>
              )}
              
              <form onSubmit={handleSubmitUser} className="space-y-4">
                <Input
                  id="name"
                  name="name"
                  label="Full Name"
                  value={userForm.name}
                  onChange={handleFormChange}
                  error={formErrors.name}
                  required
                />
                
                <Input
                  id="username"
                  name="username"
                  label="Username"
                  value={userForm.username}
                  onChange={handleFormChange}
                  error={formErrors.username}
                  required
                />
                
                <Input
                  id="email"
                  name="email"
                  label="Email"
                  type="email"
                  value={userForm.email}
                  onChange={handleFormChange}
                  error={formErrors.email}
                  required
                />
                
                <Input
                  id="phone"
                  name="phone"
                  label="Phone Number"
                  value={userForm.phone}
                  onChange={handleFormChange}
                  error={formErrors.phone}
                />
                
                <div>
                  <label className="block mb-1 font-medium text-neutral-800">
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={userForm.role}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 rounded-md border border-neutral-300 outline-none transition-colors focus:ring-2 focus:ring-primary-color/30 focus:border-primary-color"
                    required
                  >
                    <option value="boss">Boss</option>
                    <option value="manager">Manager</option>
                    <option value="host">Host</option>
                    <option value="cleaner">Cleaner</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="sales">Sales</option>
                    <option value="accountant">Accountant</option>
                  </select>
                </div>
                
                <div>
                  <label className="block mb-1 font-medium text-neutral-800">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={userForm.status}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 rounded-md border border-neutral-300 outline-none transition-colors focus:ring-2 focus:ring-primary-color/30 focus:border-primary-color"
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                
                {/* Password fields - required for new users, optional for edits */}
                <Input
                  id="password"
                  name="password"
                  label={`Password ${modalMode === 'edit' ? '(Leave blank to keep current)' : ''}`}
                  type="password"
                  value={userForm.password}
                  onChange={handleFormChange}
                  error={formErrors.password}
                  required={modalMode === 'create'}
                />
                
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  value={userForm.confirmPassword}
                  onChange={handleFormChange}
                  error={formErrors.confirmPassword}
                  required={modalMode === 'create' || userForm.password.length > 0}
                />
                
                {/* Property Assignments */}
                <div>
                  <label className="block mb-1 font-medium text-neutral-800">
                    Assigned Properties
                  </label>
                  {formErrors.assignedProperties && (
                    <p className="text-sm text-error-color mb-2">
                      {formErrors.assignedProperties}
                    </p>
                  )}
                  <div className="space-y-2 max-h-40 overflow-y-auto p-2 border border-neutral-300 rounded-md">
                    {properties.map(property => (
                      <div key={property.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`property-${property.id}`}
                          name="assignedProperties"
                          value={property.id}
                          checked={userForm.assignedProperties.includes(property.id)}
                          onChange={handleFormChange}
                          className="mr-2 h-4 w-4 text-primary-color focus:ring-primary-color border-neutral-300 rounded"
                        />
                        <label htmlFor={`property-${property.id}`} className="text-sm">
                          {property.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end pt-2 space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting 
                      ? (modalMode === 'create' ? 'Creating...' : 'Saving...') 
                      : (modalMode === 'create' ? 'Create User' : 'Save Changes')}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;