import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';
import axios from 'axios';

const API_URL =  "https://vacholink.onrender.com" || process.env.REACT_APP_API_URL ;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [stars, setStars] = useState([]);
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [passwordSetupData, setPasswordSetupData] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
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
      console.log('🔄 Sending Google credential to server...');
      const response = await axios.post(`${API_URL}/api/auth/google`, {
        credential: credentialResponse.credential
      });

      console.log('✅ Server response:', response.data);

      if (response.data.success) {
        const { user, token } = response.data;
        
        // ALWAYS show password setup for Google users
        console.log('🎯 Showing password setup modal');
        setPasswordSetupData({
          email: user.email,
          name: user.name,
          token: token,
          userId: user._id
        });
        setShowPasswordSetup(true);
        
        
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(' Google signup error:', error);
      toast.error(error.response?.data?.message || 'Google signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error('Google signup failed. Please try again.');
  };

  const validatePassword = () => {
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return false;
    }
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handlePasswordSetup = async () => {
    if (!validatePassword()) return;
  
    try {
      console.log('🔄 Setting password for user:', passwordSetupData.email);
      
      // Extract username from email for default password
      const emailUsername = passwordSetupData.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
      const defaultPassword = `${emailUsername}@vacholink`;
      
      console.log('🔑 Auto-generated default password:', defaultPassword);
      
      // Use the default password as currentPassword
      const response = await axios.post(`${API_URL}/api/auth/change-password`, 
        {
          currentPassword: defaultPassword, // Use auto-generated default
          newPassword: password
        },
        {
          headers: {
            'Authorization': `Bearer ${passwordSetupData.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (response.data.success) {
        // Update user data and proceed
        const updatedUser = {
          ...passwordSetupData,
          needsPasswordChange: false
        };
        
        localStorage.setItem('user', JSON.stringify(updatedUser));
        toast.success(' Password changed successfully!');
        setShowPasswordSetup(false);
        navigate('/');
      } else {
        toast.error(response.data.message || 'Failed to set password');
      }
    } catch (error) {
      console.error('Password setup error:', error);
      
      // If default password doesn't work, try empty password as fallback
      if (error.response?.status === 401) {
        console.log('🔄 Default password failed, trying empty password...');
        
        try {
          const fallbackResponse = await axios.post(`${API_URL}/api/auth/change-password`, 
            {
              currentPassword: '', // Try empty as fallback
              newPassword: password
            },
            {
              headers: {
                'Authorization': `Bearer ${passwordSetupData.token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          if (fallbackResponse.data.success) {
            localStorage.setItem('user', JSON.stringify({
              ...passwordSetupData,
              needsPasswordChange: false
            }));
            toast.success(' Password set successfully!');
            setShowPasswordSetup(false);
            navigate('/');
          } else {
            toast.error('Failed to set password. Please contact support.');
          }
        } catch (fallbackError) {
          toast.error('Could not set password. Please try logging in manually.');
          setShowPasswordSetup(false);
          navigate('/login');
        }
      } else {
        toast.error(error.response?.data?.message || 'Failed to set password');
      }
    }
  };

  const handlePasswordSetupLater = () => {
    // Store temporary data
    localStorage.setItem('tempToken', passwordSetupData.token);
    localStorage.setItem('tempUser', JSON.stringify(passwordSetupData));
    
    toast.info(
      <div style={{ padding: '5px' }}>
        <p style={{ margin: 0 }}>⚠️ Please set your password on first login!</p>
        <p style={{ margin: 0, fontSize: '12px' }}>Go to profile → Change password</p>
      </div>,
      {
        autoClose: 5000,
        position: "top-center"
      }
    );
    setShowPasswordSetup(false);
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
      
      <div className="register-glow" />

      {/* Password Setup Modal */}
      {showPasswordSetup && passwordSetupData && (
        <div className="password-modal-overlay">
          <div className="password-modal">
            <div className="password-modal-header">
              <div className="password-modal-icon">🔐</div>
              <h3 className="password-modal-title">Set Your Password</h3>
              <p className="password-modal-subtitle">
                Please create a secure password for your account
              </p>
            </div>

            <div className="password-modal-content">
              <div className="user-info">
                <div className="user-info-item">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{passwordSetupData.email}</span>
                </div>
                <div className="user-info-item">
                  <span className="info-label">Name:</span>
                  <span className="info-value">{passwordSetupData.name}</span>
                </div>
              </div>

              <div className="password-form">
                <div className="form-group">
                  <label htmlFor="password">New Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError('');
                    }}
                    placeholder="Enter at least 6 characters"
                    className="password-input"
                    required
                    autoFocus
                  />
                  <div className="password-hint">
                    Must be at least 6 characters long
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (passwordError) setPasswordError('');
                    }}
                    placeholder="Re-enter your password"
                    className="password-input"
                    required
                  />
                </div>

                {passwordError && (
                  <div className="password-error">
                    ⚠️ {passwordError}
                  </div>
                )}

                <div className="password-requirements">
                  <h4>Password Requirements:</h4>
                  <ul>
                    <li className={password.length >= 6 ? 'met' : ''}>
                      ✓ At least 6 characters
                    </li>
                    <li className={password === confirmPassword && password.length >= 6 ? 'met' : ''}>
                      ✓ Passwords match
                    </li>
                  </ul>
                </div>
              </div>

              <div className="password-modal-actions">
                <button
                  className="setup-button primary"
                  onClick={handlePasswordSetup}
                >
                  Set Password & Continue
                </button>
                <button
                  className="setup-button secondary"
                  onClick={handlePasswordSetupLater}
                >
                  Skip for Now
                </button>
              </div>

              <div className="security-note">
                <p>⚠️ <strong>Security Note:</strong> Setting a password is required for security.</p>
                <p>You can skip now, but you must set it later in your profile.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="register-form-container">
        <div className="register-form-glow" />
        
        {/* Normal Registration Form */}
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
            2. Set your password immediately<br/>
            3. Start using VachoLink<br/>
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
              text="signup_with"
              shape="rectangular"
            />
          )}
        </div>

        {/* Important Note */}
        <div className="important-note">
          <h4>🔐 Important:</h4>
          <p>After Google signup, you'll be prompted to set a password for your account.</p>
          <p><small>This ensures your account security.</small></p>
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
      </div>
      <style>{`
        /* Base styles */
        .register-container {
          min-height: 100vh;
          background: #0a0a0a;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          position: relative;
          overflow: hidden;
        }

        .register-bg-gradient {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(ellipse at center, #1a1c22 0%, #0a0a0a 70%);
          pointer-events: none;
        }

        .stars-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
        }

        .star {
          position: absolute;
          border-radius: 50%;
          filter: blur(0.3px);
        }

        .register-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(67, 181, 129, 0.1) 0%, transparent 70%);
          filter: blur(40px);
          animation: glowPulse 8s ease-in-out infinite alternate;
          pointer-events: none;
        }

        /* Password Setup Modal */
        .password-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 20px;
          animation: fadeIn 0.3s ease-out;
        }

        .password-modal {
          background: rgba(47, 49, 54, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 40px;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.7);
          border: 1px solid rgba(114, 137, 218, 0.3);
          animation: slideUp 0.4s ease-out;
        }

        .password-modal-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .password-modal-icon {
          font-size: 48px;
          margin-bottom: 16px;
          animation: bounceIn 0.8s ease-out;
        }

        .password-modal-title {
          color: #7289da;
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 8px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .password-modal-subtitle {
          color: #b9bbbe;
          font-size: 14px;
          line-height: 1.5;
        }

        .password-modal-content {
          margin: 20px 0;
        }

        .user-info {
          background: rgba(32, 34, 37, 0.7);
          border-radius: 10px;
          padding: 15px;
          margin-bottom: 25px;
          border: 1px solid rgba(67, 181, 129, 0.2);
        }

        .user-info-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .user-info-item:last-child {
          margin-bottom: 0;
          padding-bottom: 0;
          border-bottom: none;
        }

        .info-label {
          color: #8e9297;
          font-weight: 500;
          font-size: 14px;
        }

        .info-value {
          color: #ffffff;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          font-weight: 500;
        }

        .password-form {
          margin-bottom: 25px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #8e9297;
          font-size: 14px;
          font-weight: 500;
        }

        .password-input {
          width: 100%;
          padding: 14px;
          background: rgba(32, 34, 37, 0.8);
          border: 1px solid rgba(32, 34, 37, 0.5);
          border-radius: 8px;
          color: #dcddde;
          font-size: 15px;
          transition: all 0.3s;
          outline: none;
          box-sizing: border-box;
        }

        .password-input:focus {
          border-color: #7289da;
          box-shadow: 0 0 0 2px rgba(114, 137, 218, 0.2);
          background: rgba(32, 34, 37, 0.9);
        }

        .password-hint {
          color: #8e9297;
          font-size: 12px;
          margin-top: 4px;
          margin-left: 4px;
        }

        .password-error {
          background: rgba(237, 66, 69, 0.1);
          border: 1px solid rgba(237, 66, 69, 0.3);
          border-radius: 6px;
          padding: 12px;
          color: #ed4245;
          font-size: 14px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .password-requirements {
          background: rgba(32, 34, 37, 0.5);
          border-radius: 8px;
          padding: 15px;
          margin-top: 25px;
        }

        .password-requirements h4 {
          color: #43b581;
          font-size: 14px;
          margin-bottom: 10px;
        }

        .password-requirements ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .password-requirements li {
          color: #8e9297;
          font-size: 13px;
          margin-bottom: 6px;
          padding-left: 20px;
          position: relative;
        }

        .password-requirements li:before {
          content: '○';
          position: absolute;
          left: 0;
          color: #8e9297;
        }

        .password-requirements li.met {
          color: #43b581;
        }

        .password-requirements li.met:before {
          content: '✓';
          color: #43b581;
        }

        .password-modal-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin: 30px 0;
        }

        .setup-button {
          padding: 16px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          border: none;
          text-align: center;
        }

        .setup-button.primary {
          background: linear-gradient(135deg, #7289da 0%, #5b6eae 100%);
          color: white;
        }

        .setup-button.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(114, 137, 218, 0.4);
        }

        .setup-button.secondary {
          background: transparent;
          border: 2px solid rgba(114, 137, 218, 0.4);
          color: #7289da;
        }

        .setup-button.secondary:hover {
          background: rgba(114, 137, 218, 0.1);
          transform: translateY(-2px);
        }

        .security-note {
          background: rgba(237, 66, 69, 0.1);
          border: 1px solid rgba(237, 66, 69, 0.3);
          border-radius: 8px;
          padding: 15px;
          text-align: center;
        }

        .security-note p {
          color: #ed4245;
          font-size: 13px;
          margin: 5px 0;
          line-height: 1.4;
        }

        .security-note strong {
          color: #ffffff;
        }

        /* Form container */
        .register-form-container {
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

        .register-form-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 12px;
          background: radial-gradient(circle at 50% 0%, rgba(114, 137, 218, 0.1), transparent 70%);
          pointer-events: none;
        }

        /* Header */
        .register-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .register-logo {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #43b581 0%, #3ba55d 100%);
          border-radius: 50%;
          color: white;
          font-weight: bold;
          font-size: 28px;
          margin-bottom: 16px;
          box-shadow: 0 0 20px rgba(67, 181, 129, 0.4);
        }

        .register-title {
          color: #ffffff;
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 8px;
          font-family: "'Ginto', sans-serif";
          text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }

        .register-subtitle {
          text-align: center;
          color: #b9bbbe;
          font-size: 14px;
        }

        /* Info Box */
        .register-info {
          background: rgba(32, 34, 37, 0.5);
          border-radius: 8px;
          padding: 15px;
          margin: 25px 0;
          border: 1px solid rgba(32, 34, 37, 0.8);
        }

        .register-info-text {
          color: #b9bbbe;
          font-size: 13px;
          line-height: 1.6;
          margin: 0;
        }

        .register-info-text strong {
          color: #ffffff;
          display: block;
          margin-bottom: 8px;
        }

        /* Google Signup Container */
        .google-signup-container {
          margin: 30px 0;
          display: flex;
          justify-content: center;
        }

        .loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(67, 181, 129, 0.3);
          border-top: 3px solid #43b581;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .loading-spinner span {
          color: #b9bbbe;
          font-size: 14px;
        }

        /* Important Note */
        .important-note {
          background: rgba(114, 137, 218, 0.1);
          border: 1px solid rgba(114, 137, 218, 0.3);
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
          text-align: center;
        }

        .important-note h4 {
          color: #7289da;
          margin: 0 0 10px 0;
          font-size: 14px;
        }

        .important-note p {
          color: #b9bbbe;
          margin: 5px 0;
          font-size: 13px;
        }

        .important-note small {
          color: #8e9297;
          font-size: 12px;
        }

        /* Footer */
        .register-footer {
          text-align: center;
          padding-top: 24px;
          border-top: 1px solid rgba(32, 34, 37, 0.5);
        }

        .register-footer p {
          color: #8e9297;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .register-link {
          color: #7289da;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s;
          display: inline-block;
          padding: 8px 16px;
          border-radius: 4px;
        }

        .register-link:hover {
          background: rgba(114, 137, 218, 0.1);
          transform: translateY(-1px);
        }

        /* Social links */
        .form-social-links {
          margin-top: 25px;
          margin-bottom: 10px;
        }

        .social-links-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin: 15px 0;
        }

        .form-social-link {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 10px 5px;
          background: rgba(32, 34, 37, 0.5);
          border-radius: 6px;
          color: #b9bbbe;
          text-decoration: none;
          transition: all 0.3s;
          border: 1px solid transparent;
          min-height: 60px;
        }

        .form-social-link:hover {
          background: rgba(67, 181, 129, 0.1);
          border-color: rgba(67, 181, 129, 0.3);
          color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(67, 181, 129, 0.2);
        }

        .social-icon {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 4px;
          font-family: 'Courier New', monospace;
          height: 24px;
          width: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
          padding: 2px;
        }

        .social-label {
          font-size: 10px;
          font-weight: 500;
          opacity: 0.9;
          text-align: center;
        }

        .social-divider {
          position: relative;
          text-align: center;
          margin: 15px 0;
          color: #8e9297;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .social-divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: rgba(32, 34, 37, 0.5);
          z-index: 1;
        }

        .social-divider span {
          position: relative;
          background: rgba(47, 49, 54, 0.9);
          padding: 0 15px;
          z-index: 2;
        }

        .social-note {
          text-align: center;
          color: #8e9297;
          font-size: 11px;
          margin-top: 10px;
          font-style: italic;
          opacity: 0.8;
        }

        /* Animations */
        @keyframes starTwinkle {
          0%, 100% { 
            opacity: 0.1; 
            transform: scale(1);
          }
          50% { 
            opacity: 0.3; 
            transform: scale(1.3);
          }
        }
        
        @keyframes glowPulse {
          0%, 100% { 
            opacity: 0.05;
          }
          50% { 
            opacity: 0.15;
          }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounceIn {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        /* Mobile styles */
        @media (max-width: 768px) {
          .register-container {
            padding: 10px;
            align-items: flex-start;
            padding-top: 40px;
          }

          .register-form-container {
            padding: 30px 25px;
            max-width: 100%;
            margin: 0 15px;
            border-radius: 10px;
          }

          .register-glow {
            width: 250px;
            height: 250px;
            filter: blur(25px);
          }

          .password-modal {
            padding: 30px 25px;
            max-width: 100%;
            margin: 0 15px;
            border-radius: 12px;
          }

          .password-modal-title {
            font-size: 20px;
          }

          .password-modal-subtitle {
            font-size: 13px;
          }

          .password-modal-icon {
            font-size: 40px;
          }

          .user-info-item {
            flex-direction: column;
            gap: 4px;
          }

          .info-label, .info-value {
            font-size: 13px;
          }

          .register-logo {
            width: 50px;
            height: 50px;
            font-size: 24px;
          }

          .register-title {
            font-size: 20px;
          }

          .register-subtitle {
            font-size: 13px;
          }

          .register-info-text {
            font-size: 12px;
          }

          .register-link {
            padding: 6px 12px;
            font-size: 13px;
          }

          .important-note h4 {
            font-size: 13px;
          }

          .important-note p {
            font-size: 12px;
          }

          .social-links-container {
            grid-template-columns: repeat(2, 1fr);
            gap: 6px;
          }
          
          .form-social-link {
            padding: 8px 4px;
            min-height: 55px;
          }
          
          .social-icon {
            font-size: 14px;
            height: 22px;
            width: 22px;
          }
          
          .social-label {
            font-size: 9px;
          }
          
          .social-divider {
            font-size: 10px;
            margin: 12px 0;
          }
          
          .social-note {
            font-size: 10px;
          }
        }

        /* Small mobile */
        @media (max-width: 480px) {
          .register-form-container {
            padding: 25px 20px;
            margin: 0 10px;
          }

          .password-modal {
            padding: 25px 20px;
            margin: 0 10px;
          }

          .password-modal-title {
            font-size: 18px;
          }

          .password-input {
            padding: 12px;
            font-size: 14px;
          }

          .setup-button {
            padding: 14px;
            font-size: 14px;
          }

          .register-logo {
            width: 45px;
            height: 45px;
            font-size: 22px;
            margin-bottom: 12px;
          }

          .register-title {
            font-size: 18px;
          }

          .register-subtitle {
            font-size: 12px;
          }
        }

        /* Large screens */
        @media (min-width: 1200px) {
          .register-form-container {
            max-width: 500px;
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

export default Register;