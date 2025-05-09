// AppRoutes.js
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
import Customer from '../pages/Customer';
import CreateProperty from '../pages/CreateProperty';
import Booking from '../pages/Booking';
import Menu from '../pages/Menu';
import Property from '../pages/Property';
import Room from '../pages/Room'; 
import CreateAccount from '../pages/CreateAccount'; 
import RoomMap from '../pages/RoomMap';
import RoomDetail from '../pages/RoomDetail';
import PricingPolicy from '../pages/PricingPolicy';

const ProtectedRoute = ({ children, requiredPermission = null }) => {
  const { currentUser, hasPermission } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/create-account" element={<CreateAccount />} />

      {/* Protected Routes */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Navigate to="/dashboard" replace />
          </ProtectedRoute>
        } 
      />
      <Route path="/pricingpolicy" element={<PricingPolicy />} />
      <Route 
        path="/pricingpolicy/:hotelId" 
        element={
          <ProtectedRoute>
            <PricingPolicy />
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
        path="/roommap" 
        element={
          <ProtectedRoute>
            <RoomMap />
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
        path="/hotels/:hotelId/rooms/:roomId" 
        element={
          <ProtectedRoute>
            <RoomDetail />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/booking" 
        element={
          <ProtectedRoute>
            <Booking />
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
        path="/hotel/create" 
        element={
          <ProtectedRoute>
            <CreateProperty />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/menu" 
        element={
          <ProtectedRoute>
            <Menu />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/customer" 
        element={
          <ProtectedRoute>
            <Customer />
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
        path="/properties" 
        element={
          <ProtectedRoute>
            <Properties />
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
      
      <Route 
        path="/property" 
        element={
          <ProtectedRoute>
            <Property />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/properties/:hotelId/rooms" 
        element={
          <ProtectedRoute>
            <Room />
          </ProtectedRoute>
        } 
      />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;