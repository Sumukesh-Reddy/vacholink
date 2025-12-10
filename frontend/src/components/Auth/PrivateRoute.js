import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const [stars, setStars] = useState([]);

  useEffect(() => {
    if (loading) {
      // Generate responsive stars
      const generateStars = () => {
        const isMobile = window.innerWidth <= 768;
        const starCount = isMobile ? 20 : 40;
        const newStars = [];
        for (let i = 0; i < starCount; i++) {
          newStars.push({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * (isMobile ? 1.5 : 2) + (isMobile ? 0.3 : 0.5),
            opacity: Math.random() * 0.2 + 0.1,
            delay: Math.random() * 4,
            duration: Math.random() * 2 + 1,
            type: Math.random() > 0.7 ? 'blue' : 'white'
          });
        }
        setStars(newStars);
      };
      
      generateStars();
      window.addEventListener('resize', generateStars);
      return () => window.removeEventListener('resize', generateStars);
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="private-loading-container">
        {/* Background gradient */}
        <div className="private-bg-gradient" />
        
        {/* Stars */}
        <div className="private-stars">
          {stars.map(star => (
            <div
              key={star.id}
              className="private-star"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                background: star.type === 'blue' ? '#7289da' : '#ffffff',
                opacity: star.opacity,
                animation: `privateTwinkle ${star.duration}s infinite ${star.delay}s alternate`,
              }}
            />
          ))}
        </div>
        
        {/* Glow effect */}
        <div className="private-glow" />

        {/* Loading content */}
        <div className="private-content">
          {/* Logo */}
          <div className="private-logo">
            ꍡ
            <div className="private-logo-pulse" />
          </div>
          
          {/* Spinner */}
          <div className="private-spinner">
            <div className="private-spinner-outer" />
            <div className="private-spinner-inner" />
          </div>
          
          {/* Text */}
          <div className="private-text">
            <p className="private-text-title">Securing your connection</p>
            <p className="private-text-subtitle">Please wait while we verify your session</p>
          </div>
          
          {/* Loading dots */}
          <div className="private-dots">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="private-dot"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>

        <style>{`
          /* Base styles */
          .private-loading-container {
            height: 100vh;
            background: #0a0a0a;
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }

          .private-bg-gradient {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(ellipse at center, #1a1c22 0%, #0a0a0a 70%);
            pointer-events: none;
          }

          .private-stars {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
          }

          .private-star {
            position: absolute;
            border-radius: 50%;
            filter: blur(0.3px);
          }

          .private-glow {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 200px;
            height: 200px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(114, 137, 218, 0.1) 0%, transparent 70%);
            filter: blur(30px);
            animation: privateGlow 4s ease-in-out infinite alternate;
            pointer-events: none;
          }

          /* Content container */
          .private-content {
            position: relative;
            z-index: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 24px;
            width: 90%;
            max-width: 500px;
            text-align: center;
          }

          /* Logo */
          .private-logo {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #7289da 0%, #5b6eae 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 36px;
            animation: privateLogoFloat 3s ease-in-out infinite;
            box-shadow: 0 0 30px rgba(114, 137, 218, 0.5);
            position: relative;
          }

          .private-logo-pulse {
            position: absolute;
            top: -10px;
            left: -10px;
            right: -10px;
            bottom: -10px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(114, 137, 218, 0.2) 0%, transparent 70%);
            animation: privateLogoPulse 2s ease-in-out infinite;
            pointer-events: none;
          }

          /* Spinner */
          .private-spinner {
            position: relative;
            width: 60px;
            height: 60px;
          }

          .private-spinner-outer {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border: 3px solid rgba(32, 34, 37, 0.3);
            border-top: 3px solid #7289da;
            border-radius: 50%;
            animation: privateSpin 1.5s linear infinite;
            box-shadow: 0 0 20px rgba(114, 137, 218, 0.3);
          }

          .private-spinner-inner {
            position: absolute;
            top: 10px;
            left: 10px;
            right: 10px;
            bottom: 10px;
            border: 3px solid rgba(32, 34, 37, 0.2);
            border-bottom: 3px solid #43b581;
            border-radius: 50%;
            animation: privateSpinReverse 2s linear infinite;
          }

          /* Text */
          .private-text-title {
            color: #ffffff;
            font-family: "'Whitney', sans-serif";
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 8px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.5);
          }

          .private-text-subtitle {
            color: #b9bbbe;
            font-family: "'Whitney', sans-serif";
            font-size: 14px;
            opacity: 0.8;
          }

          /* Dots */
          .private-dots {
            display: flex;
            gap: 8px;
            margin-top: 20px;
          }

          .private-dot {
            width: 8px;
            height: 8px;
            background: #7289da;
            border-radius: 50%;
            animation: privateDotPulse 1.2s ease-in-out infinite;
          }

          /* Animations */
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
              box-shadow: 0 0 35px rgba(114, 137, 218, 0.55);
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

          /* Mobile styles */
          @media (max-width: 768px) {
            .private-content {
              gap: 20px;
              padding: 0 20px;
            }

            .private-logo {
              width: 60px;
              height: 60px;
              font-size: 28px;
            }

            .private-logo-pulse {
              top: -8px;
              left: -8px;
              right: -8px;
              bottom: -8px;
            }

            .private-spinner {
              width: 50px;
              height: 50px;
            }

            .private-spinner-outer {
              border-width: 2px;
            }

            .private-spinner-inner {
              top: 8px;
              left: 8px;
              right: 8px;
              bottom: 8px;
              border-width: 2px;
            }

            .private-text-title {
              font-size: 16px;
            }

            .private-text-subtitle {
              font-size: 13px;
            }

            .private-dots {
              margin-top: 15px;
            }

            .private-dot {
              width: 6px;
              height: 6px;
            }

            .private-glow {
              width: 150px;
              height: 150px;
              filter: blur(20px);
            }
          }

          /* Small mobile */
          @media (max-width: 480px) {
            .private-content {
              gap: 16px;
            }

            .private-logo {
              width: 50px;
              height: 50px;
              font-size: 24px;
            }

            .private-spinner {
              width: 40px;
              height: 40px;
            }

            .private-text-title {
              font-size: 15px;
            }

            .private-text-subtitle {
              font-size: 12px;
            }
          }
        `}</style>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
