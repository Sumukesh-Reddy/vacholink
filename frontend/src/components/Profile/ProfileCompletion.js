import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || "https://vacholink.onrender.com";

const ProfileCompletion = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [stars, setStars] = useState([]);
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();

  useEffect(() => {
    // Generate responsive stars
    const generateStars = () => {
      const isMobile = window.innerWidth <= 768;
      const starCount = isMobile ? 15 : 25;
      const newStars = [];
      for (let i = 0; i < starCount; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * (isMobile ? 1 : 1.5) + (isMobile ? 0.3 : 0.5),
          opacity: Math.random() * 0.15 + 0.1,
          delay: Math.random() * 3,
          duration: Math.random() * 2 + 1
        });
      }
      setStars(newStars);
    };
    
    generateStars();
    window.addEventListener('resize', generateStars);
    return () => window.removeEventListener('resize', generateStars);

    // Set initial name from Google profile
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password && password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!name.trim()) {
      toast.error('Display name is required');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${API_URL}/api/auth/complete-profile`,
        {
          name: name.trim(),
          password: password.trim() || undefined
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success('Profile completed successfully!');
        
        // Update user in context
        await updateProfile(response.data.user);
        
        navigate('/');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/');
    toast.info('You can update your profile later from settings');
  };

  return (
    <div className="profile-completion-container">
      {/* Background gradient */}
      <div className="pc-bg-gradient" />
      
      {/* Stars */}
      <div className="pc-stars">
        {stars.map(star => (
          <div
            key={star.id}
            className="pc-star"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animation: `pcTwinkle ${star.duration}s infinite ${star.delay}s alternate`,
            }}
          />
        ))}
      </div>
      
      {/* Glow effect */}
      <div className="pc-glow" />

      {/* Form container */}
      <div className="pc-form-container">
        {/* Inner glow */}
        <div className="pc-inner-glow" />
        
        {/* Header */}
        <div className="pc-header">
          <div className="pc-logo">
            ⚙️
          </div>
          <h2 className="pc-title">Complete Your Profile</h2>
          <p className="pc-subtitle">
            Welcome to VachoLink! Let's set up your account
          </p>
        </div>

        {/* Profile info */}
        <div className="pc-profile-info">
          {user?.profilePhoto && (
            <img 
              src={user.profilePhoto} 
              alt="Profile" 
              className="pc-profile-photo"
            />
          )}
          <p className="pc-email">{user?.email}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="pc-form-group">
            <label htmlFor="name">DISPLAY NAME</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Choose a display name"
              required
              className="pc-input"
            />
            <div className="pc-hint">
              This is how others will see you
            </div>
          </div>

          <div className="pc-form-group">
            <label htmlFor="password">PASSWORD (OPTIONAL)</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Set a password for email login"
              className="pc-input"
            />
            <div className="pc-hint">
              Minimum 6 characters. Optional but recommended.
            </div>
          </div>

          {password && (
            <div className="pc-form-group">
              <label htmlFor="confirmPassword">CONFIRM PASSWORD</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="pc-input"
              />
            </div>
          )}

          <div className="pc-buttons">
            <button
              type="submit"
              disabled={loading}
              className="pc-submit-btn"
            >
              <div className="pc-button-glow" />
              <span className="pc-button-text">
                {loading ? 'Saving...' : 'Complete Setup'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleSkip}
              className="pc-skip-btn"
            >
              Skip for now
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="pc-footer">
          <p className="pc-footer-text">
            You can update these settings anytime from your profile
          </p>
        </div>
      </div>

      <style>{`
        /* Base styles */
        .profile-completion-container {
          min-height: 100vh;
          background: #0a0a0a;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          position: relative;
          overflow: hidden;
        }

        .pc-bg-gradient {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(ellipse at center, #1a1c22 0%, #0a0a0a 70%);
          pointer-events: none;
        }

        .pc-stars {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
        }

        .pc-star {
          position: absolute;
          background: #ffffff;
          border-radius: 50%;
          filter: blur(0.3px);
        }

        .pc-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 193, 7, 0.05) 0%, transparent 70%);
          filter: blur(30px);
          animation: pcPulse 6s ease-in-out infinite alternate;
          pointer-events: none;
        }

        /* Form container */
        .pc-form-container {
          background: rgba(47, 49, 54, 0.85);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 40px;
          width: 100%;
          max-width: 450px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(32, 34, 37, 0.5);
          position: relative;
          z-index: 1;
        }

        .pc-inner-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 12px;
          background: radial-gradient(circle at 50% 0%, rgba(255, 193, 7, 0.1), transparent 70%);
          pointer-events: none;
        }

        /* Header */
        .pc-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .pc-logo {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 70px;
          height: 70px;
          background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
          border-radius: 50%;
          color: white;
          font-weight: bold;
          font-size: 32px;
          margin-bottom: 20px;
          box-shadow: 0 0 25px rgba(255, 152, 0, 0.4);
        }

        .pc-title {
          color: #ffffff;
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 10px;
          font-family: "'Ginto', sans-serif";
          text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }

        .pc-subtitle {
          text-align: center;
          color: #b9bbbe;
          font-size: 14px;
          line-height: 1.5;
        }

        /* Profile info */
        .pc-profile-info {
          text-align: center;
          margin-bottom: 30px;
          padding: 20px;
          background: rgba(32, 34, 37, 0.5);
          border-radius: 8px;
          border: 1px solid rgba(32, 34, 37, 0.8);
        }

        .pc-profile-photo {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          object-fit: cover;
          margin-bottom: 15px;
          border: 3px solid rgba(255, 193, 7, 0.3);
        }

        .pc-email {
          color: #8e9297;
          font-size: 14px;
          word-break: break-all;
          margin: 0;
        }

        /* Form elements */
        .pc-form-group {
          margin-bottom: 20px;
        }

        .pc-form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #8e9297;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .pc-input {
          width: 100%;
          padding: 14px;
          background: rgba(32, 34, 37, 0.7);
          border: 1px solid rgba(32, 34, 37, 0.5);
          border-radius: 6px;
          color: #dcddde;
          font-size: 15px;
          transition: all 0.3s;
          outline: none;
          box-sizing: border-box;
        }

        .pc-input:focus {
          border-color: #ff9800;
          box-shadow: 0 0 0 2px rgba(255, 152, 0, 0.2);
          background: rgba(32, 34, 37, 0.9);
        }

        .pc-hint {
          color: #8e9297;
          font-size: 12px;
          margin-top: 6px;
          padding-left: 4px;
        }

        /* Buttons */
        .pc-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 30px;
        }

        .pc-submit-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          font-family: "'Whitney', sans-serif";
          position: relative;
          overflow: hidden;
          min-height: 48px;
        }

        .pc-submit-btn:disabled {
          background: #f57c00;
          cursor: not-allowed;
        }

        .pc-submit-btn:not(:disabled):hover {
          transform: translateY(-2px);
        }

        .pc-button-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: pcButtonGlow 2s infinite;
        }

        .pc-submit-btn:disabled .pc-button-glow {
          animation: none;
        }

        .pc-button-text {
          position: relative;
          z-index: 1;
        }

        .pc-skip-btn {
          width: 100%;
          padding: 14px;
          background: transparent;
          color: #8e9297;
          border: 1px solid rgba(32, 34, 37, 0.8);
          border-radius: 6px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
          font-family: "'Whitney', sans-serif";
        }

        .pc-skip-btn:hover {
          background: rgba(32, 34, 37, 0.5);
          color: #b9bbbe;
        }

        /* Footer */
        .pc-footer {
          text-align: center;
          padding-top: 24px;
          margin-top: 30px;
          border-top: 1px solid rgba(32, 34, 37, 0.5);
        }

        .pc-footer-text {
          color: #8e9297;
          font-size: 12px;
          margin: 0;
          opacity: 0.8;
        }

        /* Animations */
        @keyframes pcTwinkle {
          0%, 100% { 
            opacity: 0.1; 
            transform: scale(1);
          }
          50% { 
            opacity: 0.2; 
            transform: scale(1.2);
          }
        }
        
        @keyframes pcPulse {
          0%, 100% { 
            opacity: 0.03;
            transform: translate(-50%, -50%) scale(1);
          }
          50% { 
            opacity: 0.08;
            transform: translate(-50%, -50%) scale(1.1);
          }
        }
        
        @keyframes pcButtonGlow {
          0%, 100% { 
            opacity: 0.3;
            transform: scale(1);
          }
          50% { 
            opacity: 0.5;
            transform: scale(1.1);
          }
        }

        /* Mobile styles */
        @media (max-width: 768px) {
          .profile-completion-container {
            padding: 10px;
            align-items: flex-start;
            padding-top: 40px;
          }

          .pc-form-container {
            padding: 30px 25px;
            max-width: 100%;
            margin: 0 15px;
            border-radius: 10px;
          }

          .pc-glow {
            width: 200px;
            height: 200px;
            filter: blur(20px);
          }

          .pc-logo {
            width: 60px;
            height: 60px;
            font-size: 28px;
            margin-bottom: 16px;
          }

          .pc-title {
            font-size: 20px;
          }

          .pc-subtitle {
            font-size: 13px;
          }

          .pc-profile-photo {
            width: 60px;
            height: 60px;
          }

          .pc-email {
            font-size: 13px;
          }

          .pc-input {
            padding: 12px;
            font-size: 14px;
          }

          .pc-submit-btn,
          .pc-skip-btn {
            padding: 12px;
            font-size: 14px;
            min-height: 44px;
          }

          .pc-footer-text {
            font-size: 11px;
          }
        }

        /* Small mobile */
        @media (max-width: 480px) {
          .pc-form-container {
            padding: 25px 20px;
            margin: 0 10px;
          }

          .pc-logo {
            width: 55px;
            height: 55px;
            font-size: 26px;
            margin-bottom: 14px;
          }

          .pc-title {
            font-size: 18px;
          }

          .pc-profile-photo {
            width: 50px;
            height: 50px;
          }

          .pc-input {
            padding: 11px;
            font-size: 13px;
          }

          .pc-submit-btn,
          .pc-skip-btn {
            padding: 11px;
            font-size: 13px;
            min-height: 42px;
          }
        }

        /* Prevent zoom on iOS input focus */
        @media screen and (max-width: 768px) {
          input, select, textarea {
            font-size: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ProfileCompletion;