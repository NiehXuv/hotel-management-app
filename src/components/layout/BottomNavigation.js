import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  MdDashboard,
  MdCalendarToday,
  MdAddBox,
  MdNotifications,
  MdMenu,
  MdAssessment,
  MdSettings,
} from 'react-icons/md';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getNavigationItems } = useAuth();

  const navigationItems = getNavigationItems();

  const navConfig = {
    dashboard: { label: 'Dashboard', icon: <MdDashboard />, path: '/dashboard' },
    tasks: { label: 'Calendar', icon: <MdCalendarToday />, path: '/calendar' },
    properties: { label: 'Add', icon: <MdAddBox />, path: '/add' },
    notifications: { label: 'Alerts', icon: <MdNotifications />, path: '/notifications' },
    users: { label: 'Menu', icon: <MdMenu />, path: '/menu' },
    reports: { label: 'Reports', icon: <MdAssessment />, path: '/reports' },
    settings: { label: 'Settings', icon: <MdSettings />, path: '/settings' },
  };

  const sideItems = navigationItems.filter((item) => item !== 'properties').slice(0, 4);
  const leftItems = sideItems.slice(0, 2); // Dashboard, Calendar
  const rightItems = sideItems.slice(2, 4); // Alerts, Users

  const isActive = (path) => location.pathname === path;
  const handleNavigation = (path) => navigate(path);

  const getStyles = () => {
    const windowWidth = window.innerWidth;
    const isExtraSmallScreen = windowWidth < 320;
    const isSmallScreen = windowWidth >= 320 && windowWidth < 360;
    const isMediumScreen = windowWidth >= 360 && windowWidth <= 480;
    const isLargeScreen = windowWidth > 480;

    const sideButtonWidth = isExtraSmallScreen
      ? '40px'
      : isSmallScreen
      ? '45px'
      : isMediumScreen
      ? '50px'
      : '60px';

    const centerButtonSize = isExtraSmallScreen
      ? '3.5rem'
      : isSmallScreen
      ? '4rem'
      : isMediumScreen
      ? '4.5rem'
      : '5.5rem';

    const iconSize = isExtraSmallScreen
      ? '1.25rem'
      : isSmallScreen
      ? '1.5rem'
      : '1.75rem';

    // Increased centerIconSize for a bigger icon
    const centerIconSize = isExtraSmallScreen
      ? '3rem'    // Was 2.5rem, increased by 0.5rem
      : isSmallScreen
      ? '3.5rem'  // Was 3rem, increased by 0.5rem
      : '4rem';   // Was 3.5rem, increased by 0.5rem

    const navHeight = isExtraSmallScreen
      ? '50px'
      : isSmallScreen
      ? '55px'
      : isMediumScreen
      ? '60px'
      : 'var(--footer-height, 70px)';

    const padding = isExtraSmallScreen ? '0 5px' : isSmallScreen ? '0 8px' : '0 10px';

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
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '100%',
        width: '100%',
        padding: padding,
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
        fontSize: iconSize,
        marginBottom: isExtraSmallScreen ? '0.1rem' : '0.125rem',
      },
      navItemLabel: {
        fontSize: isExtraSmallScreen ? '0.6rem' : isSmallScreen ? '0.65rem' : '0.75rem',
        marginTop: '0.125rem',
        fontWeight: 500,
        display: 'block',
      },
      centerButton: {
        width: centerButtonSize,
        height: centerButtonSize,
        backgroundColor: '#000000',
        borderRadius: '12px', // Rounded square
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        border: 'none',
        cursor: 'pointer',
      },
      centerIcon: {
        fontSize: centerIconSize, // Applies the larger size
        color: '#fff',
      },
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
                ...(active ? styles.navItemActive : {}),
              }}
              onClick={() => handleNavigation(config.path)}
            >
              <span style={styles.navItemIcon}>{config.icon}</span>
              <span style={styles.navItemLabel}>{config.label}</span>
            </button>
          );
        })}

        {/* Center Rounded Square Button with Bigger Icon */}
        <button
          style={styles.centerButton}
          onClick={() => handleNavigation(navConfig.properties.path)}
          aria-label="Add"
        >
          <span style={styles.centerIcon}>{navConfig.properties.icon}</span>
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
                ...(active ? styles.navItemActive : {}),
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