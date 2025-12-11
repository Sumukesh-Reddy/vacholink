import React, { useState, useEffect } from 'react';

const Footer = () => {
  const [stars, setStars] = useState([]);
  const [shootingStars, setShootingStars] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Generate static stars
    const generateStars = () => {
      const starCount = isMobile ? 40 : 80;
      const newStars = [];
      for (let i = 0; i < starCount; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * (isMobile ? 1 : 1.5) + 0.3,
          opacity: Math.random() * 0.4 + 0.1,
          delay: Math.random() * 3,
          duration: Math.random() * 2 + 1,
          type: Math.random() > 0.9 ? 'blue' : 'white'
        });
      }
      setStars(newStars);
    };

    // Generate shooting stars
    const generateShootingStars = () => {
      const shootingCount = isMobile ? 1 : 2;
      const newShootingStars = [];
      for (let i = 0; i < shootingCount; i++) {
        const startX = Math.random() * 100;
        const startY = Math.random() * 20;
        newShootingStars.push({
          id: i,
          x: startX,
          y: startY,
          duration: Math.random() * 2 + 1,
          delay: Math.random() * 10
        });
      }
      setShootingStars(newShootingStars);
    };

    generateStars();
    generateShootingStars();

    // Regenerate shooting stars periodically
    const shootingInterval = setInterval(generateShootingStars, 8000);
    const starInterval = setInterval(generateStars, 20000);

    return () => {
      clearInterval(shootingInterval);
      clearInterval(starInterval);
      window.removeEventListener('resize', checkMobile);
    };
  }, [isMobile]);

  return (
    <footer className="footer">
      {/* Background gradient */}
      <div className="footer-bg-gradient" />
      
      {/* Stars layer */}
      <div className="footer-stars">
        {stars.map(star => (
          <div
            key={star.id}
            className="footer-star"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
              background: star.type === 'blue' ? '#7289da' : '#ffffff'
            }}
          />
        ))}
      </div>

      {/* Shooting stars layer */}
      <div className="footer-shooting-stars">
        {shootingStars.map(star => (
          <div
            key={star.id}
            className="footer-shooting-star"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`
            }}
          />
        ))}
      </div>

      {/* Footer content */}
      <div className="footer-content">
        <div className="footer-main">
          <div className="footer-logo-section">
            <div className="footer-logo">
              <div className="logo-icon">ꍡ</div>
              <span className="logo-text">VachoLink</span>
            </div>
            <p className="footer-tagline">
              Real-time communication made beautiful
            </p>
          </div>

          <div className="footer-social-links">
            <a 
              href="https://github.com/Sumukesh-Reddy" 
              className="social-link"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub"
            >
              <span className="social-icon github">{"</>"}</span>
              <span className="social-text">GitHub</span>
            </a>
            <a 
              href="mailto:sumukeshmopuram1@gmail.com" 
              className="social-link"
              title="Email"
            >
              <span className="social-icon mail">@</span>
              <span className="social-text">Email</span>
            </a>
            <a 
              href="https://www.linkedin.com/in/sumukesh-reddy-mopuram/" 
              className="social-link"
              target="_blank"
              rel="noopener noreferrer"
              title="LinkedIn"
            >
              <span className="social-icon linkedin">in</span>
              <span className="social-text">LinkedIn</span>
            </a>
            <a 
              href="http://sumukesh-portfolio.vercel.app" 
              className="social-link"
              target="_blank"
              rel="noopener noreferrer"
              title="Portfolio"
            >
              <span className="social-icon portfolio">⎙</span>
              <span className="social-text">Portfolio</span>
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-info">
            <div className="footer-copyright">
              © {new Date().getFullYear()} VachoLink • All rights reserved
            </div>
            <div className="footer-status">
              <span className="status-dot" />
              <span className="status-text">Live</span>
              <span className="separator">•</span>
              <span className="version">v1.0.0</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* Base footer styles - More compact */
        .footer {
          background: #0a0a0a;
          position: relative;
          overflow: hidden;
          border-top: 1px solid rgba(32, 34, 37, 0.5);
          padding: 30px 20px 20px;
          margin-top: auto;
        }

        .footer-bg-gradient {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(180deg, rgba(26, 28, 34, 0.3) 0%, rgba(10, 10, 10, 1) 100%);
          pointer-events: none;
        }

        /* Stars - Fewer and smaller */
        .footer-stars, .footer-shooting-stars {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 1;
        }

        .footer-star {
          position: absolute;
          border-radius: 50%;
          filter: blur(0.3px);
          animation: starTwinkle infinite alternate;
        }

        .footer-shooting-star {
          position: absolute;
          width: 60px;
          height: 1px;
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, #ffffff 50%, rgba(255,255,255,0) 100%);
          opacity: 0;
          transform: translateX(0) rotate(45deg);
          animation: shootingStar linear forwards;
          filter: blur(0.5px);
        }

        /* Footer content - Compact layout */
        .footer-content {
          position: relative;
          z-index: 2;
          max-width: 800px;
          margin: 0 auto;
        }

        .footer-main {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 25px;
          margin-bottom: 25px;
        }

        /* Logo section - More compact */
        .footer-logo-section {
          text-align: center;
        }

        .footer-logo {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
          text-decoration: none;
        }

        .logo-icon {
          width: 30px;
          height: 30px;
          background: linear-gradient(135deg, #7289da 0%, #5b6eae 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 16px;
          box-shadow: 0 0 15px rgba(114, 137, 218, 0.4);
        }

        .logo-text {
          color: #ffffff;
          font-size: 18px;
          font-weight: 700;
          font-family: "'Ginto', sans-serif";
        }

        .footer-tagline {
          color: #8e9297;
          font-size: 13px;
          margin: 0;
          font-style: italic;
        }

        /* Social links - Compact and stylish */
        .footer-social-links {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 20px;
        }

        .social-link {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          text-decoration: none;
          padding: 8px 12px;
          border-radius: 8px;
          transition: all 0.3s ease;
          min-width: 70px;
        }

        .social-link:hover {
          background: rgba(114, 137, 218, 0.1);
          transform: translateY(-3px);
        }

        .social-icon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          font-weight: bold;
          font-size: 16px;
          transition: all 0.3s ease;
          font-family: 'Courier New', monospace;
        }

        .github {
          background: linear-gradient(135deg, #333 0%, #24292e 100%);
          color: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .mail {
          background: linear-gradient(135deg, #ea4335 0%, #d14836 100%);
          color: white;
          box-shadow: 0 2px 8px rgba(234, 67, 53, 0.3);
        }

        .linkedin {
          background: linear-gradient(135deg, #0077b5 0%, #005582 100%);
          color: white;
          box-shadow: 0 2px 8px rgba(0, 119, 181, 0.3);
        }

        .portfolio {
          background: linear-gradient(135deg, #43b581 0%, #3ba55d 100%);
          color: white;
          box-shadow: 0 2px 8px rgba(67, 181, 129, 0.3);
        }

        .social-link:hover .social-icon {
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 4px 12px rgba(114, 137, 218, 0.4);
        }

        .social-text {
          color: #b9bbbe;
          font-size: 12px;
          font-weight: 500;
          transition: color 0.3s;
        }

        .social-link:hover .social-text {
          color: #ffffff;
        }

        /* Bottom section - Compact */
        .footer-bottom {
          border-top: 1px solid rgba(32, 34, 37, 0.3);
          padding-top: 20px;
        }

        .footer-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          color: #8e9297;
          font-size: 12px;
        }

        .footer-copyright {
          text-align: center;
        }

        .footer-status {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          background: #43b581;
          border-radius: 50%;
          animation: statusPulse 2s infinite;
        }

        .status-text {
          font-weight: 600;
          color: #43b581;
        }

        .separator {
          opacity: 0.5;
        }

        .version {
          font-family: 'Courier New', monospace;
        }

        /* Animations - Optimized */
        @keyframes starTwinkle {
          0%, 100% { 
            opacity: 0.1; 
            transform: scale(1);
          }
          50% { 
            opacity: 0.4; 
            transform: scale(1.2);
          }
        }

        @keyframes shootingStar {
          0% {
            opacity: 0;
            transform: translateX(0) rotate(45deg);
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            opacity: 0;
            transform: translateX(-100px) rotate(45deg);
          }
        }

        @keyframes statusPulse {
          0%, 100% { 
            opacity: 1;
            transform: scale(1);
          }
          50% { 
            opacity: 0.6;
            transform: scale(1.2);
          }
        }

        /* Mobile styles */
        @media (max-width: 768px) {
          .footer {
            padding: 25px 15px 15px;
          }

          .footer-main {
            gap: 20px;
            margin-bottom: 20px;
          }

          .footer-social-links {
            gap: 15px;
          }

          .social-link {
            padding: 6px 10px;
            min-width: 65px;
          }

          .social-icon {
            width: 32px;
            height: 32px;
            font-size: 14px;
          }

          .social-text {
            font-size: 11px;
          }

          .logo-icon {
            width: 28px;
            height: 28px;
            font-size: 15px;
          }

          .logo-text {
            font-size: 16px;
          }

          .footer-tagline {
            font-size: 12px;
          }

          .footer-info {
            font-size: 11px;
          }
        }

        /* Tablet styles */
        @media (min-width: 769px) and (max-width: 1024px) {
          .footer-content {
            max-width: 90%;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;