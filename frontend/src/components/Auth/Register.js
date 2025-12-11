import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const [stars, setStars] = useState([]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const result = await register(name, email, password);
      if (result.success) {
        toast.success('Registration successful!');
        navigate('/');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Background layers */}
      <div className="auth-bg-gradient" />
      
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
      <div className="auth-glow" />

      {/* Form container */}
      <div className="auth-form-container">
        {/* Form inner glow */}
        <div className="auth-form-glow" />
        
        {/* Logo and header */}
        <div className="auth-header">
          <div className="auth-logo">
            ꍡ
          </div>
          <h2 className="auth-title">Join VachoLink</h2>
          <p className="auth-subtitle">Create your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">FULL NAME</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
              className="auth-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">EMAIL</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="auth-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">PASSWORD</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password (min. 6 characters)"
              required
              className="auth-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">CONFIRM PASSWORD</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              className="auth-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-button"
          >
            <div className="button-glow" />
            <span className="button-text">
              {loading ? 'Creating Account...' : 'Create Account'}
            </span>
          </button>
        </form>

        {/* Footer link */}
        <div className="auth-footer">
          <p>Already have an account?</p>
          <Link to="/login" className="auth-link">
            Sign in instead
          </Link>
          
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
        .auth-container {
          min-height: 100vh;
          background: #0a0a0a;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          position: relative;
          overflow: hidden;
        }

        .auth-bg-gradient {
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

        .auth-glow {
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

        /* Form container */
        .auth-form-container {
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

        .auth-form-glow {
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
        .auth-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .auth-logo {
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

        .auth-title {
          color: #ffffff;
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 8px;
          font-family: "'Ginto', sans-serif";
          text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }

        .auth-subtitle {
          text-align: center;
          color: #b9bbbe;
          font-size: 14px;
        }

        /* Form elements */
        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #8e9297;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .auth-input {
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

        .auth-input:focus {
          border-color: #43b581;
          box-shadow: 0 0 0 2px rgba(67, 181, 129, 0.2);
          background: rgba(32, 34, 37, 0.9);
        }

        /* Button */
        .auth-button {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #43b581 0%, #3ba55d 100%);
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

        .auth-button:disabled {
          background: #3ba55d;
          cursor: not-allowed;
        }

        .auth-button:not(:disabled):hover {
          transform: translateY(-2px);
        }

        .button-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: buttonGlow 2s infinite;
        }

        .auth-button:disabled .button-glow {
          animation: none;
        }

        .button-text {
          position: relative;
          z-index: 1;
        }

        /* Footer */
        .auth-footer {
          text-align: center;
          padding-top: 24px;
          border-top: 1px solid rgba(32, 34, 37, 0.5);
        }

        .auth-footer p {
          color: #8e9297;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .auth-link {
          color: #7289da;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s;
          display: inline-block;
          padding: 8px 16px;
          border-radius: 4px;
        }

        .auth-link:hover {
          background: rgba(114, 137, 218, 0.1);
          transform: translateY(-1px);
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
        
        @keyframes buttonGlow {
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
          .auth-container {
            padding: 10px;
            align-items: flex-start;
            padding-top: 40px;
          }

          .auth-form-container {
            padding: 30px 25px;
            max-width: 100%;
            margin: 0 15px;
            border-radius: 10px;
          }

          .auth-glow {
            width: 250px;
            height: 250px;
            filter: blur(25px);
          }

          .auth-logo {
            width: 50px;
            height: 50px;
            font-size: 24px;
          }

          .auth-title {
            font-size: 20px;
          }

          .auth-subtitle {
            font-size: 13px;
          }

          .form-group label {
            font-size: 11px;
          }

          .auth-input {
            padding: 12px;
            font-size: 14px;
          }

          .auth-button {
            padding: 12px;
            font-size: 14px;
            min-height: 44px;
          }

          .auth-link {
            padding: 6px 12px;
            font-size: 13px;
          }
        }

        /* Small mobile */
        @media (max-width: 480px) {
          .auth-form-container {
            padding: 25px 20px;
            margin: 0 10px;
          }

          .auth-logo {
            width: 45px;
            height: 45px;
            font-size: 22px;
            margin-bottom: 12px;
          }

          .auth-title {
            font-size: 18px;
          }

          .auth-input {
            padding: 11px;
            font-size: 13px;
          }

          .auth-button {
            padding: 11px;
            font-size: 13px;
            min-height: 42px;
          }
        }

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

          /* Mobile styles */
          @media (max-width: 768px) {
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
        /* Large screens */
        @media (min-width: 1200px) {
          .auth-form-container {
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
