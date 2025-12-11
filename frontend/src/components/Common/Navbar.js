import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ProfileModal from '../Profile/ProfileModal';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = async () => {
    await logout(navigate);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">
            ꍡ
          </div>
          <span className="logo-text">VachoLink</span>
        </Link>

        {/* Mobile menu button */}
        <button 
          className="mobile-menu-button"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          aria-label="Toggle menu"
        >
          <div className={`menu-icon ${showMobileMenu ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>

        {/* Desktop navigation */}
        <div className={`navbar-menu ${showMobileMenu ? 'open' : ''}`}>
          {user ? (
            <>
              {/* User profile */}
              <div 
                className="user-profile"
                onClick={() => {
                  setShowProfileModal(true);
                  setShowMobileMenu(false);
                }}
              >
                <img
                  src={user.profilePhoto || `https://ui-avatars.com/api/?name=${user.name}&background=7289da&color=fff`}
                  alt={user.name}
                  className="user-avatar"
                />
                <span className="user-name">{user.name}</span>
              </div>

              {/* Action buttons */}
              <div className="navbar-actions">
                <button 
                  className="nav-button profile-button"
                  onClick={() => {
                    setShowProfileModal(true);
                    setShowMobileMenu(false);
                  }}
                >
                  Profile
                </button>
                <button 
                  className="nav-button logout-button"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link 
                to="/login" 
                className="nav-button login-button"
                onClick={() => setShowMobileMenu(false)}
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="nav-button signup-button"
                onClick={() => setShowMobileMenu(false)}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      <style>{`
        /* Base navbar styles */
        .navbar {
          background: #202225;
          height: 48px;
          padding: 0 16px;
          display: flex;
          align-items: center;
          border-bottom: 1px solid #2f3136;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .navbar-container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
        }

        /* Logo */
        .navbar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          flex-shrink: 0;
        }

        .logo-icon {
          background: linear-gradient(135deg, black 0%, white 100%);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 20px;
        }

        .logo-text {
          color: #ffffff;
          font-size: 18px;
          font-weight: 700;
          font-family: "'Ginto', 'Whitney', sans-serif";
          white-space: nowrap;
        }

        /* Mobile menu button */
        .mobile-menu-button {
          display: none;
          background: transparent;
          border: none;
          padding: 8px;
          cursor: pointer;
          z-index: 1001;
        }

        .menu-icon {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          width: 24px;
          height: 18px;
        }

        .menu-icon span {
          display: block;
          height: 2px;
          width: 100%;
          background: #ffffff;
          border-radius: 1px;
          transition: all 0.3s;
        }

        .menu-icon.open span:nth-child(1) {
          transform: rotate(45deg) translate(6px, 6px);
        }

        .menu-icon.open span:nth-child(2) {
          opacity: 0;
        }

        .menu-icon.open span:nth-child(3) {
          transform: rotate(-45deg) translate(6px, -6px);
        }

        /* Navigation menu */
        .navbar-menu {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        /* User profile */
        .user-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .user-profile:hover {
          background-color: #2f3136;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #7289da;
        }

        .user-name {
          color: #ffffff;
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 150px;
        }

        /* Action buttons */
        .navbar-actions, .auth-buttons {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nav-button {
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          border: none;
          min-height: 32px;
          white-space: nowrap;
        }

        .profile-button {
          background: transparent;
          color: #b9bbbe;
          border: 1px solid #4f545c;
        }

        .profile-button:hover {
          background: #4f545c;
          color: #ffffff;
        }

        .logout-button {
          background: #f04747;
          color: white;
          border: none;
        }

        .logout-button:hover {
          background: #d84040;
        }

        .login-button {
          background: transparent;
          color: #b9bbbe;
          border: 1px solid #4f545c;
        }

        .login-button:hover {
          background: #4f545c;
          color: #ffffff;
        }

        .signup-button {
          background: #7289da;
          color: white;
          border: none;
        }

        .signup-button:hover {
          background: #677bc4;
        }

        /* Animations */
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }

        /* Mobile styles */
        @media (max-width: 768px) {
          .navbar {
            padding: 0 12px;
            height: auto;
            min-height: 48px;
          }

          .mobile-menu-button {
            display: block;
          }

          .navbar-menu {
            position: fixed;
            top: 48px;
            left: 0;
            right: 0;
            background: #202225;
            flex-direction: column;
            align-items: stretch;
            padding: 20px;
            gap: 20px;
            border-top: 1px solid #2f3136;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            transform: translateY(-100%);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s;
            z-index: 999;
          }

          .navbar-menu.open {
            transform: translateY(0);
            opacity: 1;
            visibility: visible;
          }

          .user-profile {
            justify-content: center;
            padding: 12px;
            background: #2f3136;
            border-radius: 6px;
          }

          .user-name {
            max-width: none;
          }

          .navbar-actions, .auth-buttons {
            flex-direction: column;
            width: 100%;
            gap: 12px;
          }

          .nav-button {
            width: 100%;
            padding: 10px 16px;
            font-size: 15px;
            min-height: 40px;
            text-align: center;
          }

          .logo-text {
            font-size: 16px;
          }
        }

        /* Tablet styles */
        @media (min-width: 769px) and (max-width: 1024px) {
          .navbar-container {
            max-width: 100%;
            padding: 0 20px;
          }

          .user-name {
            max-width: 120px;
          }
        }

        /* Small mobile */
        @media (max-width: 480px) {
          .navbar {
            padding: 0 10px;
          }

          .logo-text {
            font-size: 15px;
          }

          .logo-icon {
            width: 28px;
            height: 28px;
            font-size: 18px;
          }

          .navbar-menu {
            top: 48px;
          }
        }

        /* Large screens */
        @media (min-width: 1200px) {
          .navbar-container {
            max-width: 1200px;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;