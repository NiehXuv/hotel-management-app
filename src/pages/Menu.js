import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/common/Card';

const Menu = () => {
  // Define an array of menu items with labels and paths
  const menuItems = [
    { label: 'Add New', path: '/add' },
    { label: 'Properties Setting', path: '/properties' },
    { label: 'Customer Setting', path: '/customer' },
    { label: 'Booking Setting', path: '/booking' },
    { label: 'User Setting', path: '/user' },
    { label: 'Financial Report', path: '/financial' },
  ];

  // Container styles to maintain layout consistency
  const styles = {
    container: {
      width: '30em',
      margin: 'auto',
      padding: '3rem',
      paddingBottom: 'calc(1rem + var(--footer-height))',
      minHeight: '100vh',
      boxSizing: 'border-box',
    },
  };

  return (
    <div style={styles.container}>
      {menuItems.map((item) => (
        <Card
          key={item.path}
          className="shadow-lg rounded-lg border border-neutral-200 mb-4"
          bodyClassName="p-4 sm:p-6"
        >
          <Link
            to={item.path}
            style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
          >
            {item.label}
          </Link>
        </Card>
      ))}
    </div>
  );
};

export default Menu;