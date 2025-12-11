import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const ChangePassword = ({ onClose, onSuccess }) => {
  const { changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [stars, setStars] = useState([]);

  useEffect(() => {
    // Generate stars for the background
    const generateStars = () => {
      const starCount = 150;
      const newStars = [];
      for (let i = 0; i < starCount; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.4 + 0.1,
          delay: Math.random() * 3,
          duration: Math.random() * 2 + 1
        });
      }
      setStars(newStars);
    };
    
    generateStars();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await changePassword(currentPassword, newPassword);
    setLoading(false);

    if (result.success) {
      onSuccess?.();
      onClose?.();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* Star background */}
      <div className="modal-stars-bg">
        {stars.map(star => (
          <div
            key={star.id}
            className="modal-star"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`
            }}
          />
        ))}
        <div className="modal-bg-overlay" />
      </div>

      <div className="modal-content password-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-content">
            <h3>Change Password</h3>
            <div className="modal-subtitle">
              Update your account password securely
            </div>
          </div>
          <button 
            className="modal-close" 
            onClick={onClose}
            onMouseEnter={(e) => {
              e.target.style.transform = 'rotate(90deg)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'rotate(0deg)';
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="currentPassword">
              <span className="label-icon">🔒</span>
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
              required
              className="password-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">
              <span className="label-icon">✨</span>
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your new password"
              required
              className="password-input"
            />
            <div className="password-hint">
              Password must be at least 6 characters
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">
              <span className="label-icon">✓</span>
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your new password"
              required
              className="password-input"
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Updating...
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        /* Modal overlay */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(4px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2000;
          padding: 20px;
        }

        /* Star background */
        .modal-stars-bg {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .modal-star {
          position: absolute;
          background: #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 4px rgba(255, 255, 255, 0.8);
          animation: starTwinkle infinite alternate;
          filter: blur(0.5px);
        }

        .modal-bg-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(ellipse at center, rgba(114, 137, 218, 0.1) 0%, rgba(47, 49, 54, 0.9) 100%);
          pointer-events: none;
        }

        /* Modal content */
        .modal-content.password-modal {
          background: #2f3136;
          border-radius: 12px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          border: 1px solid #202225;
          position: relative;
          z-index: 1;
          overflow: hidden;
          animation: modalSlideIn 0.3s ease-out;
        }

        /* Modal header */
        .modal-header {
          padding: 24px;
          border-bottom: 1px solid #202225;
          background: linear-gradient(135deg, #36393f 0%, #2f3136 100%);
          position: relative;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .modal-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 50% 0%, rgba(114, 137, 218, 0.1), transparent 70%);
          pointer-events: none;
        }

        .modal-header-content {
          flex: 1;
          position: relative;
          z-index: 1;
        }

        .modal-header h3 {
          color: #ffffff;
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 8px 0;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .modal-subtitle {
          color: #b9bbbe;
          font-size: 14px;
          margin: 0;
          line-height: 1.4;
        }

        .modal-close {
          background: transparent;
          border: none;
          font-size: 28px;
          cursor: pointer;
          color: #b9bbbe;
          padding: 0;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.3s;
          position: relative;
          z-index: 1;
          flex-shrink: 0;
          margin-left: 12px;
        }

        .modal-close:hover {
          background: #202225;
          color: #ffffff;
        }

        /* Form styles */
        .profile-form {
          padding: 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #b9bbbe;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 8px;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }

        .label-icon {
          font-size: 14px;
          opacity: 0.8;
          animation: iconPulse 2s infinite;
        }

        .password-input {
          width: 100%;
          padding: 14px 16px;
          background: #202225;
          border: 1px solid #202225;
          border-radius: 8px;
          color: #dcddde;
          font-size: 14px;
          transition: all 0.3s;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
          font-family: 'Whitney', sans-serif;
          box-sizing: border-box;
        }

        .password-input:focus {
          border-color: #7289da;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.2), 0 0 0 2px rgba(114, 137, 218, 0.3);
          outline: none;
        }

        .password-input::placeholder {
          color: #8e9297;
        }

        .password-hint {
          color: #8e9297;
          font-size: 12px;
          margin-top: 6px;
          padding-left: 4px;
          animation: fadeIn 0.3s ease-out;
        }

        /* Button styles */
        .modal-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #202225;
        }

        .secondary-button {
          flex: 1;
          background: transparent;
          border: 1px solid #202225;
          color: #b9bbbe;
          padding: 14px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          font-family: 'Whitney', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .secondary-button:hover:not(:disabled) {
          background: #202225;
          color: #ffffff;
          border-color: #7289da;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }

        .secondary-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .primary-button {
          flex: 1;
          background: linear-gradient(135deg, #7289da 0%, #5b6eae 100%);
          border: none;
          color: white;
          padding: 14px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          font-family: 'Whitney', sans-serif;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .primary-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .primary-button:hover:not(:disabled) {
          background: linear-gradient(135deg, #677bc4 0%, #4a5a95 100%);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(114, 137, 218, 0.4);
        }

        .primary-button:hover:not(:disabled)::before {
          opacity: 1;
        }

        .primary-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Loading spinner */
        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid #ffffff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        /* Animations */
        @keyframes starTwinkle {
          0%, 100% { 
            opacity: 0.2; 
            transform: scale(1);
          }
          50% { 
            opacity: 1; 
            transform: scale(1.2);
          }
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes iconPulse {
          0%, 100% { 
            opacity: 0.8;
            transform: scale(1);
          }
          50% { 
            opacity: 1;
            transform: scale(1.1);
          }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsive styles */
        @media (max-width: 480px) {
          .modal-content.password-modal {
            max-width: 100%;
            margin: 0 16px;
          }

          .modal-header {
            padding: 20px;
          }

          .modal-header h3 {
            font-size: 18px;
          }

          .modal-subtitle {
            font-size: 13px;
          }

          .profile-form {
            padding: 20px;
          }

          .form-group {
            margin-bottom: 16px;
          }

          .password-input {
            padding: 12px 14px;
            font-size: 13px;
          }

          .modal-actions {
            flex-direction: column;
            gap: 10px;
          }

          .secondary-button,
          .primary-button {
            padding: 12px;
            font-size: 13px;
          }
        }

        @media (min-width: 481px) and (max-width: 768px) {
          .modal-content.password-modal {
            max-width: 380px;
          }
        }
      `}</style>
    </div>
  );
};

export default ChangePassword;