import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Link } from 'react-router-dom';
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [stars, setStars] = useState([]);

  const token = searchParams.get('token');

  useEffect(() => {
    // Generate stars
    const generateStars = () => {
      const starCount = 25;
      const newStars = [];
      for (let i = 0; i < starCount; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.15 + 0.1,
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
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(ellipse at center, #1a1c22 0%, #0a0a0a 70%)',
        pointerEvents: 'none'
      }} />
      
      
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none'
      }}>
        {stars.map(star => (
          <div
            key={star.id}
            style={{
              position: 'absolute',
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              background: '#ffffff',
              borderRadius: '50%',
              opacity: star.opacity,
              animation: `resetTwinkle ${star.duration}s infinite ${star.delay}s alternate`,
              filter: 'blur(0.3px)'
            }}
          />
        ))}
      </div>
      
      
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(237, 66, 69, 0.05) 0%, transparent 70%)',
        filter: 'blur(30px)',
        animation: 'securityPulse 6s ease-in-out infinite alternate',
        pointerEvents: 'none'
      }} />

      <div style={{
        background: 'rgba(47, 49, 54, 0.85)',
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        padding: '40px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(32, 34, 37, 0.5)',
        position: 'relative',
        zIndex: 1
      }}>
        
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: '12px',
          background: 'radial-gradient(circle at 50% 0%, rgba(237, 66, 69, 0.1), transparent 70%)',
          pointerEvents: 'none'
        }} />
        
        
        <div style={{
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '70px',
            height: '70px',
            background: 'linear-gradient(135deg, #ed4245 0%, #d84040 100%)',
            borderRadius: '50%',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '32px',
            marginBottom: '20px',
            boxShadow: '0 0 25px rgba(237, 66, 69, 0.4)'
          }}>
            🔒
          </div>
          <h2 style={{
            color: '#ffffff',
            fontSize: '24px',
            fontWeight: '700',
            marginBottom: '10px',
            fontFamily: "'Ginto', sans-serif",
            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
          }}>Reset Your Password</h2>
          <p style={{
            textAlign: 'center',
            color: '#b9bbbe',
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            Create a new password for your VachoLink account
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="newPassword" style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              color: '#8e9297',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>NEW PASSWORD</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your new password"
              required
              style={{
                width: '100%',
                padding: '14px',
                background: 'rgba(32, 34, 37, 0.7)',
                border: '1px solid rgba(32, 34, 37, 0.5)',
                borderRadius: '6px',
                color: '#dcddde',
                fontSize: '15px',
                transition: 'all 0.3s',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#ed4245';
                e.target.style.boxShadow = '0 0 0 2px rgba(237, 66, 69, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(32, 34, 37, 0.5)';
                e.target.style.boxShadow = 'none';
              }}
            />
            <div style={{
              color: '#8e9297',
              fontSize: '12px',
              marginTop: '6px',
              paddingLeft: '4px'
            }}>
              Minimum 6 characters
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="confirmPassword" style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              color: '#8e9297',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>CONFIRM PASSWORD</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              required
              style={{
                width: '100%',
                padding: '14px',
                background: 'rgba(32, 34, 37, 0.7)',
                border: '1px solid rgba(32, 34, 37, 0.5)',
                borderRadius: '6px',
                color: '#dcddde',
                fontSize: '15px',
                transition: 'all 0.3s',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#ed4245';
                e.target.style.boxShadow = '0 0 0 2px rgba(237, 66, 69, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(32, 34, 37, 0.5)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#d84040' : 'linear-gradient(135deg, #ed4245 0%, #d84040 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              fontFamily: "'Whitney', sans-serif",
              marginBottom: '24px',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => !loading && (e.target.style.transform = 'translateY(0)')}
          >
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%)',
              animation: loading ? 'none' : 'resetButtonGlow 2s infinite'
            }} />
            <span style={{ position: 'relative', zIndex: 1 }}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </span>
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          paddingTop: '24px',
          borderTop: '1px solid rgba(32, 34, 37, 0.5)'
        }}>
          <p style={{ 
            color: '#8e9297', 
            fontSize: '14px',
            marginBottom: '8px'
          }}>
            Remember your password?
          </p>
          <Link to="/login" style={{
            color: '#7289da',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '14px',
            transition: 'all 0.2s',
            display: 'inline-block',
            padding: '8px 16px',
            borderRadius: '4px'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(114, 137, 218, 0.1)';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.transform = 'translateY(0)';
          }}
          >
            Back to Login
          </Link>
        </div>
      </div>

      <style>{`
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
      `}</style>
    </div>
  );
};

export default ResetPassword;