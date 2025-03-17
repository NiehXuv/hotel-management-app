import React from 'react';
import { useLocation } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import Header from './components/layout/Header';
import BottomNavigation from './components/layout/BottomNavigation';
import { useAuth } from './contexts/AuthContext';

/**
 * Main Application Component with properly constrained mobile layout
 * Ensures header and footer remain within the mobile container bounds
 */
function App() {
  const { currentUser } = useAuth();
  const location = useLocation();
  
  // Check if current route is login page
  const isLoginPage = location.pathname === '/login';
  
  return (
    <div className="mobile-app">
      {/* Show header only if user is logged in */}
      {currentUser && !isLoginPage && <Header />}
      
      {/* Main content area */}
      <main className={`app-content ${isLoginPage ? 'login-page' : ''}`}>
        <AppRoutes />
      </main>
      
      {/* Show bottom navigation only if user is logged in */}
      {currentUser && !isLoginPage && <BottomNavigation />}
    </div>
  );
}

export default App;