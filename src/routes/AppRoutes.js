import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Pages
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Tasks from '../pages/Tasks';
import TaskDetails from '../pages/TaskDetails';
import CreateTask from '../pages/CreateTask';
import Properties from '../pages/Properties';
import PropertyDetails from '../pages/PropertyDetails';
import Users from '../pages/Users';
import Notifications from '../pages/Notifications';
import Reports from '../pages/Reports';
import Settings from '../pages/Settings';
import Profile from '../pages/Profile';
import NotFound from '../pages/NotFound';
import ResetPassword from '../pages/ResetPassword';
import Calendar from '../pages/Calendar';
import CreateRoom from '../pages/CreateRoom';
import Add from '../pages/Add';
import CreateBooking from '../pages/CreateBooking';

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ children, requiredPermission = null }) => {
  const { currentUser, hasPermission } = useAuth();
  
  // Check if user is authenticated
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if user has required permission (if specified)
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

/**
 * Main Application Routes
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
     

      {/* Protected Routes */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Navigate to="/dashboard" replace />
          </ProtectedRoute>
        } 
      />
      
      
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/hotel/createroom" 
        element={
          <ProtectedRoute>
            <CreateRoom />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/booking/create" 
        element={
          <ProtectedRoute>
            <CreateBooking />
          </ProtectedRoute>
        } 
      />
      
      
      <Route 
        path="/calendar" 
        element={
          <ProtectedRoute>
            <Calendar />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/tasks" 
        element={
          <ProtectedRoute>
            <Tasks />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/tasks/:id" 
        element={
          <ProtectedRoute>
            <TaskDetails />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/tasks/create" 
        element={
          <ProtectedRoute requiredPermission="canCreateTasks">
            <CreateTask />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/add" 
        element={
          <ProtectedRoute>
            <Add />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/properties/:id" 
        element={
          <ProtectedRoute>
            <PropertyDetails />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/users" 
        element={
          <ProtectedRoute requiredPermission="canManageUsers">
            <Users />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/notifications" 
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/reports" 
        element={
          <ProtectedRoute requiredPermission="canViewReports">
            <Reports />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute requiredPermission="canManageSettings">
            <Settings />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      
      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;