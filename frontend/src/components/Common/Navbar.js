import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ProfileModal from '../Profile/ProfileModal';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleLogout = async () => {
    await logout(navigate); // Pass navigate function
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <div className="brand-logo">ꍡ</div>
          <span className="brand-text">VachoLink</span>
        </Link>

        {user ? (
          <div className="navbar-user">
            <div className="user-info" onClick={() => setShowProfileModal(true)}>
              <img
                src={user.profilePhoto || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                alt={user.name}
                className="user-avatar"
              />
              <span className="user-name">{user.name}</span>
            </div>

            <div className="navbar-actions">
              <button 
                className="nav-button secondary"
                onClick={() => setShowProfileModal(true)}
              >
                Profile
              </button>
              <button 
                className="nav-button primary"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="navbar-actions">
            <Link to="/login" className="nav-button secondary">
              Login
            </Link>
            <Link to="/register" className="nav-button primary">
              Sign Up
            </Link>
          </div>
        )}
      </div>

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </nav>
  );
};

export default Navbar;