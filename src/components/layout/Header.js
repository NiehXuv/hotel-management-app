import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {useLocation} from 'react-router-dom';
import Button from '../common/Button';
import { HiChevronLeft } from 'react-icons/hi';

/**
 * Mobile-Optimized Header Component
 * Precisely contained within application boundaries with proper stacking context
 */
const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const toggleMenu = () => setMenuOpen(prevState => !prevState);
  const closeMenu = () => setMenuOpen(false);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
    closeMenu();
  };
  
  const goToProfile = () => {
    navigate('/profile');
    closeMenu();
  };

  //mapping back
  // const parentMap = {
  //   '/properties': '/dashboard',
  //   '/reports' :'/dashboard',
  // }
  // const currentPath = location.pathname;
  // const backTarget = parentMap[currentPath];
  // const showBackButton = !!backTarget;


  //history back
  const showBackButton = location.pathname !== '/dashboard';
  
  const formatRole = (role) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };
  
  return (
    <nav className=" top-0 left-0 right-0 h-[var(--footer-height)] bg-white border-t border-neutral-200 ">
      <div className="flex justify-between items-center h-full px-md max-w-[480px] mx-auto">
        {/* App Logo/Title */}
        <div className="flex flex-col items-start gap-1">
          <h1 className="text-lg font-semibold text-primary">Inspirest Booking</h1>

            {showBackButton && (
              <Button
                onClick={() => navigate(-1)} // ← History back
                className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-400 hover:bg-gray-100 transition"
                aria-label="Back"
                
              >
                 <HiChevronLeft className="text-2xl" />
              </Button>
            )}
          </div>

        
        {/* User Profile Button */}
        <button 
          className="flex items-center"
          onClick={toggleMenu}
          aria-label="User menu"
        >
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white mr-2">
            {currentUser?.avatar || currentUser?.name?.charAt(0) || 'U'}
          </div>
          
          <div className="text-left mr-1">
            <p className="text-sm font-medium line-clamp-1">{currentUser?.name || 'User'}</p>
            <p className="text-xs text-neutral-500">{formatRole(currentUser?.role || 'user')}</p>
          </div>
        </button>
      </div>
      
      {/* User Menu Dropdown - Constrained to mobile width */}
      {menuOpen && (
        <div className="absolute top-[var(--header-height)] right-0 left-0 mx-auto max-w-[480px] z-20">
          <div className="w-48 ml-auto bg-white shadow-lg rounded-b-md py-1 border border-t-0 border-neutral-200">
            <button 
              className="w-full text-middle px-4 py-2 text-sm hover:bg-neutral-100 rounded-xl"
              onClick={goToProfile}
            >
              Profile
            </button>
            
            <div className="border-b border-neutral-200 my-1"></div>
            
            <button 
              className="w-full text-middle px-4 py-2 text-sm text-error hover:bg-neutral-100"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      )}
      
      {/* Overlay to capture clicks outside menu */}
      {menuOpen && (
        <div 
          className="fixed inset-0 z-10 bg-transparent" 
          onClick={closeMenu}
        ></div>
      )}
    </nav>
  );
};

export default Header;