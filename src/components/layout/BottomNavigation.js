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
    users: { label: 'Menu', icon: '☰', path: '/menu' },
    reports: { label: 'Reports', icon: '📈', path: '/reports' },
    settings: { label: 'Settings', icon: '⚙️', path: '/settings' },
  };
  
  const sideItems = navigationItems.filter(item => item !== 'properties').slice(0, 4);
  const leftItems = sideItems.slice(0, 2); // Dashboard, Calendar
  const rightItems = sideItems.slice(2, 4); // Alerts, Users
  
  const isActive = (path) => location.pathname === path;
  const handleNavigation = (path) => navigate(path);

  const getStyles = () => {
    const windowWidth = window.innerWidth;
    const isExtraSmallScreen = windowWidth < 320; // Very small devices
    const isSmallScreen = windowWidth >= 320 && windowWidth < 360; // Small devices
    const isMediumScreen = windowWidth >= 360 && windowWidth <= 480; // Typical mobile
    const isLargeScreen = windowWidth > 480; // Larger than typical mobile

    // Dynamic sizing based on viewport width
    const sideButtonWidth = isExtraSmallScreen
      ? '40px'
      : isSmallScreen
      ? '45px'
      : isMediumScreen
      ? '50px'
      : '60px';

    const centerButtonWidth = isExtraSmallScreen
      ? '3.5rem' // 56px
      : isSmallScreen
      ? '4rem' // 64px
      : isMediumScreen
      ? '4.5rem' // 72px
      : '5.5rem'; // 88px

    const centerIconSize = isExtraSmallScreen
      ? '3.5rem' // 56px
      : isSmallScreen
      ? '4rem' // 64px
      : isMediumScreen
      ? '4.5rem' // 72px
      : '5rem'; // 80px

    const navHeight = isExtraSmallScreen
      ? '50px'
      : isSmallScreen
      ? '55px'
      : isMediumScreen
      ? '60px'
      : 'var(--footer-height, 70px)';

    const padding = isExtraSmallScreen
      ? '0 5px'
      : isSmallScreen
      ? '0 8px'
      : '0 10px';

    return {
      nav: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: navHeight,
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
        padding: padding, // Dynamic padding
        position: 'relative',
        boxSizing: 'border-box',
      },
      navItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: sideButtonWidth,
        padding: isExtraSmallScreen ? '2px' : isSmallScreen ? '3px' : '4px',
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
        fontSize: isExtraSmallScreen
          ? '0.875rem'
          : isSmallScreen
          ? '1rem'
          : '1.25rem',
        marginBottom: isExtraSmallScreen ? '0.1rem' : '0.125rem',
      },
      navItemLabel: {
        fontSize: isExtraSmallScreen
          ? '0.6rem'
          : isSmallScreen
          ? '0.65rem'
          : '0.75rem',
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
        fontSize: centerIconSize,
        color: '#fff',
        marginTop: isExtraSmallScreen
          ? '-0.15rem'
          : isSmallScreen
          ? '-0.2rem'
          : isMediumScreen
          ? '-0.25rem'
          : '-0.5rem', // Slight upward shift
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

        {/* Center Circle Button */}
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