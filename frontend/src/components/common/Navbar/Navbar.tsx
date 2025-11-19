import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const toggleDropdown = () => {
    console.log('Dropdown toggled, current state:', dropdownOpen); // Debug log
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Close dropdown on route change
  useEffect(() => {
    setDropdownOpen(false);
  }, [location]);

  // Get display name from user
  const displayName = user 
    ? `${user.firstName} ${user.lastName}`.trim() || user.email.split('@')[0]
    : 'User';

  console.log('Navbar render - isAuthenticated:', isAuthenticated, 'user:', user); // Debug log

  return (
    <header className="navbar-container">
      <nav className="navbar">
        <Link to={isAuthenticated ? "/dashboard" : "/"} className="logo">
          <span className="logo-icon">🌟</span>
          <span className="logo-text">Constellation Tracker</span>
        </Link>

        {isAuthenticated ? (
          <>
            <ul className="nav-links">
              <li>
                <Link 
                  to="/dashboard" 
                  className={location.pathname === '/dashboard' ? 'active' : ''}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  to="/constellations"
                  className={location.pathname.startsWith('/constellations') ? 'active' : ''}
                >
                  Constellations
                </Link>
              </li>
              <li>
                <Link 
                  to="/observations"
                  className={location.pathname === '/observations' ? 'active' : ''}
                >
                  Observations
                </Link>
              </li>
            </ul>

            <div className="user-menu" ref={dropdownRef}>
              <button 
                className="user-button" 
                onClick={toggleDropdown}
                type="button"
              >
                <span className="user-avatar">👤</span>
                <span className="user-name">{displayName}</span>
                <span className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`}>▼</span>
              </button>
              
              {dropdownOpen && (
                <div className="dropdown-menu" style={{ display: 'block' }}>
                  <button 
                    className="dropdown-item logout" 
                    onClick={handleLogout}
                    type="button"
                  >
                    <span className="dropdown-icon">🚪</span>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <ul className="nav-links">
            <li>
              <Link 
                to="/login"
                className={location.pathname === '/login' ? 'active' : ''}
              >
                Login
              </Link>
            </li>
            <li>
              <Link 
                to="/register" 
                className={`register-btn ${location.pathname === '/register' ? 'active' : ''}`}
              >
                Register
              </Link>
            </li>
          </ul>
        )}
      </nav>
    </header>
  );
};

export default Navbar;