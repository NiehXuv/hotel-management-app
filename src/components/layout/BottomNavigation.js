import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getNavigationItems } = useAuth();
  
  const navigationItems = getNavigationItems();
  
  const navConfig = {
    dashboard: { label: 'Dashboard', icon: '📊', path: '/dashboard' },
    tasks: { label: 'Calendar', icon: '📅', path: '/calendar' },
    properties: { label: 'Add', icon: '🏠', path: '/add' },
    notifications: { label: 'Alerts', icon: '🔔', path: '/notifications' },
    users: { label: 'Users', icon: '👥', path: '/users' },
    reports: { label: 'Reports', icon: '📈', path: '/reports' },
    settings: { label: 'Settings', icon: '⚙️', path: '/settings' },
  };
  
  const sideItems = navigationItems.filter(item => item !== 'properties').slice(0, 4);
  const leftItems = sideItems.slice(0, 2); // Dashboard, Calendar
  const rightItems = sideItems.slice(2, 4); // Alerts, Users
  
  const isActive = (path) => location.pathname === path;
  const handleNavigation = (path) => navigate(path);

  const getStyles = () => {
    const isSmallScreen = window.innerWidth < 360;
    const isLargeScreen = window.innerWidth > 480;

    // Calculate button sizes
    const sideButtonWidth = isSmallScreen ? '50px' : '60px';
    const centerButtonWidth = isSmallScreen ? '5.5rem' : '6.5rem'; // Kept as 5.5rem/6.5rem (88px/104px)

    return {
      nav: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: isSmallScreen ? '60px' : 'var(--footer-height, 70px)',
        backgroundColor: '#fff',
        borderTop: '1px solid #e5e7eb',
        zIndex: 1000,
        width: '100%',
        maxWidth: isLargeScreen ? '480px' : '100%',
        margin: isLargeScreen ? '0 auto' : 0,
      },
      container: {
        display: 'flex',
        justifyContent: 'space-between', // Equal spacing between all items
        alignItems: 'center',
        height: '100%',
        width: '100%',
        padding: '0 10px', // Consistent padding
        position: 'relative',
        boxSizing: 'border-box',
      },
      navItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: sideButtonWidth,
        padding: isSmallScreen ? '4px' : '6px',
        color: '#666',
        transition: 'color 0.2s',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
      },
      navItemActive: {
        color: '#3b82f6',
      },
      navItemIcon: {
        fontSize: isSmallScreen ? '1rem' : '1.25rem',
        marginBottom: isSmallScreen ? '0.125rem' : '0.25rem',
      },
      navItemLabel: {
        fontSize: isSmallScreen ? '0.65rem' : '0.75rem',
        marginTop: '0.125rem',
        fontWeight: 500,
        display: 'block',
      },
      centerButton: {
        width: centerButtonWidth,
        height: centerButtonWidth, // Keep it circular
        backgroundColor: '#000000',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center', // Center vertically
        justifyContent: 'center', // Center horizontally
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        border: 'none',
        cursor: 'pointer',
      },
      centerIcon: {
        fontSize: isSmallScreen ? '4.5rem' : '5rem', // Increased from 4rem/4.5rem (72px/80px)
        color: '#fff',
        marginTop: isSmallScreen ? '-0.25rem' : '-0.5rem', // Slight upward shift
      }
    };
  };

  const [styles, setStyles] = React.useState(getStyles());

  React.useEffect(() => {
    const handleResize = () => setStyles(getStyles());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        {/* Left Side Items */}
        {leftItems.map((item) => {
          const config = navConfig[item];
          if (!config) return null;
          const active = isActive(config.path);
          
          return (
            <button
              key={item}
              style={{
                ...styles.navItem,
                ...(active ? styles.navItemActive : {})
              }}
              onClick={() => handleNavigation(config.path)}
            >
              <span style={styles.navItemIcon}>{config.icon}</span>
              <span style={styles.navItemLabel}>{config.label}</span>
            </button>
          );
        })}

        {/* Center Circle Button with Larger and Slightly Upper "+" */}
        <button
          style={styles.centerButton}
          onClick={() => handleNavigation(navConfig.properties.path)}
          aria-label="Add"
        >
          <span style={styles.centerIcon}>+</span>
        </button>

        {/* Right Side Items */}
        {rightItems.map((item) => {
          const config = navConfig[item];
          if (!config) return null;
          const active = isActive(config.path);
          
          return (
            <button
              key={item}
              style={{
                ...styles.navItem,
                ...(active ? styles.navItemActive : {})
              }}
              onClick={() => handleNavigation(config.path)}
            >
              <span style={styles.navItemIcon}>{config.icon}</span>
              <span style={styles.navItemLabel}>{config.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;