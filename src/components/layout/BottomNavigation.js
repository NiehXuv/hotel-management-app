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

  // Define the five options explicitly
  const selectedItems = ['dashboard', 'tasks', 'properties', 'notifications', 'users'];
  const sideItems = selectedItems.filter((item) => item !== 'properties'); // Exclude the center "Add" button
  const leftItems = sideItems.slice(0, 2); // Dashboard, Calendar
  const rightItems = sideItems.slice(2, 4); // Alerts, Menu

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
      ? '3rem'
      : isSmallScreen
      ? '3rem'
      : isMediumScreen
      ? '4rem'
      : '4rem';

    const iconSize = isExtraSmallScreen
      ? '1.25rem'
      : isSmallScreen
      ? '1.5rem'
      : '1.75rem';

    const centerIconSize = isExtraSmallScreen
      ? '3rem'
      : isSmallScreen
      ? '3.5rem'
      : '4rem';

    const navHeight = isExtraSmallScreen
      ? '50px'
      : isSmallScreen
      ? '55px'
      : isMediumScreen
      ? '60px'
      : 'var(--footer-height, 70px)';

    const padding = isExtraSmallScreen ? '0 5px' : isSmallScreen ? '0 8px' : '0 10px';

    // Define pastel colors for each navigation item
    const pastelColors = {
      dashboard: {
        default: '#C3E6CB', // Pastel green
        active: '#A3D9B1',  // Slightly darker pastel green
        hover: '#D4EFDF',   // Slightly lighter pastel green
      },
      tasks: {
        default: '#D6BCFA', // Pastel purple
        active: '#B794F4',  // Slightly darker pastel purple
        hover: '#E2D6FA',   // Slightly lighter pastel purple
      },
      properties: {
        default: '#F9C2D1', // Pastel pink (for Add button)
        active: '#F4A1B8',  // Slightly darker pastel pink
        hover: '#FBDCE5',   // Slightly lighter pastel pink
      },
      notifications: {
        default: '#FEF9C3', // Pastel yellow
        active: '#FEF08A',  // Slightly darker pastel yellow
        hover: '#FEFCE8',   // Slightly lighter pastel yellow
      },
      users: {
        default: '#FED7AA', // Pastel orange
        active: '#FEC287',  // Slightly darker pastel orange
        hover: '#FFE4C4',   // Slightly lighter pastel orange
      },
    };

    return {
      nav: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: navHeight,
        backgroundColor: 'white', // Pastel blue background
        borderTop: '1px solid #d1e0f5', // Slightly darker pastel blue for border
        zIndex: 1000,
        width: '100vw',
        maxWidth: isLargeScreen ? '480px' : '100vw',
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
        borderRadius: '1em',
      },
      navItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: sideButtonWidth,
        padding: isExtraSmallScreen ? '2px' : isSmallScreen ? '3px' : '4px',
        transition: 'color 0.2s',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
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
        backgroundColor: pastelColors.properties.default, // Pastel pink for Add button
        borderRadius: '1em', // Rounded square
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
      },
      centerIcon: {
        fontSize: centerIconSize,
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

  // Define pastel colors for dynamic use in JSX
  const pastelColors = {
    dashboard: {
      default: 'black',
      active: '#FFD107',
      hover: '#D4EFDF',
    },
    tasks: {
      default: 'black',
      active: '#ADD8E6',
      hover: '#E2D6FA',
    },
    properties: {
      default: 'black',
      active: '#F4A1B8',
      hover: '#FBDCE5',
    },
    notifications: {
      default: 'black',
      active: '#F04770',
      hover: '#FEFCE8',
    },
    users: {
      default: 'black',
      active: '#06D7A0',
      hover: '#FFE4C4',
    },
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        {/* Left Side Items: Dashboard, Calendar */}
        {leftItems.map((item) => {
          const config = navConfig[item];
          if (!config) return null;
          const active = isActive(config.path);

          return (
            <button
              key={item}
              style={{
                ...styles.navItem,
                color: active ? pastelColors[item].active : pastelColors[item].default,
              }}
              onClick={() => handleNavigation(config.path)}
              onMouseOver={(e) => !active && (e.currentTarget.style.color = pastelColors[item].hover)}
              onMouseOut={(e) => !active && (e.currentTarget.style.color = pastelColors[item].default)}
            >
              <span style={{ ...styles.navItemIcon, color: active ? pastelColors[item].active : pastelColors[item].default }}>
                {config.icon}
              </span>
              <span style={{ ...styles.navItemLabel, color: active ? pastelColors[item].active : pastelColors[item].default }}>
                {config.label}
              </span>
            </button>
          );
        })}

        {/* Center "Add" Button */}
        <button
          style={{
            ...styles.centerButton,
            backgroundColor: isActive(navConfig.properties.path)
              ? pastelColors.properties.active
              : pastelColors.properties.default,
          }}
          onClick={() => handleNavigation(navConfig.properties.path)}
          onMouseOver={(e) => !isActive(navConfig.properties.path) && (e.currentTarget.style.backgroundColor = pastelColors.properties.hover)}
          onMouseOut={(e) => !isActive(navConfig.properties.path) && (e.currentTarget.style.backgroundColor = pastelColors.properties.default)}
          aria-label="Add"
        >
          <span style={styles.centerIcon}>{navConfig.properties.icon}</span>
        </button>

        {/* Right Side Items: Alerts, Menu */}
        {rightItems.map((item) => {
          const config = navConfig[item];
          if (!config) return null;
          const active = isActive(config.path);

          return (
            <button
              key={item}
              style={{
                ...styles.navItem,
                color: active ? pastelColors[item].active : pastelColors[item].default,
              }}
              onClick={() => handleNavigation(config.path)}
              onMouseOver={(e) => !active && (e.currentTarget.style.color = pastelColors[item].hover)}
              onMouseOut={(e) => !active && (e.currentTarget.style.color = pastelColors[item].default)}
            >
              <span style={{ ...styles.navItemIcon, color: active ? pastelColors[item].active : pastelColors[item].default }}>
                {config.icon}
              </span>
              <span style={{ ...styles.navItemLabel, color: active ? pastelColors[item].active : pastelColors[item].default }}>
                {config.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;