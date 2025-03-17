import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Mobile-Optimized Bottom Navigation Component
 * Self-constraining width with proper positioning context
 */
const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getNavigationItems } = useAuth();
  
  // Get navigation items based on user role
  const navigationItems = getNavigationItems();
  
  // Navigation items configuration with icons
  const navConfig = {
    dashboard: {
      label: 'Dashboard',
      icon: '📊',
      path: '/dashboard',
    },
    tasks: {
      label: 'Tasks',
      icon: '✓',
      path: '/tasks',
    },
    properties: {
      label: 'Properties',
      icon: '🏠',
      path: '/properties',
    },
    notifications: {
      label: 'Alerts',
      icon: '🔔',
      path: '/notifications',
    },
    users: {
      label: 'Users',
      icon: '👥',
      path: '/users',
    },
    reports: {
      label: 'Reports',
      icon: '📈',
      path: '/reports',
    },
    settings: {
      label: 'Settings',
      icon: '⚙️',
      path: '/settings',
    },
  };
  
  // Navigation items to display (maximum 5)
  const displayItems = navigationItems.slice(0, 5);
  
  // Check if a path is active
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  // Handle navigation
  const handleNavigation = (path) => {
    navigate(path);
  };
  
  return (
    <nav className="absolute bottom-0 left-0 right-0 h-[var(--footer-height)] bg-white border-t border-neutral-200 z-[var(--z-index-fixed)]">
      <div className="flex justify-between items-center h-full max-w-[480px] mx-auto">
        {displayItems.map((item) => {
          const config = navConfig[item];
          if (!config) return null;
          
          const active = isActive(config.path);
          
          return (
            <button
              key={item}
              className={`bottom-nav-item ${active ? 'bottom-nav-item-active' : ''}`}
              onClick={() => handleNavigation(config.path)}
            >
              <span className="text-xl mb-1">{config.icon}</span>
              <span className="text-xs mt-0.5 font-medium">{config.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;