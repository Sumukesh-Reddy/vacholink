import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || "https://vacholink.onrender.com";

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [stars, setStars] = useState([]);
  const [successData, setSuccessData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Generate responsive stars
    const generateStars = () => {
      const isMobile = window.innerWidth <= 768;
      const starCount = isMobile ? 15 : 30;
      const newStars = [];
      for (let i = 0; i < starCount; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * (isMobile ? 1 : 1.5) + (isMobile ? 0.3 : 0.5),
          opacity: Math.random() * 0.2 + 0.1,
          delay: Math.random() * 3,
          duration: Math.random() * 2 + 1,
          type: Math.random() > 0.8 ? 'blue' : 'white'
        });
      }
      setStars(newStars);
    };
    
    generateStars();
    window.addEventListener('resize', generateStars);
    return () => window.removeEventListener('resize', generateStars);
  }, []);

  // Handle Google signup success
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/auth/google`, {
        credential: credentialResponse.credential
      });

      console.log('Google response:', response.data);

      if (response.data.success) {
        const { isNewUser, user } = response.data;
        
        if (isNewUser) {
          // Generate default password from email
          const emailUsername = user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
          const defaultPassword = `${emailUsername}@vacholink`;
          
          // Store success data to show in box
          setSuccessData({
            email: user.email,
            password: defaultPassword,
            name: user.name
          });
          
          // Clear any existing auth data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Show success toast
          toast.success(
            <div style={{ padding: '5px' }}>
              <p style={{ margin: 0 }}>✅ Account created! Check your credentials below.</p>
            </div>,
            {
              autoClose: 3000,
              position: "top-center"
            }
          );
        } else {
          // Existing user - login directly
          toast.success('Welcome back! Login successful');
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          navigate('/'); // Change this to your main app page
        }
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Google signup error:', error);
      toast.error(error.response?.data?.message || 'Google signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error('Google signup failed. Please try again.');
  };

  const handleCopyPassword = () => {
    if (successData?.password) {
      navigator.clipboard.writeText(successData.password);
      toast.success('Password copied to clipboard!');
    }
  };

  const handleCopyEmail = () => {
    if (successData?.email) {
      navigator.clipboard.writeText(successData.email);
      toast.success('Email copied to clipboard!');
    }
  };

  const handleGoToLogin = () => {
    setSuccessData(null);
    navigate('/login');
  };

  return (
    <div className="register-container">
      {/* Background layers */}
      <div className="register-bg-gradient" />
      
      {/* Stars */}
      <div className="stars-container">
        {stars.map(star => (
          <div
            key={star.id}
            className="star"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              background: star.type === 'blue' ? '#7289da' : '#ffffff',
              opacity: star.opacity,
              animation: `starTwinkle ${star.duration}s infinite ${star.delay}s alternate`,
            }}
          />
        ))}
      </div>
      
      {/* Glow effect */}
      <div className="register-glow" />

      {/* Form container - THIS IS WHERE THE SUCCESS BOX APPEARS */}
      <div className="register-form-container">
        {/* Form inner glow */}
        <div className="register-form-glow" />
        
        {/* Success Message Box - This appears when successData is set */}
        {successData ? (
          <div className="success-container">
            {/* Header */}
            <div className="success-header">
              <div className="success-icon">
                ✅
              </div>
              <h2 className="success-title">Account Created Successfully!</h2>
              <p className="success-subtitle">
                Here are your login credentials. Please save them securely.
              </p>
            </div>

            {/* Credentials Box */}
            <div className="credentials-container">
              <div className="credentials-card">
                <div className="credential-item">
                  <div className="credential-label">
                    <span className="credential-icon">📧</span>
                    <span>Your Email</span>
                  </div>
                  <div className="credential-value">
                    <code className="credential-text">{successData.email}</code>
                    <button 
                      className="copy-button"
                      onClick={handleCopyEmail}
                      title="Copy email"
                    >
                      📋
                    </button>
                  </div>
                </div>

                <div className="credential-item">
                  <div className="credential-label">
                    <span className="credential-icon">🔑</span>
                    <span>Your Password</span>
                  </div>
                  <div className="credential-value">
                    <code className="credential-text password-text">{successData.password}</code>
                    <button 
                      className="copy-button"
                      onClick={handleCopyPassword}
                      title="Copy password"
                    >
                      📋
                    </button>
                  </div>
                </div>

                <div className="credential-item">
                  <div className="credential-label">
                    <span className="credential-icon">👤</span>
                    <span>Display Name</span>
                  </div>
                  <div className="credential-value">
                    <code className="credential-text">{successData.name}</code>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="instructions-box">
                <h4 className="instructions-title">📝 Important Instructions:</h4>
                <ul className="instructions-list">
                  <li>1. Go to Login page</li>
                  <li>2. Enter your email and password above</li>
                  <li>3. After login, go to profile</li>
                  <li>4. Change your password for security</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="success-actions">
                <button
                  className="login-button"
                  onClick={handleGoToLogin}
                >
                  Go to Login Page
                </button>
                <button
                  className="back-button"
                  onClick={() => setSuccessData(null)}
                >
                  Back to Signup
                </button>
              </div>

              {/* Security Note */}
              <div className="security-note">
                <p>🔒 <strong>Security Tip:</strong> Never share your password with anyone.</p>
                <p>Change your password immediately after first login.</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Normal Registration Form - This shows when successData is null */}
            {/* Logo and header */}
            <div className="register-header">
              <div className="register-logo">
                ꍡ
              </div>
              <h2 className="register-title">Join VachoLink</h2>
              <p className="register-subtitle">Sign up with Google to get started</p>
            </div>

            {/* Information Box */}
            <div className="register-info">
              <p className="register-info-text">
                <strong>ꍡ How it works:</strong><br/>
                1. Sign up with Google<br/>
                2. We'll create your account with a default password<br/>
                3. Login with your email and password<br/>
                4. Change your password in profile for security
              </p>
            </div>

            {/* Google Signup Button */}
            <div className="google-signup-container">
              {loading ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                </div>
              ) : (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="filled_blue"
                  size="large"
                  width="100%"
                  text="signup_with"
                  shape="rectangular"
                />
              )}
            </div>

            {/* Quick Login Info */}
            <div className="quick-login-info">
              <h4>📝 Your default password will be:</h4>
              <p className="password-example">
                <code>Gmailusername@vacholink</code>
              </p>
              <p className="password-note">
                Example: If your email is "sumukesh123@gmail.com", password is "sumukesh123@vacholink"
              </p>
            </div>

            {/* Footer */}
            <div className="register-footer">
              <p>Already have an account?</p>
              <Link to="/login" className="register-link">
                Sign in instead
              </Link>
              
              {/* Social links */}
              <div className="form-social-links">
                <div className="social-divider">
                  <span>Connect with Developer</span>
                </div>
                <div className="social-links-container">
                  <a 
                    href="https://github.com/Sumukesh-Reddy" 
                    className="form-social-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="GitHub"
                  >
                    <span className="social-icon">{'</>'}</span>
                    <span className="social-label">GitHub</span>
                  </a>
                  <a 
                    href="mailto:sumukeshmopuram1@gmail.com" 
                    className="form-social-link"
                    title="Email"
                  >
                    <span className="social-icon">@</span>
                    <span className="social-label">Email</span>
                  </a>
                  <a 
                    href="https://www.linkedin.com/in/sumukesh-reddy-mopuram/" 
                    className="form-social-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="LinkedIn"
                  >
                    <span className="social-icon">in</span>
                    <span className="social-label">LinkedIn</span>
                  </a>
                  <a 
                    href="http://sumukesh-portfolio.vercel.app" 
                    className="form-social-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Portfolio"
                  >
                    <span className="social-icon">⎙</span>
                    <span className="social-label">Portfolio</span>
                  </a>
                </div>
                <p className="social-note">Have questions or feedback? Reach out!</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Keep your existing styles here */}
      <style>{`
        /* ... all your existing CSS styles ... */
      `}</style>
    </div>
  );
};

export default Register;