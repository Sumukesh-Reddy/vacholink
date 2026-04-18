import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

const Register = () => {
  const [step, setStep] = useState(0); // 0: Email, 1: OTP, 2: Details
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [stars, setStars] = useState([]);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (user && !authLoading) {
      navigate('/profile', { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const generateStars = () => {
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
    };
    generateStars();
  }, []);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/auth/send-otp`, { email });
      if (response.data.success) {
        toast.success(response.data.message);
        setStep(1);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/auth/verify-otp`, { email, otp });
      if (response.data.success) {
        toast.success(response.data.message);
        setStep(2);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        name,
        email,
        password
      });
      if (response.data.success) {
        toast.success('Registration successful! Welcome to VachoLink.');
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/auth/google`, {
        credential: credentialResponse.credential
      });
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        if (response.data.needsProfileCompletion) {
          navigate('/complete-profile');
        } else {
          toast.success('Login successful!');
          navigate('/');
        }
      }
    } catch (error) {
      toast.error('Google signup failed');
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
          <div className="auth-logo">ꍡ</div>
          <h2>Join VachoLink</h2>
          <p>Create your secure account</p>
        </div>

        {step === 0 && (
          <form onSubmit={handleSendOtp} className="auth-form">
            <div className="auth-input-group">
              <label>EMAIL ADDRESS</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Enter your email"
                required 
              />
            </div>
            <button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Sending OTP...' : 'Send Verification OTP'}
            </button>
            
            <div className="auth-divider"><span>OR</span></div>
            
            <div className="google-btn-wrapper">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Google login failed')}
                theme="filled_black"
                shape="pill"
                text="signup_with"
              />
            </div>
          </form>
        )}

        {step === 1 && (
          <form onSubmit={handleVerifyOtp} className="auth-form">
            <p className="step-info">OTP sent to <strong>{email}</strong></p>
            <div className="auth-input-group">
              <label>ENTER OTP</label>
              <input 
                type="text" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)} 
                placeholder="6-digit code"
                maxLength="6"
                required 
              />
            </div>
            <button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
            <button type="button" onClick={() => setStep(0)} className="auth-back-btn">
              Back to Email
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSignup} className="auth-form">
            <div className="auth-input-group">
              <label>DISPLAY NAME</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="How others see you"
                required 
              />
            </div>
            <div className="auth-input-group">
              <label>CREATE PASSWORD</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="At least 6 characters"
                required 
              />
            </div>
            <div className="auth-input-group">
              <label>CONFIRM PASSWORD</label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                placeholder="Repeat password"
                required 
              />
            </div>
            <button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Creating Account...' : 'Complete Signup'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Sign In</Link></p>
        </div>
      </div>

      <style>{`
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

        .auth-stars {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

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
          position: relative;
          z-index: 10;
        }

        .auth-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .auth-logo {
          font-size: 40px;
          color: #7289da;
          margin-bottom: 10px;
        }

        .auth-header h2 {
          color: white;
          margin: 0;
          font-size: 24px;
        }

        .auth-header p {
          color: #b9bbbe;
          margin: 5px 0 0;
          font-size: 14px;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .auth-input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .auth-input-group label {
          color: #8e9297;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .auth-input-group input {
          background: #202225;
          border: 1px solid transparent;
          border-radius: 6px;
          padding: 12px;
          color: #dcddde;
          font-size: 15px;
          transition: 0.2s;
        }

        .auth-input-group input:focus {
          border-color: #7289da;
          outline: none;
        }

        .auth-button {
          background: #7289da;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 14px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
        }

        .auth-button:hover:not(:disabled) {
          background: #5b6eae;
        }

        .auth-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .auth-back-btn {
          background: transparent;
          color: #b9bbbe;
          border: none;
          font-size: 13px;
          cursor: pointer;
          margin-top: -10px;
        }

        .auth-divider {
          display: flex;
          align-items: center;
          text-align: center;
          color: #4f545c;
          font-size: 12px;
          margin: 10px 0;
        }

        .auth-divider::before, .auth-divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid #4f545c;
        }

        .auth-divider span {
          padding: 0 10px;
        }

        .google-btn-wrapper {
          display: flex;
          justify-content: center;
        }

        .auth-footer {
          margin-top: 30px;
          text-align: center;
          color: #8e9297;
          font-size: 14px;
        }

        .auth-footer a {
          color: #00aff4;
          text-decoration: none;
        }

        .step-info {
          text-align: center;
          color: #b9bbbe;
          font-size: 14px;
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
};

export default Register;