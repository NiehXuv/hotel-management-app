import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the Authentication Context
const AuthContext = createContext();

// Mock user data for demonstration
const mockUsers = [
  { id: 1, username: 'boss', password: 'password', name: 'Sam Wilson', role: 'boss', avatar: '👨‍💼' },
  { id: 2, username: 'manager', password: 'password', name: 'Emily Johnson', role: 'manager', avatar: '👩‍💼' },
  { id: 3, username: 'host', password: 'password', name: 'David Lee', role: 'host', avatar: '🧑‍💼' },
  { id: 4, username: 'cleaner', password: 'password', name: 'Maria Garcia', role: 'cleaner', avatar: '🧹' },
  { id: 5, username: 'reception', password: 'password', name: 'Alex Brown', role: 'receptionist', avatar: '💁‍♀️' },
  { id: 6, username: 'sales', password: 'password', name: 'James Wilson', role: 'sales', avatar: '📊' },
  { id: 7, username: 'accountant', password: 'password', name: 'Sophia Chen', role: 'accountant', avatar: '🧮' },
];

// Define the roles and their permissions
const rolePermissions = {
  boss: {
    canCreateTasks: true,
    canAssignRoles: true,
    canViewReports: true,
    canManageProperties: true,
    canManageUsers: true,
    canApproveExpenses: true,
    canManageSettings: true,
    dashboardAccess: ['statistics', 'tasks', 'properties', 'staff', 'finances'],
    navigationItems: ['dashboard', 'tasks', 'properties', 'notifications', 'users', 'reports', 'settings']
  },
  manager: {
    canCreateTasks: true,
    canAssignRoles: false,
    canViewReports: true,
    canManageProperties: true,
    canManageUsers: false,
    canApproveExpenses: true,
    canManageSettings: false,
    dashboardAccess: ['statistics', 'tasks', 'properties', 'staff'],
    navigationItems: ['dashboard', 'tasks', 'properties', 'notifications', 'reports']
  },
  host: {
    canCreateTasks: false,
    canAssignRoles: false,
    canViewReports: false,
    canManageProperties: true,
    canManageUsers: false,
    canApproveExpenses: false,
    canManageSettings: false,
    dashboardAccess: ['tasks', 'properties'],
    navigationItems: ['dashboard', 'tasks', 'properties', 'notifications']
  },
  cleaner: {
    canCreateTasks: false,
    canAssignRoles: false,
    canViewReports: false,
    canManageProperties: false,
    canManageUsers: false,
    canApproveExpenses: false,
    canManageSettings: false,
    dashboardAccess: ['tasks'],
    navigationItems: ['dashboard', 'tasks', 'notifications']
  },
  receptionist: {
    canCreateTasks: false,
    canAssignRoles: false,
    canViewReports: false,
    canManageProperties: true,
    canManageUsers: false,
    canApproveExpenses: false,
    canManageSettings: false,
    dashboardAccess: ['tasks', 'properties'],
    navigationItems: ['dashboard', 'tasks', 'properties', 'notifications']
  },
  sales: {
    canCreateTasks: false,
    canAssignRoles: false,
    canViewReports: true,
    canManageProperties: false,
    canManageUsers: false,
    canApproveExpenses: false,
    canManageSettings: false,
    dashboardAccess: ['statistics', 'finances'],
    navigationItems: ['dashboard', 'reports', 'notifications']
  },
  accountant: {
    canCreateTasks: false,
    canAssignRoles: false,
    canViewReports: true,
    canManageProperties: false,
    canManageUsers: false,
    canApproveExpenses: true,
    canManageSettings: false,
    dashboardAccess: ['finances'],
    navigationItems: ['dashboard', 'reports', 'notifications']
  }
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  // Initialize state from localStorage if available
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Update localStorage when user changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  /**
   * Authenticate user with username and password
   * @param {string} username - The user's username
   * @param {string} password - The user's password
   * @returns {Promise} - Resolves with user object if login successful
   */
  const login = async (username, password) => {
    setLoading(true);
    setError('');
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Find user in mock data
      const user = mockUsers.find(
        user => user.username === username && user.password === password
      );
      
      if (!user) {
        throw new Error('Invalid username or password');
      }
      
      // Add permissions based on role
      const userWithPermissions = {
        ...user,
        permissions: rolePermissions[user.role] || {}
      };
      
      setCurrentUser(userWithPermissions);
      return userWithPermissions;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout the current user
   */
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  /**
   * Check if user has a specific permission
   * @param {string} permission - The permission to check
   * @returns {boolean} - Whether the user has the permission
   */
  const hasPermission = (permission) => {
    if (!currentUser || !currentUser.permissions) return false;
    return !!currentUser.permissions[permission];
  };

  /**
   * Get navigation items based on user role
   * @returns {Array} - Navigation items the user can access
   */
  const getNavigationItems = () => {
    if (!currentUser || !currentUser.permissions) return [];
    return currentUser.permissions.navigationItems || [];
  };

  /**
   * Get dashboard widgets the user can access
   * @returns {Array} - Dashboard widgets the user can access
   */
  const getDashboardAccess = () => {
    if (!currentUser || !currentUser.permissions) return [];
    return currentUser.permissions.dashboardAccess || [];
  };

  // Context value
  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    hasPermission,
    getNavigationItems,
    getDashboardAccess
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;