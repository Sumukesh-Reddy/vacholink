import React, { useState, useEffect, useRef } from 'react';

const FriendProfileModal = ({ user, onClose }) => {
  const [stars, setStars] = useState([]);
  const modalRef = useRef();

  useEffect(() => {
    // Generate stars for the interstellar theme
    const starCount = 150;
    const newStars = [];
    for (let i = 0; i < starCount; i++) {
      newStars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.1,
        delay: Math.random() * 3,
        duration: Math.random() * 2 + 1
      });
    }
    setStars(newStars);
  }, []);

  if (!user) return null;

  return (
    <div className="friend-modal-overlay" onClick={onClose}>
      <div className="friend-modal-content" onClick={e => e.stopPropagation()} ref={modalRef}>
        {/* Interstellar Background */}
        <div className="friend-modal-bg">
          {stars.map(star => (
            <div
              key={star.id}
              className="friend-star"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: star.opacity,
                animationDelay: `${star.delay}s`,
                animationDuration: `${star.duration}s`
              }}
            />
          ))}
          <div className="friend-modal-glow" />
        </div>

        {/* Close Button */}
        <button className="friend-modal-close" onClick={onClose}>×</button>

        {/* Profile Content */}
        <div className="friend-profile-body">
          <div className="friend-avatar-wrapper">
            <img
              src={user.profilePhoto || `https://ui-avatars.com/api/?name=${user.name}&background=7289da&color=fff`}
              alt={user.name}
              className="friend-large-avatar"
            />
            <div className={`friend-status-indicator ${user.online ? 'online' : 'offline'}`} />
          </div>

          <h2 className="friend-name">{user.name}</h2>
          <p className="friend-email">{user.email}</p>

          <div className="friend-info-badges">
            <span className="friend-badge">
              {user.online ? '🟢 Online' : '⚪ Offline'}
            </span>
            {user.createdAt && (
              <span className="friend-badge">
                🗓️ Joined {new Date(user.createdAt).toLocaleDateString()}
              </span>
            )}
          </div>

          <div className="friend-about-section">
            <h3>About</h3>
            <div className="friend-bio-container">
              {user.bio ? (
                <p className="friend-bio">"{user.bio}"</p>
              ) : (
                <p className="friend-bio-empty">This user hasn't added a bio yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .friend-modal-overlay {
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
          z-index: 3000;
          padding: 20px;
          animation: fadeIn 0.3s ease-out;
        }

        .friend-modal-content {
          background: #2f3136;
          border-radius: 20px;
          width: 100%;
          max-width: 450px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(114, 137, 218, 0.2);
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .friend-modal-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #1a1c22 0%, #0a0a0a 100%);
          z-index: 0;
        }

        .friend-star {
          position: absolute;
          background: white;
          border-radius: 50%;
          animation: twinkle alternate infinite ease-in-out;
        }

        .friend-modal-glow {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          height: 150px;
          background: radial-gradient(circle at 50% 0%, rgba(114, 137, 218, 0.15), transparent 70%);
          pointer-events: none;
        }

        .friend-modal-close {
          position: absolute;
          top: 15px;
          right: 15px;
          background: rgba(0, 0, 0, 0.3);
          border: none;
          color: #b9bbbe;
          font-size: 28px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          transition: all 0.2s;
        }

        .friend-modal-close:hover {
          background: rgba(114, 137, 218, 0.2);
          color: white;
          transform: rotate(90deg);
        }

        .friend-profile-body {
          position: relative;
          z-index: 1;
          padding: 40px 30px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .friend-avatar-wrapper {
          position: relative;
          margin-bottom: 20px;
        }

        .friend-large-avatar {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid #7289da;
          box-shadow: 0 0 30px rgba(114, 137, 218, 0.3);
        }

        .friend-status-indicator {
          position: absolute;
          bottom: 10px;
          right: 10px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 4px solid #2f3136;
        }

        .friend-status-indicator.online { background: #43b581; }
        .friend-status-indicator.offline { background: #747f8d; }

        .friend-name {
          color: white;
          margin: 0;
          font-size: 28px;
          font-weight: 700;
        }

        .friend-email {
          color: #b9bbbe;
          margin: 5px 0 20px;
          font-size: 14px;
        }

        .friend-info-badges {
          display: flex;
          gap: 10px;
          margin-bottom: 30px;
        }

        .friend-badge {
          background: rgba(32, 34, 37, 0.6);
          padding: 6px 12px;
          border-radius: 20px;
          color: #dcddde;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .friend-about-section {
          width: 100%;
          text-align: left;
        }

        .friend-about-section h3 {
          color: #8e9297;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 10px;
        }

        .friend-bio-container {
          background: rgba(32, 34, 37, 0.8);
          padding: 15px;
          border-radius: 12px;
          border-left: 3px solid #7289da;
        }

        .friend-bio {
          color: #dcddde;
          line-height: 1.5;
          font-style: italic;
          margin: 0;
        }

        .friend-bio-empty {
          color: #72767d;
          font-style: italic;
          margin: 0;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes twinkle {
          0% { opacity: 0.2; transform: scale(1); }
          100% { opacity: 0.8; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default FriendProfileModal;
