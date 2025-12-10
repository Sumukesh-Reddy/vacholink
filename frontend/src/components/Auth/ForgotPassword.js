import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const API_URL = 'https://vacholink.onrender.com' || process.env.REACT_APP_API_URL;

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/auth/forgot-password`, {
        email
      });

      if (response.data.success) {
        setEmailSent(true);
        toast.success('Password reset email sent!');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      {/* Background pattern - simplified for mobile */}
      <div className="forgot-bg-pattern" />
      
      {/* Main form */}
      <div className="forgot-form-container">
        {/* Glow effect */}
        <div className="forgot-glow" />
        
        {/* Header */}
        <h2 className="forgot-title">Reset Password</h2>
        
        <p className="forgot-subtitle">
          {emailSent 
            ? 'Check your email for reset instructions'
            : 'Enter your email to receive a reset link'
          }
        </p>

        {/* Form or success message */}
        {!emailSent ? (
          <form onSubmit={handleSubmit} className="forgot-form">
            <div className="forgot-form-group">
              <label htmlFor="email" className="forgot-label">EMAIL</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="forgot-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="forgot-button"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <div className="forgot-success">
            <p className="forgot-success-text">
              We've sent password reset instructions to your email.
            </p>
            <p className="forgot-success-hint">
              Check your inbox and follow the link to reset your password.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="forgot-footer">
          <p className="forgot-footer-text">
            Remember your password?{' '}
            <Link to="/login" className="forgot-link">
              Back to Login
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        /* Base styles */
        .forgot-container {
          min-height: 100vh;
          background: #0a0a0a;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          position: relative;
        }

        .forgot-bg-pattern {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: radial-gradient(white, rgba(255,255,255,.2) 2px, transparent 40px), 
                          radial-gradient(white, rgba(255,255,255,.15) 1px, transparent 30px);
          background-size: 550px 550px, 350px 350px;
          background-position: 0 0, 40px 60px;
          opacity: 0.1;
          pointer-events: none;
        }

        .forgot-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%);
          pointer-events: none;
          animation: twinkle 3s infinite alternate;
        }

        /* Form container */
        .forgot-form-container {
          background: #2f3136;
          border-radius: 8px;
          padding: 40px;
          width: 100%;
          max-width: 480px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          border: 1px solid #202225;
          position: relative;
          overflow: hidden;
        }

        /* Header */
        .forgot-title {
          color: #ffffff;
          font-size: 28px;
          font-weight: 700;
          text-align: center;
          margin-bottom: 10px;
          font-family: "'Ginto', 'Whitney', 'Helvetica Neue', Helvetica, Arial, sans-serif";
        }

        .forgot-subtitle {
          text-align: center;
          color: #b9bbbe;
          margin-bottom: 30px;
          font-size: 14px;
          line-height: 1.5;
        }

        /* Form elements */
        .forgot-form {
          margin-bottom: 20px;
        }

        .forgot-form-group {
          margin-bottom: 20px;
        }

        .forgot-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #8e9297;
          font-size: 12px;
          text-transform: uppercase;
        }

        .forgot-input {
          width: 100%;
          padding: 12px;
          background: #202225;
          border: 1px solid #202225;
          border-radius: 4px;
          color: #dcddde;
          font-size: 16px;
          transition: all 0.2s;
          box-sizing: border-box;
        }

        .forgot-input:focus {
          border-color: #7289da;
          outline: none;
        }

        /* Button */
        .forgot-button {
          width: 100%;
          padding: 12px;
          background: #7289da;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: "'Whitney', 'Helvetica Neue', Helvetica, Arial, sans-serif";
          min-height: 44px;
        }

        .forgot-button:disabled {
          background: #677bc4;
          cursor: not-allowed;
        }

        .forgot-button:not(:disabled):hover {
          background: #677bc4;
        }

        /* Success message */
        .forgot-success {
          background: #2f3136;
          border: 1px solid #202225;
          border-radius: 4px;
          padding: 20px;
          margin-bottom: 20px;
          text-align: center;
        }

        .forgot-success-text {
          color: #ffffff;
          margin-bottom: 10px;
        }

        .forgot-success-hint {
          color: #b9bbbe;
          font-size: 14px;
        }

        /* Footer */
        .forgot-footer {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #202225;
        }

        .forgot-footer-text {
          color: #8e9297;
          font-size: 14px;
        }

        .forgot-link {
          color: #7289da;
          text-decoration: none;
          font-weight: 600;
        }

        .forgot-link:hover {
          text-decoration: underline;
        }

        /* Animations */
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }

        /* Mobile styles */
        @media (max-width: 768px) {
          .forgot-container {
            padding: 10px;
            align-items: flex-start;
            padding-top: 40px;
          }

          .forgot-form-container {
            padding: 30px 25px;
            max-width: 100%;
            margin: 0 15px;
            border-radius: 8px;
          }

          .forgot-title {
            font-size: 22px;
            margin-bottom: 8px;
          }

          .forgot-subtitle {
            font-size: 13px;
            margin-bottom: 25px;
          }

          .forgot-input {
            padding: 10px;
            font-size: 15px;
          }

          .forgot-button {
            padding: 10px;
            font-size: 15px;
            min-height: 42px;
          }

          .forgot-success {
            padding: 15px;
          }

          .forgot-success-text {
            font-size: 14px;
          }

          .forgot-success-hint {
            font-size: 13px;
          }

          .forgot-footer-text {
            font-size: 13px;
          }

          .forgot-bg-pattern {
            background-size: 300px 300px, 200px 200px;
            opacity: 0.05;
          }
        }

        /* Small mobile */
        @media (max-width: 480px) {
          .forgot-form-container {
            padding: 25px 20px;
            margin: 0 10px;
          }

          .forgot-title {
            font-size: 20px;
          }

          .forgot-input {
            padding: 9px;
            font-size: 14px;
          }

          .forgot-button {
            padding: 9px;
            font-size: 14px;
            min-height: 40px;
          }
        }

        /* Large screens */
        @media (min-width: 1200px) {
          .forgot-form-container {
            max-width: 500px;
            padding: 50px;
          }
        }

        
        @media screen and (max-width: 768px) {
          input, select, textarea {
            font-size: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;
