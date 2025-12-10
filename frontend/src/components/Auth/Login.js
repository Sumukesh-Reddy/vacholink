import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [stars, setStars] = useState([]);

  useEffect(() => {
    // Generate responsive stars
    const generateStars = () => {
      const isMobile = window.innerWidth <= 768;
      const starCount = isMobile ? 100 : 400;
      const newStars = [];
      for (let i = 0; i < starCount; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * (isMobile ? 1.5 : 2) + (isMobile ? 0.3 : 0.5),
          opacity: Math.random() * 0.3 + 0.1,
          delay: Math.random() * 4,
          duration: Math.random() * 2 + 1,
          twinkleSpeed: Math.random() * 1 + 0.5
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
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      toast.success('Login successful!');
      navigate('/');
    } else {
      toast.error(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container">
      {/* Background gradient */}
      <div className="login-bg-gradient" />
      
      {/* Stars */}
      <div className="login-stars">
        {stars.map(star => (
          <div
            key={star.id}
            className="login-star"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animation: `loginTwinkle ${star.duration}s infinite ${star.delay}s alternate`,
            }}
          />
        ))}
      </div>
      
      {/* Floating particles */}
      <div className="login-particles">
        {Array.from({ length: window.innerWidth <= 768 ? 8 : 15 }).map((_, i) => (
          <div
            key={i}
            className="login-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `particleFloat ${Math.random() * 10 + 5}s linear infinite ${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
      
      {/* Logo glow */}
      <div className="login-logo-glow" />

      {/* Form container */}
      <div className="login-form-container">
        {/* Inner glow */}
        <div className="login-inner-glow" />
        
        {/* Header */}
        <div className="login-header">
          <div className="login-logo">
            ꍡ
          </div>
          <h2 className="login-title">Welcome to VachoLink</h2>
          <p className="login-subtitle">Sign in to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="login-form-group">
            <label htmlFor="email">EMAIL</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="login-input"
            />
          </div>

          <div className="login-form-group">
            <label htmlFor="password">PASSWORD</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="login-input"
            />
          </div>

          <div className="login-remember">
            <input
              type="checkbox"
              id="remember"
              className="login-checkbox"
            />
            <label htmlFor="remember" className="login-remember-label">
              Remember me
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="login-button"
          >
            <div className="login-button-glow" />
            <span className="login-button-text">
              {loading ? 'Signing in...' : 'Sign In'}
            </span>
          </button>
        </form>

        {/* Footer */}
        <div className="login-footer">
          <p>Don't have an account?</p>
          <Link to="/register" className="login-link">
            Create an account
          </Link>
        </div>
      </div>

      <style>{`
        /* Base styles */
        .login-container {
          min-height: 100vh;
          background: #0a0a0a;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          position: relative;
          overflow: hidden;
        }

        .login-bg-gradient {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(ellipse at center, #1a1c22 0%, #0a0a0a 70%);
          pointer-events: none;
        }

        .login-stars {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
        }

        .login-star {
          position: absolute;
          background: #ffffff;
          border-radius: 50%;
          filter: blur(0.3px);
        }

        .login-particles {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
        }

        .login-particle {
          position: absolute;
          width: 0.5px;
          height: 0.5px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 50%;
          box-shadow: 0 0 2px rgba(255, 255, 255, 0.1);
        }

        .login-logo-glow {
          position: absolute;
          top: 10%;
          left: 50%;
          transform: translateX(-50%);
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(114, 137, 218, 0.15) 0%, transparent 70%);
          filter: blur(20px);
          animation: logoGlow 4s ease-in-out infinite alternate;
          pointer-events: none;
          z-index: 0;
        }

        /* Form container */
        .login-form-container {
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

        .login-inner-glow {
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
        .login-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .login-logo {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #7289da 0%, #5b6eae 100%);
          border-radius: 50%;
          color: white;
          font-weight: bold;
          font-size: 28px;
          margin-bottom: 16px;
          box-shadow: 0 0 20px rgba(114, 137, 218, 0.4);
          animation: logoFloat 3s ease-in-out infinite;
        }

        .login-title {
          color: #ffffff;
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 8px;
          font-family: "'Ginto', sans-serif";
          text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }

        .login-subtitle {
          text-align: center;
          color: #b9bbbe;
          font-size: 14px;
        }

        /* Form elements */
        .login-form-group {
          margin-bottom: 20px;
        }

        .login-form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #8e9297;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .login-input {
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

        .login-input:focus {
          border-color: #7289da;
          box-shadow: 0 0 0 2px rgba(114, 137, 218, 0.2);
          background: rgba(32, 34, 37, 0.9);
        }

        /* Remember me checkbox */
        .login-remember {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 24px;
        }

        .login-checkbox {
          width: 16px;
          height: 16px;
          accent-color: #7289da;
          cursor: pointer;
          border-radius: 3px;
        }

        .login-remember-label {
          color: #b9bbbe;
          font-size: 13px;
          cursor: pointer;
        }

        /* Button */
        .login-button {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #7289da 0%, #5b6eae 100%);
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

        .login-button:disabled {
          background: #677bc4;
          cursor: not-allowed;
        }

        .login-button:not(:disabled):hover {
          transform: translateY(-2px);
        }

        .login-button-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: buttonShine 3s infinite;
        }

        .login-button:disabled .login-button-glow {
          animation: none;
        }

        .login-button-text {
          position: relative;
          z-index: 1;
        }

        /* Footer */
        .login-footer {
          text-align: center;
          padding-top: 24px;
          border-top: 1px solid rgba(32, 34, 37, 0.5);
        }

        .login-footer p {
          color: #8e9297;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .login-link {
          color: #7289da;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s;
          display: inline-block;
          padding: 8px 16px;
          border-radius: 4px;
        }

        .login-link:hover {
          background: rgba(114, 137, 218, 0.1);
          transform: translateY(-1px);
        }

        /* Animations */
        @keyframes loginTwinkle {
          0%, 100% { 
            opacity: 0.1; 
            transform: scale(1);
          }
          50% { 
            opacity: 0.3; 
            transform: scale(1.5);
          }
        }
        
        @keyframes particleFloat {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.15;
          }
          90% {
            opacity: 0.15;
          }
          100% {
            transform: translateY(-100vh) translateX(20px);
            opacity: 0;
          }
        }
        
        @keyframes logoGlow {
          0%, 100% { 
            opacity: 0.1;
            transform: translateX(-50%) scale(1);
          }
          50% { 
            opacity: 0.3;
            transform: translateX(-50%) scale(1.1);
          }
        }
        
        @keyframes logoFloat {
          0%, 100% { 
            transform: scale(1) rotate(0deg);
            box-shadow: 0 0 20px rgba(114, 137, 218, 0.4);
          }
          33% { 
            transform: scale(1.05) rotate(2deg);
            box-shadow: 0 0 25px rgba(114, 137, 218, 0.5);
          }
          66% { 
            transform: scale(1.03) rotate(-2deg);
            box-shadow: 0 0 22px rgba(114, 137, 218, 0.45);
          }
        }
        
        @keyframes buttonShine {
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
          .login-container {
            padding: 10px;
            align-items: flex-start;
            padding-top: 40px;
          }

          .login-form-container {
            padding: 30px 25px;
            max-width: 100%;
            margin: 0 15px;
            border-radius: 10px;
          }

          .login-logo-glow {
            top: 5%;
            width: 70px;
            height: 70px;
            filter: blur(15px);
          }

          .login-logo {
            width: 50px;
            height: 50px;
            font-size: 24px;
          }

          .login-title {
            font-size: 20px;
          }

          .login-subtitle {
            font-size: 13px;
          }

          .login-input {
            padding: 12px;
            font-size: 14px;
          }

          .login-checkbox {
            width: 14px;
            height: 14px;
          }

          .login-remember-label {
            font-size: 12px;
          }

          .login-button {
            padding: 12px;
            font-size: 14px;
            min-height: 44px;
          }

          .login-link {
            padding: 6px 12px;
            font-size: 13px;
          }
        }

        /* Small mobile */
        @media (max-width: 480px) {
          .login-form-container {
            padding: 25px 20px;
            margin: 0 10px;
          }

          .login-logo {
            width: 45px;
            height: 45px;
            font-size: 22px;
            margin-bottom: 12px;
          }

          .login-title {
            font-size: 18px;
          }

          .login-input {
            padding: 11px;
            font-size: 13px;
          }

          .login-button {
            padding: 11px;
            font-size: 13px;
            min-height: 42px;
          }
        }

        /* Large screens */
        @media (min-width: 1200px) {
          .login-form-container {
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

export default Login;
