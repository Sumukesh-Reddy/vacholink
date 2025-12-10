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
    // Generate smaller, more subtle stars
    const generateStars = () => {
      const starCount = 400;
      const newStars = [];
      for (let i = 0; i < starCount; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 2 + 0.5, 
          opacity: Math.random() * 0.3 + 0.1,
          delay: Math.random() * 4,
          duration: Math.random() * 2 + 1,
          twinkleSpeed: Math.random() * 1 + 0.5 
        });
      }
      setStars(newStars);
    };
    
    generateStars();
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
      {/* Subtle gradient background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(ellipse at center, #1a1c22 0%, #0a0a0a 70%)',
        pointerEvents: 'none'
      }} />
      
      {/* Small twinkling stars */}
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
              animation: `smallTwinkle ${star.duration}s infinite ${star.delay}s alternate`,
              filter: 'blur(0.3px)'
            }}
          />
        ))}
      </div>
      
      {/* Floating particles */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none'
      }}>
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: '0.5px',
              height: '0.5px',
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '50%',
              animation: `particleFloat ${Math.random() * 10 + 5}s linear infinite ${Math.random() * 2}s`,
              boxShadow: '0 0 2px rgba(255, 255, 255, 0.1)'
            }}
          />
        ))}
      </div>
      
      {/* VachoLink logo glow */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(114, 137, 218, 0.15) 0%, transparent 70%)',
        filter: 'blur(20px)',
        animation: 'logoGlow 4s ease-in-out infinite alternate',
        pointerEvents: 'none',
        zIndex: 0
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
        {/* Card glow effect */}
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
        
        {/* Logo */}
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
            background: 'linear-gradient(135deg, #7289da 0%, #5b6eae 100%)',
            borderRadius: '50%',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '28px',
            marginBottom: '16px',
            boxShadow: '0 0 20px rgba(114, 137, 218, 0.4)',
            animation: 'logoFloat 3s ease-in-out infinite'
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
          }}>Welcome to VachoLink</h2>
          <p style={{
            textAlign: 'center',
            color: '#b9bbbe',
            fontSize: '14px'
          }}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit}>
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
                e.target.style.borderColor = '#7289da';
                e.target.style.boxShadow = '0 0 0 2px rgba(114, 137, 218, 0.2)';
                e.target.style.background = 'rgba(32, 34, 37, 0.9)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(32, 34, 37, 0.5)';
                e.target.style.boxShadow = 'none';
                e.target.style.background = 'rgba(32, 34, 37, 0.7)';
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
              placeholder="Enter your password"
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
                e.target.style.borderColor = '#7289da';
                e.target.style.boxShadow = '0 0 0 2px rgba(114, 137, 218, 0.2)';
                e.target.style.background = 'rgba(32, 34, 37, 0.9)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(32, 34, 37, 0.5)';
                e.target.style.boxShadow = 'none';
                e.target.style.background = 'rgba(32, 34, 37, 0.7)';
              }}
            />
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <input
                type="checkbox"
                id="remember"
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: '#7289da',
                  cursor: 'pointer',
                  borderRadius: '3px'
                }}
              />
              <label htmlFor="remember" style={{
                color: '#b9bbbe',
                fontSize: '13px',
                cursor: 'pointer'
              }}>Remember me</label>
            </div>
            <Link to="/forgot-password" style={{
              color: '#7289da',
              fontSize: '13px',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.8'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#677bc4' : 'linear-gradient(135deg, #7289da 0%, #5b6eae 100%)',
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
              animation: loading ? 'none' : 'buttonShine 3s infinite'
            }} />
            <span style={{ position: 'relative', zIndex: 1 }}>
              {loading ? 'Signing in...' : 'Sign In'}
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
            Don't have an account?
          </p>
          <Link to="/register" style={{
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
            Create an account
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes smallTwinkle {
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
      `}</style>
    </div>
  );
};

export default Login;