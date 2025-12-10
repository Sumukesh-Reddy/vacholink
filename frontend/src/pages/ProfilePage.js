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
    <div className="profile-container">
      
      <div className="profile-bg-pattern" />
      
      <div className="profile-content">
        <div className="profile-header">
          <h1 className="profile-title">My Profile</h1>
          <button 
            className="profile-edit-button"
            onClick={() => setShowProfileModal(true)}
          >
            Edit Profile
          </button>
        </div>

        <div className="profile-card">
          <div className="profile-info">
            <div className="profile-image-container">
              <img
                src={user.profilePhoto || `https://ui-avatars.com/api/?name=${user.name}&background=7289da&color=fff`}
                alt={user.name}
                className="profile-image"
              />
            </div>

            <div className="profile-details">
              <h2 className="profile-name">{user.name}</h2>
              <p className="profile-email">{user.email}</p>
              
              {user.bio && (
                <div className="profile-bio">
                  <h3 className="bio-title">Bio</h3>
                  <p className="bio-text">{user.bio}</p>
                </div>
              )}

              <div className="profile-stats">
                <div className="stat-item">
                  <div className="stat-label">Account Type</div>
                  <div className="stat-value">{user.accountType}</div>
                </div>
                
                <div className="stat-item">
                  <div className="stat-label">Status</div>
                  <div className="stat-status">
                    <div className={`status-dot ${user.online ? 'online' : 'offline'}`} />
                    {user.online ? 'Online' : 'Offline'}
                  </div>
                </div>
                
                <div className="stat-item">
                  <div className="stat-label">Joined</div>
                  <div className="stat-value">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
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

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      <style>{`
        /* Base styles */
        .profile-container {
          min-height: calc(100vh - 48px);
          background: #0a0a0a;
          padding: 40px 20px;
          position: relative;
        }

        .profile-bg-pattern {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: radial-gradient(white, rgba(255,255,255,.2) 2px, transparent 40px),
                          radial-gradient(white, rgba(255,255,255,.15) 1px, transparent 30px);
          background-size: 550px 550px, 350px 350px;
          background-position: 0 0, 40px 60px;
          pointer-events: none;
          animation: twinkle 3s infinite alternate;
        }

        .profile-content {
          max-width: 800px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        /* Header */
        .profile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .profile-title {
          color: #ffffff;
          font-size: 32px;
          font-weight: 700;
          font-family: "'Ginto', sans-serif";
          margin: 0;
        }

        .profile-edit-button {
          background: #7289da;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          min-height: 40px;
        }

        .profile-edit-button:hover {
          background: #677bc4;
        }

        /* Profile card */
        .profile-card {
          background: #2f3136;
          border-radius: 8px;
          border: 1px solid #202225;
          overflow: hidden;
          margin-bottom: 20px;
        }

        .profile-info {
          display: flex;
          padding: 30px;
          gap: 30px;
          align-items: flex-start;
        }

        .profile-image-container {
          flex-shrink: 0;
        }

        .profile-image {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid #7289da;
        }

        .profile-details {
          flex: 1;
        }

        .profile-name {
          color: #ffffff;
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
          margin-top: 0;
        }

        .profile-email {
          color: #b9bbbe;
          font-size: 16px;
          margin-bottom: 20px;
        }

        /* Bio section */
        .profile-bio {
          margin-bottom: 20px;
        }

        .bio-title {
          color: #ffffff;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 8px;
          margin-top: 0;
        }

        .bio-text {
          color: #dcddde;
          font-size: 14px;
          line-height: 1.5;
          margin: 0;
        }

        /* Stats grid */
        .profile-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .stat-item {
          background: #202225;
          padding: 16px;
          border-radius: 6px;
        }

        .stat-label {
          color: #8e9297;
          font-size: 12px;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .stat-value {
          color: #ffffff;
          font-size: 16px;
          font-weight: 600;
        }

        .stat-status {
          color: #ffffff;
          font-size: 16px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .status-dot.online {
          background: #3ba55d;
        }

        .status-dot.offline {
          background: #747f8d;
        }

        /* Action buttons */
        .profile-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .action-button {
          padding: 12px 24px;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          min-height: 44px;
          border: none;
        }

        .action-button.primary {
          background: #7289da;
          color: white;
        }

        .action-button.primary:hover {
          background: #677bc4;
        }

        .action-button.secondary {
          background: transparent;
          color: #b9bbbe;
          border: 1px solid #4f545c;
        }

        .action-button.secondary:hover {
          background: #4f545c;
          color: #ffffff;
        }

        /* Animations */
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }

        /* Mobile styles */
        @media (max-width: 768px) {
          .profile-container {
            padding: 20px 15px;
          }

          .profile-info {
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 25px 20px;
            gap: 25px;
          }

          .profile-image {
            width: 120px;
            height: 120px;
          }

          .profile-name {
            font-size: 24px;
          }

          .profile-email {
            font-size: 15px;
          }

          .profile-stats {
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .profile-actions {
            flex-direction: column;
            width: 100%;
          }

          .action-button {
            width: 100%;
            padding: 10px 20px;
          }
        }

        @media (max-width: 480px) {
          .profile-container {
            padding: 15px 10px;
          }

          .profile-header {
            flex-direction: column;
            align-items: stretch;
            gap: 15px;
          }

          .profile-title {
            font-size: 24px;
            text-align: center;
          }

          .profile-edit-button {
            width: 100%;
          }

          .profile-info {
            padding: 20px 15px;
            gap: 20px;
          }

          .profile-image {
            width: 100px;
            height: 100px;
            border-width: 3px;
          }

          .profile-name {
            font-size: 20px;
          }

          .profile-email {
            font-size: 14px;
          }

          .bio-title {
            font-size: 15px;
          }

          .bio-text {
            font-size: 13px;
          }

          .stat-item {
            padding: 12px;
          }

          .stat-label {
            font-size: 11px;
          }

          .stat-value, .stat-status {
            font-size: 14px;
          }
        }

        /* Tablet styles */
        @media (min-width: 769px) and (max-width: 1024px) {
          .profile-content {
            max-width: 90%;
          }

          .profile-info {
            padding: 25px;
            gap: 25px;
          }

          .profile-image {
            width: 130px;
            height: 130px;
          }

          .profile-name {
            font-size: 24px;
          }
        }

        /* Large screens */
        @media (min-width: 1200px) {
          .profile-content {
            max-width: 900px;
          }
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;
