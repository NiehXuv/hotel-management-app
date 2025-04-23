// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { database } from '../config/firebaseconfig';
import bcrypt from 'bcryptjs';

// Create the Authentication Context
const AuthContext = createContext();

// Define the roles and their permissions (exported)
export const rolePermissions = {
  boss: {
    canCreateTasks: true,
    canAssignRoles: true,
    canViewReports: true,
    canManageProperties: true,
    canManageUsers: true,
    canApproveExpenses: true,
    canManageSettings: true,
    canManagePricing: true, // Added permission for managing pricing policies
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
    canManagePricing: true, // Added permission for managers to manage pricing policies (optional)
    dashboardAccess: ['statistics', 'tasks', 'properties', 'staff'],
    navigationItems: ['dashboard', 'tasks', 'properties', 'notifications', 'reports']
  },
  receptionist: {
    canCreateTasks: false,
    canAssignRoles: false,
    canViewReports: false,
    canManageProperties: true,
    canManageUsers: false,
    canApproveExpenses: false,
    canManageSettings: false,
    canManagePricing: false, // Receptionists typically shouldn't manage pricing
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
    canManagePricing: false, // Sales role shouldn't manage pricing
    dashboardAccess: ['statistics', 'finances'],
    navigationItems: ['dashboard', 'reports', 'notifications']
  },
  // Default permissions for unknown roles
  default: {
    canCreateTasks: false,
    canAssignRoles: false,
    canViewReports: false,
    canManageProperties: false,
    canManageUsers: false,
    canApproveExpenses: false,
    canManageSettings: false,
    canManagePricing: false, // Default role has no pricing management access
    dashboardAccess: [],
    navigationItems: []
  }
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  const login = async (username, password) => {
    setLoading(true);
    setError('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const usersRef = ref(database, 'Users');
      const snapshot = await get(usersRef);
  
      if (!snapshot.exists()) {
        throw new Error('No users found');
      }
  
      let foundUser = null;
      const users = snapshot.val();
      
      for (const key in users) {
        if (users[key].username === username) {
          foundUser = users[key];
          break;
        }
      }
  
      if (!foundUser) {
        throw new Error('Invalid username');
      }
  
      const passwordMatch = await bcrypt.compare(password, foundUser.password);
      if (!passwordMatch) {
        throw new Error('Invalid password');
      }
  
      const userRole = foundUser.role;
      const userRoleLower = userRole.toLowerCase(); // Normalize role to lowercase
  
      const userWithPermissions = {
        id: Object.keys(users).find(key => users[key].username === username),
        username: username,
        name: username,
        role: userRole,
        avatar: getAvatarForRole(userRoleLower),
        permissions: rolePermissions[userRoleLower] || rolePermissions.default,
        email: foundUser.email,
        phoneNumber: foundUser.phoneNumber
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

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const hasPermission = (permission) => {
    if (!currentUser || !currentUser.permissions) return false;
    return !!currentUser.permissions[permission];
  };

  const getNavigationItems = () => {
    if (!currentUser || !currentUser.permissions) return [];
    return currentUser.permissions.navigationItems || [];
  };

  const getDashboardAccess = () => {
    if (!currentUser || !currentUser.permissions) return [];
    return currentUser.permissions.dashboardAccess || [];
  };

  const getAvatarForRole = (role) => {
    const roleMap = {
      boss: '👨‍💼',
      manager: '👩‍💼',
      receptionist: '💁‍♀️',
      sales: '📊'
    };
    return roleMap[role] || '👤';
  };

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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;