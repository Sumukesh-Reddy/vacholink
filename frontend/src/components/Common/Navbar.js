import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ProfileModal from '../Profile/ProfileModal';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleLogout = async () => {
    await logout(navigate);
  };

  return (
    <nav style={{
      background: '#202225',
      height: '48px',
      padding: '0 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid #2f3136',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <Link to="/" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        textDecoration: 'none'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, black 0%, white 100%)',
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '20px'
        }}>ꍡ</div>
        <span style={{
          color: '#ffffff',
          fontSize: '18px',
          fontWeight: '700',
          fontFamily: "'Ginto', 'Whitney', sans-serif"
        }}>VachoLink</span>
      </Link>

      {user ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '4px',
              transition: 'background-color 0.2s'
            }}
            onClick={() => setShowProfileModal(true)}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#2f3136'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <img
              src={user.profilePhoto || `https://ui-avatars.com/api/?name=${user.name}&background=7289da&color=fff`}
              alt={user.name}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #7289da'
              }}
            />
            <span style={{
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '500'
            }}>{user.name}</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <button 
              style={{
                background: 'transparent',
                color: '#b9bbbe',
                border: '1px solid #4f545c',
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#4f545c';
                e.target.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#b9bbbe';
              }}
              onClick={() => setShowProfileModal(true)}
            >
              Profile
            </button>
            <button 
              style={{
                background: '#f04747',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#d84040'}
              onMouseLeave={(e) => e.target.style.background = '#f04747'}
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Link to="/login" style={{
            background: 'transparent',
            color: '#b9bbbe',
            border: '1px solid #4f545c',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
            textDecoration: 'none'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#4f545c';
            e.target.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.color = '#b9bbbe';
          }}>
            Login
          </Link>
          <Link to="/register" style={{
            background: '#7289da',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
            textDecoration: 'none'
          }}
          onMouseEnter={(e) => e.target.style.background = '#677bc4'}
          onMouseLeave={(e) => e.target.style.background = '#7289da'}>
            Sign Up
          </Link>
        </div>
      )}

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;