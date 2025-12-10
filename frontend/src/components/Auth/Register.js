import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
const API_URL =  "http://localhost:3001" || process.env.REACT_APP_API_URL ;

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const [stars, setStars] = useState([]);
  const [step, setStep] = useState(1); // 1: Basic info, 2: OTP verification

  useEffect(() => {
    // Generate small stars
    const generateStars = () => {
      const starCount = 30;
      const newStars = [];
      for (let i = 0; i < starCount; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.2 + 0.1,
          delay: Math.random() * 3,
          duration: Math.random() * 2 + 1,
          type: Math.random() > 0.8 ? 'blue' : 'white'
        });
      }
      setStars(newStars);
    };
    
    generateStars();
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
      if (!otpSent) {
        // Send OTP
        const res = await axios.post(`${API_URL}/api/auth/send-otp`, {
          name,
          email,
          password
        });
        setOtpSent(true);
        setStep(2);
        toast.success('OTP sent to your email');
        if (res.data.otp) {
          console.log('OTP (dev):', res.data.otp);
        }
      } else {
        // Verify OTP and complete registration
        const verifyRes = await axios.post(`${API_URL}/api/auth/verify-otp`, {
          email,
          otp
        });

        if (verifyRes.data.success) {
          const result = await register(name, email, password);
          if (result.success) {
            toast.success('Registration successful!');
            navigate('/');
          } else {
            toast.error(result.message);
          }
        } else {
          toast.error(verifyRes.data.message || 'OTP verification failed');
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
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
      {/* Background gradient */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(ellipse at center, #1a1c22 0%, #0a0a0a 70%)',
        pointerEvents: 'none'
      }} />
      
      {/* Stars */}
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
              background: star.type === 'blue' ? '#7289da' : '#ffffff',
              borderRadius: '50%',
              opacity: star.opacity,
              animation: `starTwinkle ${star.duration}s infinite ${star.delay}s alternate`,
              filter: 'blur(0.3px)'
            }}
          />
        ))}
      </div>
      
      {/* Registration glow */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(67, 181, 129, 0.1) 0%, transparent 70%)',
        filter: 'blur(40px)',
        animation: 'glowPulse 8s ease-in-out infinite alternate',
        pointerEvents: 'none'
      }} />

      <div style={{
        background: 'rgba(47, 49, 54, 0.85)',
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        padding: '40px',
        width: '100%',
        maxWidth: '450px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(32, 34, 37, 0.5)',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Card glow */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: '12px',
          background: 'radial-gradient(circle at 50% 0%, rgba(114, 137, 218, 0.1), transparent 70%)',
          pointerEvents: 'none'
        }} />
        
        {/* Progress steps */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '30px',
          gap: '10px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: step === 1 ? '#7289da' : '#4f545c',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.3s'
            }}>
              1
            </div>
            <div style={{
              width: '40px',
              height: '2px',
              background: step === 2 ? '#7289da' : '#4f545c',
              transition: 'all 0.3s'
            }}></div>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: step === 2 ? '#7289da' : '#4f545c',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.3s'
            }}>
              2
            </div>
          </div>
        </div>
        
        <div style={{
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #43b581 0%, #3ba55d 100%)',
            borderRadius: '50%',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '28px',
            marginBottom: '16px',
            boxShadow: '0 0 20px rgba(67, 181, 129, 0.4)'
          }}>
            ꍡ
          </div>
          <h2 style={{
            color: '#ffffff',
            fontSize: '24px',
            fontWeight: '700',
            marginBottom: '8px',
            fontFamily: "'Ginto', sans-serif",
            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
          }}>Join VachoLink</h2>
          <p style={{
            textAlign: 'center',
            color: '#b9bbbe',
            fontSize: '14px'
          }}>
            {step === 1 ? 'Create your account' : 'Verify your email'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 ? (
            <>
              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="name" style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: '#8e9297',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>FULL NAME</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
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
                    e.target.style.borderColor = '#43b581';
                    e.target.style.boxShadow = '0 0 0 2px rgba(67, 181, 129, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(32, 34, 37, 0.5)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="email" style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: '#8e9297',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>EMAIL</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
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
                    e.target.style.borderColor = '#43b581';
                    e.target.style.boxShadow = '0 0 0 2px rgba(67, 181, 129, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(32, 34, 37, 0.5)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="password" style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: '#8e9297',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>PASSWORD</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password (min. 6 characters)"
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
                    e.target.style.borderColor = '#43b581';
                    e.target.style.boxShadow = '0 0 0 2px rgba(67, 181, 129, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(32, 34, 37, 0.5)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
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
                  placeholder="Confirm your password"
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
                    e.target.style.borderColor = '#43b581';
                    e.target.style.boxShadow = '0 0 0 2px rgba(67, 181, 129, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(32, 34, 37, 0.5)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </>
          ) : (
            <div style={{ marginBottom: '30px' }}>
              <div style={{
                background: 'rgba(32, 34, 37, 0.5)',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '20px',
                borderLeft: '3px solid #43b581',
                textAlign: 'center'
              }}>
                <div style={{
                  color: '#43b581',
                  fontSize: '32px',
                  marginBottom: '10px'
                }}>✉️</div>
                <p style={{
                  color: '#b9bbbe',
                  fontSize: '14px',
                  marginBottom: '5px'
                }}>
                  We've sent a verification code to
                </p>
                <p style={{
                  color: '#ffffff',
                  fontWeight: '600',
                  fontSize: '15px'
                }}>{email}</p>
              </div>
              
              <label htmlFor="otp" style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#8e9297',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>VERIFICATION CODE</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter the 6-digit code from your email"
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
                  outline: 'none',
                  textAlign: 'center',
                  letterSpacing: '8px',
                  fontWeight: '600'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#43b581';
                  e.target.style.boxShadow = '0 0 0 2px rgba(67, 181, 129, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(32, 34, 37, 0.5)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <div style={{
                color: '#8e9297',
                fontSize: '12px',
                marginTop: '8px',
                textAlign: 'center'
              }}>
                Check your email inbox for the verification code
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#3ba55d' : 'linear-gradient(135deg, #43b581 0%, #3ba55d 100%)',
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
              animation: loading ? 'none' : 'buttonGlow 2s infinite'
            }} />
            <span style={{ position: 'relative', zIndex: 1 }}>
              {loading ? 'Processing...' : (step === 1 ? 'Send Verification Code' : 'Create Account')}
            </span>
          </button>
          
          {step === 2 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'transparent',
                color: '#b9bbbe',
                border: '1px solid #4f545c',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s',
                marginBottom: '24px'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(79, 84, 92, 0.2)';
                e.target.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#b9bbbe';
              }}
            >
              ← Go back to edit information
            </button>
          )}
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
            Already have an account?
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
            Sign in instead
          </Link>
        </div>
      </div>

      <style>{`
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
      `}</style>
    </div>
  );
};

export default Register;