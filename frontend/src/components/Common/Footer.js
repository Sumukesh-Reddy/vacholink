import React, { useState, useEffect } from 'react';

const Footer = () => {
  const [stars, setStars] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Generate minimal stars
    const generateStars = () => {
      const starCount = isMobile ? 15 : 30;
      const newStars = [];
      for (let i = 0; i < starCount; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 0.8 + 0.2,
          opacity: Math.random() * 0.3 + 0.1,
          delay: Math.random() * 2,
          duration: Math.random() * 1 + 0.5,
        });
      }
      setStars(newStars);
    };

    generateStars();
    const starInterval = setInterval(generateStars, 15000);

    return () => {
      clearInterval(starInterval);
      window.removeEventListener('resize', checkMobile);
    };
  }, [isMobile]);

  return (
    <footer className="footer">
      {/* Minimal stars */}
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
            }}
          />
        ))}
      </div>

      {/* Footer content - Exactly 2 lines */}
      <div className="footer-content">
        {/* Line 1: Logo and social links */}
        <div className="footer-top-line">
          <div className="footer-logo">
            <span className="logo-icon">ꍡ</span>
            <span className="logo-text">VachoLink</span>
          </div>
          
          <div className="footer-socials">
            <a 
              href="https://github.com/Sumukesh-Reddy" 
              className="social-link"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub"
            >
              {"</>"}
            </a>
            <a 
              href="mailto:sumukeshmopuram1@gmail.com" 
              className="social-link"
              title="Email"
            >
              @
            </a>
            <a 
              href="https://www.linkedin.com/in/sumukesh-reddy-mopuram/" 
              className="social-link"
              target="_blank"
              rel="noopener noreferrer"
              title="LinkedIn"
            >
              in
            </a>
            <a 
                href="http://sumukesh-portfolio.vercel.app" 
                className="social-link"
                target="_blank"
                rel="noopener noreferrer"
                title="Portfolio"
            >
                ⎙
            </a>
          </div>
        </div>

        {/* Line 2: Copyright and status */}
        <div className="footer-bottom-line">
          <span className="copyright">
            © {new Date().getFullYear()} VachoLink
          </span>
          <div className="footer-meta">
            <span className="status">
              <span className="dot" /> Live
            </span>
            <span className="separator">•</span>
            <span className="version">v1.0.0</span>
          </div>
        </div>
      </div>

      <style>{`
        /* Base footer - Very compact */
        .footer {
          background: #0a0a0a;
          position: relative;
          overflow: hidden;
          border-top: 1px solid rgba(32, 34, 37, 0.3);
          padding: 15px 20px;
          margin-top: auto;
          height: 70px;
        }

        /* Minimal stars */
        .footer-stars {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 0;
        }

        .footer-star {
          position: absolute;
          border-radius: 50%;
          background: #ffffff;
          filter: blur(0.2px);
          animation: starTwinkle infinite alternate;
        }

        /* Footer content */
        .footer-content {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
          height: 100%;
          justify-content: space-between;
        }

        /* Top line: Logo and social links */
        .footer-top-line {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .logo-icon {
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #7289da 0%, #5b6eae 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
          box-shadow: 0 0 10px rgba(114, 137, 218, 0.3);
        }

        .logo-text {
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          font-family: "'Ginto', sans-serif";
        }

        .footer-socials {
          display: flex;
          gap: 12px;
        }

        .social-link {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          background: #202225;
          color: #b9bbbe;
          text-decoration: none;
          font-size: 12px;
          font-weight: bold;
          font-family: 'Courier New', monospace;
          transition: all 0.2s;
        }

        .social-link:hover {
          background: #7289da;
          color: white;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(114, 137, 218, 0.3);
        }

        /* Bottom line: Copyright and status */
        .footer-bottom-line {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
          color: #8e9297;
        }

        .copyright {
          opacity: 0.8;
        }

        .footer-meta {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .status {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #43b581;
          font-weight: 500;
        }

        .dot {
          width: 5px;
          height: 5px;
          background: #43b581;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .separator {
          opacity: 0.4;
        }

        .version {
          font-family: 'Courier New', monospace;
          font-size: 10px;
          opacity: 0.7;
        }

        /* Animations */
        @keyframes starTwinkle {
          0%, 100% { 
            opacity: 0.1;
          }
          50% { 
            opacity: 0.3;
          }
        }

        @keyframes pulse {
          0%, 100% { 
            opacity: 1;
          }
          50% { 
            opacity: 0.5;
          }
        }

        /* Mobile styles */
        @media (max-width: 768px) {
          .footer {
            padding: 12px 15px;
            height: 65px;
          }

          .footer-content {
            gap: 6px;
          }

          .logo-icon {
            width: 18px;
            height: 18px;
            font-size: 11px;
          }

          .logo-text {
            font-size: 13px;
          }

          .social-link {
            width: 22px;
            height: 22px;
            font-size: 11px;
          }

          .footer-bottom-line {
            font-size: 10px;
          }

          .version {
            font-size: 9px;
          }

          .footer-socials {
            gap: 10px;
          }
        }

        /* Extra small screens */
        @media (max-width: 480px) {
          .footer {
            padding: 10px 12px;
            height: 60px;
          }

          .logo-text {
            font-size: 12px;
          }

          .footer-bottom-line {
            flex-direction: column;
            align-items: flex-start;
            gap: 2px;
          }

          .footer-meta {
            gap: 6px;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;