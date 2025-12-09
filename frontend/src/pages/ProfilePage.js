import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import ProfileModal from '../components/Profile/ProfileModal';

const ProfilePage = () => {
  const { user } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);

  if (!user) {
    return null;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>My Profile</h1>
          <button 
            className="edit-profile-button"
            onClick={() => setShowProfileModal(true)}
          >
            Edit Profile
          </button>
        </div>

        <div className="profile-content">
          <div className="profile-card">
            <div className="profile-photo-section">
              <img
                src={user.profilePhoto || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                alt={user.name}
                className="profile-photo-large"
              />
            </div>

            <div className="profile-info">
              <h2>{user.name}</h2>
              <p className="profile-email">{user.email}</p>
              
              {user.bio && (
                <div className="profile-bio">
                  <h3>Bio</h3>
                  <p>{user.bio}</p>
                </div>
              )}

              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-label">Account Type</span>
                  <span className="stat-value">{user.accountType}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Status</span>
                  <span className={`stat-value ${user.online ? 'online' : 'offline'}`}>
                    {user.online ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Joined</span>
                  <span className="stat-value">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-actions">
            <button 
              className="action-button primary"
              onClick={() => setShowProfileModal(true)}
            >
              Edit Profile
            </button>
            <button 
              className="action-button secondary"
              onClick={() => toast.info('This feature is coming soon!')}
            >
              Account Settings
            </button>
          </div>
        </div>
      </div>

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
};

export default ProfilePage;