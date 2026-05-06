import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

const ForgotPassword = () => {
  const [step, setStep] = useState(0); // 0: Email, 1: OTP + Reset
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [stars, setStars] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const starCount = 50;
    const newStars = [];
    for (let i = 0; i < starCount; i++) {
      newStars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        duration: Math.random() * 3 + 1
      });
    }
    setStars(newStars);
  }, []);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
      if (response.data.success) {
        toast.success('Reset OTP sent to your email');
        setStep(1);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/auth/reset-password`, {
        email,
        otp,
        newPassword
      });
      if (response.data.success) {
        toast.success(user ? 'Password reset successfully!' : 'Password reset successfully! You can now login.');
        navigate(user ? '/' : '/login');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-stars">
        {stars.map(star => (
          <div key={star.id} className="auth-star" style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDuration: `${star.duration}s`
          }} />
        ))}
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🔐</div>
          <h2>Forgot Password</h2>
          <p>Recover your account access</p>
        </div>

        {step === 0 ? (
          <form onSubmit={handleSendOtp} className="auth-form">
            <div className="auth-input-group">
              <label>YOUR EMAIL</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Enter your registered email"
                required 
              />
            </div>
            <button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Processing...' : 'Send Recovery OTP'}
            </button>
            <Link to={user ? "/profile" : "/login"} className="auth-back-btn">
              {user ? "Back to Profile" : "Back to Login"}
            </Link>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="auth-form">
            <p className="step-info">Enter the 6-digit code sent to {email}</p>
            <div className="auth-input-group">
              <label>RECOVERY OTP</label>
              <input 
                type="text" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)} 
                placeholder="Check your email"
                maxLength="6"
                required 
              />
            </div>
            <div className="auth-input-group">
              <label>NEW PASSWORD</label>
              <div className="auth-password-wrapper">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  placeholder="Min 6 characters"
                  required 
                />
                <button 
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>
            <div className="auth-input-group">
              <label>CONFIRM NEW PASSWORD</label>
              <div className="auth-password-wrapper">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  placeholder="Repeat new password"
                  required 
                />
                <button 
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Resetting...' : 'Update Password'}
            </button>
            <button type="button" onClick={() => setStep(0)} className="auth-back-btn">
              Change Email
            </button>
          </form>
        )}
      </div>

      <style>{`
        /* Reuse styles from Register/Login */
        .auth-container {
          min-height: 100vh;
          background: #0a0a0a;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          overflow: hidden;
          padding: 20px;
        }
        .auth-stars { position: absolute; inset: 0; pointer-events: none; }
        .auth-star {
          position: absolute;
          background: white;
          border-radius: 50%;
          animation: twinkle infinite alternate ease-in-out;
        }
        @keyframes twinkle {
          from { opacity: 0.2; transform: scale(1); }
          to { opacity: 0.8; transform: scale(1.2); }
        }
        .auth-card {
          width: 100%;
          max-width: 420px;
          background: rgba(32, 34, 37, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(114, 137, 218, 0.2);
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
          z-index: 10;
        }
        .auth-header { text-align: center; margin-bottom: 30px; }
        .auth-logo { font-size: 40px; color: #7289da; margin-bottom: 10px; }
        .auth-header h2 { color: white; margin: 0; font-size: 24px; }
        .auth-header p { color: #b9bbbe; margin: 5px 0 0; font-size: 14px; }
        .auth-form { display: flex; flex-direction: column; gap: 20px; }
        .auth-input-group { display: flex; flex-direction: column; gap: 8px; }
        .auth-input-group label { color: #8e9297; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; }
        .auth-input-group input { background: #202225; border: 1px solid transparent; border-radius: 6px; padding: 12px; color: #dcddde; font-size: 15px; }
        .auth-input-group input:focus { border-color: #7289da; outline: none; }

        .auth-password-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .auth-password-wrapper input {
          width: 100%;
        }

        .auth-password-toggle {
          position: absolute;
          right: 12px;
          background: transparent;
          border: none;
          color: #8e9297;
          cursor: pointer;
          font-size: 18px;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
          z-index: 2;
        }

        .auth-password-toggle:hover {
          color: #7289da;
        }

        .auth-button { background: #7289da; color: white; border: none; border-radius: 6px; padding: 14px; font-size: 15px; font-weight: 600; cursor: pointer; }
        .auth-button:hover:not(:disabled) { background: #5b6eae; }
        .auth-back-btn { background: transparent; color: #b9bbbe; border: none; font-size: 13px; cursor: pointer; text-align: center; text-decoration: none; margin-top: 10px;}
        .step-info { text-align: center; color: #b9bbbe; font-size: 14px; margin-bottom: 0; }
      `}</style>
    </div>
  );
};

export default ForgotPassword;
