import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const [stars, setStars] = useState([]);

  useEffect(() => {
    if (loading) {
      // Generate stars only when loading
      const generateStars = () => {
        const starCount = 40;
        const newStars = [];
        for (let i = 0; i < starCount; i++) {
          newStars.push({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.2 + 0.1,
            delay: Math.random() * 4,
            duration: Math.random() * 2 + 1,
            type: Math.random() > 0.7 ? 'blue' : 'white'
          });
        }
        setStars(newStars);
      };
      
      generateStars();
    }
  }, [loading]);

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        background: '#0a0a0a',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
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
                animation: `privateTwinkle ${star.duration}s infinite ${star.delay}s alternate`,
                filter: 'blur(0.3px)'
              }}
            />
          ))}
        </div>
        
        {/* Loading glow */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(114, 137, 218, 0.1) 0%, transparent 70%)',
          filter: 'blur(30px)',
          animation: 'privateGlow 4s ease-in-out infinite alternate',
          pointerEvents: 'none'
        }} />

        {/* Loading content */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px'
        }}>
          {/* Logo */}
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #7289da 0%, #5b6eae 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '36px',
            animation: 'privateLogoFloat 3s ease-in-out infinite',
            boxShadow: '0 0 30px rgba(114, 137, 218, 0.5)',
            position: 'relative'
          }}>
            ꍡ
            <div style={{
              position: 'absolute',
              top: '-10px',
              left: '-10px',
              right: '-10px',
              bottom: '-10px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(114, 137, 218, 0.2) 0%, transparent 70%)',
              animation: 'privateLogoPulse 2s ease-in-out infinite',
              pointerEvents: 'none'
            }} />
          </div>
          
          {/* Spinner */}
          <div style={{
            position: 'relative',
            width: '60px',
            height: '60px'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              border: '3px solid rgba(32, 34, 37, 0.3)',
              borderTop: '3px solid #7289da',
              borderRadius: '50%',
              animation: 'privateSpin 1.5s linear infinite',
              boxShadow: '0 0 20px rgba(114, 137, 218, 0.3)'
            }} />
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              right: '10px',
              bottom: '10px',
              border: '3px solid rgba(32, 34, 37, 0.2)',
              borderBottom: '3px solid #43b581',
              borderRadius: '50%',
              animation: 'privateSpinReverse 2s linear infinite'
            }} />
          </div>
          
          {/* Text */}
          <div style={{
            textAlign: 'center'
          }}>
            <p style={{ 
              color: '#ffffff', 
              fontFamily: "'Whitney', sans-serif",
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '8px',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)'
            }}>Securing your connection</p>
            <p style={{ 
              color: '#b9bbbe', 
              fontFamily: "'Whitney', sans-serif",
              fontSize: '14px',
              opacity: 0.8
            }}>Please wait while we verify your session</p>
          </div>
          
          {/* Loading dots */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginTop: '20px'
          }}>
            {[0, 1, 2].map(i => (
              <div
                key={i}
                style={{
                  width: '8px',
                  height: '8px',
                  background: '#7289da',
                  borderRadius: '50%',
                  animation: `privateDotPulse 1.2s ease-in-out infinite ${i * 0.2}s`
                }}
              />
            ))}
          </div>
        </div>

        <style>{`
          @keyframes privateTwinkle {
            0%, 100% { 
              opacity: 0.1; 
              transform: scale(1);
            }
            50% { 
              opacity: 0.3; 
              transform: scale(1.5);
            }
          }
          
          @keyframes privateGlow {
            0%, 100% { 
              opacity: 0.1;
            }
            50% { 
              opacity: 0.2;
            }
          }
          
          @keyframes privateLogoFloat {
            0%, 100% { 
              transform: scale(1) rotate(0deg);
              box-shadow: 0 0 30px rgba(114, 137, 218, 0.5);
            }
            33% { 
              transform: scale(1.05) rotate(5deg);
              box-shadow: 0 0 40px rgba(114, 137, 218, 0.6);
            }
            66% { 
              transform: scale(1.03) rotate(-5deg);
              boxShadow: 0 0 35px rgba(114, 137, 218, 0.55);
            }
          }
          
          @keyframes privateLogoPulse {
            0%, 100% { 
              opacity: 0.3;
              transform: scale(1);
            }
            50% { 
              opacity: 0.5;
              transform: scale(1.2);
            }
          }
          
          @keyframes privateSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes privateSpinReverse {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(-360deg); }
          }
          
          @keyframes privateDotPulse {
            0%, 100% { 
              transform: scale(1);
              opacity: 0.4;
            }
            50% { 
              transform: scale(1.3);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;