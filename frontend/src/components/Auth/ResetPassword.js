import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || "https://vacholink.onrender.com";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [stars, setStars] = useState([]);

  const token = searchParams.get('token');

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
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      toast.error('Invalid reset link');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/auth/reset-password`, {
        token,
        newPassword
      });

      if (response.data.success) {
        toast.success('Password reset successful!');
        navigate('/login');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-container">
      {/* Background gradient */}
      <div className="reset-bg-gradient" />
      
      {/* Stars */}
      <div className="reset-stars">
        {stars.map(star => (
          <div
            key={star.id}
            className="reset-star"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animation: `resetTwinkle ${star.duration}s infinite ${star.delay}s alternate`,
            }}
          />
        ))}
      </div>
      
      {/* Glow effect */}
      <div className="reset-glow" />

      {/* Form container */}
      <div className="reset-form-container">
        {/* Inner glow */}
        <div className="reset-inner-glow" />
        
        {/* Header */}
        <div className="reset-header">
          <div className="reset-logo">
            🔒
          </div>
          <h2 className="reset-title">Reset Your Password</h2>
          <p className="reset-subtitle">
            Create a new password for your VachoLink account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="reset-form-group">
            <label htmlFor="newPassword">NEW PASSWORD</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your new password"
              required
              className="reset-input"
            />
            <div className="password-hint">
              Minimum 6 characters
            </div>
          </div>

          <div className="reset-form-group">
            <label htmlFor="confirmPassword">CONFIRM PASSWORD</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              required
              className="reset-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="reset-button"
          >
            <div className="reset-button-glow" />
            <span className="reset-button-text">
              {loading ? 'Resetting...' : 'Reset Password'}
            </span>
          </button>
        </form>

        {/* Footer */}
        <div className="reset-footer">
          <p>Remember your password?</p>
          <Link to="/login" className="reset-link">
            Back to Login
          </Link>
        </div>
      </div>

      <style>{`
        /* Base styles */
        .reset-container {
          min-height: 100vh;
          background: #0a0a0a;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          position: relative;
          overflow: hidden;
        }

        .reset-bg-gradient {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(ellipse at center, #1a1c22 0%, #0a0a0a 70%);
          pointer-events: none;
        }

        .reset-stars {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
        }

        .reset-star {
          position: absolute;
          background: #ffffff;
          border-radius: 50%;
          filter: blur(0.3px);
        }

        .reset-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(237, 66, 69, 0.05) 0%, transparent 70%);
          filter: blur(30px);
          animation: securityPulse 6s ease-in-out infinite alternate;
          pointer-events: none;
        }

        /* Form container */
        .reset-form-container {
          background: rgba(47, 49, 54, 0.85);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 40px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(32, 34, 37, 0.5);
          position: relative;
          z-index: 1;
        }

        .reset-inner-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 12px;
          background: radial-gradient(circle at 50% 0%, rgba(237, 66, 69, 0.1), transparent 70%);
          pointer-events: none;
        }

        /* Header */
        .reset-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .reset-logo {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 70px;
          height: 70px;
          background: linear-gradient(135deg, #ed4245 0%, #d84040 100%);
          border-radius: 50%;
          color: white;
          font-weight: bold;
          font-size: 32px;
          margin-bottom: 20px;
          box-shadow: 0 0 25px rgba(237, 66, 69, 0.4);
        }

        .reset-title {
          color: #ffffff;
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 10px;
          font-family: "'Ginto', sans-serif";
          text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }

        .reset-subtitle {
          text-align: center;
          color: #b9bbbe;
          font-size: 14px;
          line-height: 1.5;
        }

        /* Form elements */
        .reset-form-group {
          margin-bottom: 20px;
        }

        .reset-form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #8e9297;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .reset-input {
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

        .reset-input:focus {
          border-color: #ed4245;
          box-shadow: 0 0 0 2px rgba(237, 66, 69, 0.2);
          background: rgba(32, 34, 37, 0.9);
        }

        .password-hint {
          color: #8e9297;
          font-size: 12px;
          margin-top: 6px;
          padding-left: 4px;
        }

        /* Button */
        .reset-button {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #ed4245 0%, #d84040 100%);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          font-family: "'Whitney', sans-serif";
          margin-bottom: 24px;
          position: relative;
          overflow: hidden;
          min-height: 48px;
        }

        .reset-button:disabled {
          background: #d84040;
          cursor: not-allowed;
        }

        .reset-button:not(:disabled):hover {
          transform: translateY(-2px);
        }

        .reset-button-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: resetButtonGlow 2s infinite;
        }

        .reset-button:disabled .reset-button-glow {
          animation: none;
        }

        .reset-button-text {
          position: relative;
          z-index: 1;
        }

        /* Footer */
        .reset-footer {
          text-align: center;
          padding-top: 24px;
          border-top: 1px solid rgba(32, 34, 37, 0.5);
        }

        .reset-footer p {
          color: #8e9297;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .reset-link {
          color: #7289da;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s;
          display: inline-block;
          padding: 8px 16px;
          border-radius: 4px;
        }

        .reset-link:hover {
          background: rgba(114, 137, 218, 0.1);
          transform: translateY(-1px);
        }

        /* Animations */
        @keyframes resetTwinkle {
          0%, 100% { 
            opacity: 0.1; 
            transform: scale(1);
          }
          50% { 
            opacity: 0.2; 
            transform: scale(1.2);
          }
        }
        
        @keyframes securityPulse {
          0%, 100% { 
            opacity: 0.03;
            transform: translate(-50%, -50%) scale(1);
          }
          50% { 
            opacity: 0.08;
            transform: translate(-50%, -50%) scale(1.1);
          }
        }
        
        @keyframes resetButtonGlow {
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
          .reset-container {
            padding: 10px;
            align-items: flex-start;
            padding-top: 40px;
          }

          .reset-form-container {
            padding: 30px 25px;
            max-width: 100%;
            margin: 0 15px;
            border-radius: 10px;
          }

          .reset-glow {
            width: 200px;
            height: 200px;
            filter: blur(20px);
          }

          .reset-logo {
            width: 60px;
            height: 60px;
            font-size: 28px;
            margin-bottom: 16px;
          }

          .reset-title {
            font-size: 20px;
          }

          .reset-subtitle {
            font-size: 13px;
          }

          .reset-input {
            padding: 12px;
            font-size: 14px;
          }

          .reset-button {
            padding: 12px;
            font-size: 14px;
            min-height: 44px;
          }

          .reset-link {
            padding: 6px 12px;
            font-size: 13px;
          }
        }

        /* Small mobile */
        @media (max-width: 480px) {
          .reset-form-container {
            padding: 25px 20px;
            margin: 0 10px;
          }

          .reset-logo {
            width: 55px;
            height: 55px;
            font-size: 26px;
            margin-bottom: 14px;
          }

          .reset-title {
            font-size: 18px;
          }

          .reset-input {
            padding: 11px;
            font-size: 13px;
          }

          .reset-button {
            padding: 11px;
            font-size: 13px;
            min-height: 42px;
          }
        }

        /* Large screens */
        @media (min-width: 1200px) {
          .reset-form-container {
            max-width: 450px;
            padding: 50px;
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

export default ResetPassword;
