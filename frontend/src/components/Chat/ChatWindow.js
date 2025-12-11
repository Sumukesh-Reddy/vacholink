import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const ChatWindow = ({ room, messages, onSendMessage, onTyping, onDeleteRoom, onBack, isMobile }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const [stars, setStars] = useState([]);
  
  const otherParticipant = room.participants?.find(p => p._id !== user?._id) || room.participants?.[0];

  useEffect(() => {
    // Generate responsive stars
    const generateStars = () => {
      const starCount = isMobile ? 200 : 500;
      const newStars = [];
      for (let i = 0; i < starCount; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * (isMobile ? 1.5 : 2) + 1,
          opacity: Math.random() * 0.5 + 0.2,
          delay: Math.random() * 3,
          duration: Math.random() * 2 + 1
        });
      }
      setStars(newStars);
    };
    
    generateStars();
  }, [isMobile]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
      setIsTyping(false);
      onTyping(false);
    }
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    
    if (!isTyping && e.target.value.trim()) {
      setIsTyping(true);
      onTyping(true);
    } else if (isTyping && !e.target.value.trim()) {
      setIsTyping(false);
      onTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="chat-window-container">
      
      <div className="chat-stars-bg">
        {stars.map(star => (
          <div
            key={star.id}
            className="chat-star-bg"
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
      </div>

      
      <div className="chat-bg-overlay" />

      <div className="chat-header">
        {/* Mobile Back Button */}
        {isMobile && onBack && (
          <button 
            className="mobile-back-button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onBack();
            }}
            aria-label="Back to chats"
          >
            ←
          </button>
        )}
        
        <div className="header-user">
          <div className="user-avatar-container">
            <img
              src={otherParticipant?.profilePhoto || `https://ui-avatars.com/api/?name=${otherParticipant?.name}&background=7289da&color=fff`}
              alt={otherParticipant?.name}
              className="user-avatar"
            />
            {otherParticipant?.online && (
              <div className="online-indicator" />
            )}
          </div>
          <div className="user-info">
            <div className="user-name">{otherParticipant?.name || 'Unknown User'}</div>
            <div className="user-status">
              <div className={`status-dot ${otherParticipant?.online ? 'online' : 'offline'}`} />
              <span className="status-text">
                {otherParticipant?.online ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button 
            className="delete-button"
            onClick={onDeleteRoom}
          >
            Delete chat
          </button>
        </div>
      </div>
      
      <div className="messages-container">
        
        <div className="messages-particles">
          {Array.from({ length: isMobile ? 8 : 15 }).map((_, i) => (
            <div
              key={i}
              className="messages-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${Math.random() * 5 + 3}s`
              }}
            />
          ))}
        </div>

        {messages.map(msg => {
          const isOwnMessage = msg.sender?._id === user?._id;
          const messageDate = new Date(msg.createdAt);
          const isToday = messageDate.toDateString() === new Date().toDateString();
          
          return (
            <div 
              key={msg._id} 
              className={`message-wrapper ${isOwnMessage ? 'own-message' : 'other-message'}`}
            >
              {!isOwnMessage && (
                <img
                  src={msg.sender?.profilePhoto || `https://ui-avatars.com/api/?name=${msg.sender?.name}&background=7289da&color=fff`}
                  alt={msg.sender?.name}
                  className="message-avatar"
                />
              )}
              
              <div className="message-content-wrapper">
                {!isOwnMessage && (
                  <div className="message-sender">
                    {msg.sender?.name}<br/>
                    {msg.sender?.lastSeen }
                    this
                  </div>
                )}
                <div className="message-bubble">
                  
                  <div className="message-glow" />
                  
                  {msg.type === 'image' && msg.mediaUrl ? (
                    <img 
                      src={msg.mediaUrl} 
                      alt="attachment" 
                      className="message-image"
                    />
                  ) : (
                    <span className="message-text">
                      {msg.content}
                    </span>
                  )}
                </div>
                <div className="message-info">
                  {isToday 
                    ? messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : messageDate.toLocaleDateString() + ' ' + messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }
                  {isOwnMessage && msg.read && (
                    <span className="read-indicator">✓✓</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} className="messages-end" />
      </div>
      
      <div className="message-input-container">
        <form onSubmit={handleSubmit} className="message-form">
          <textarea
            value={message}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="message-textarea"
            rows="1"
          />
          <button 
            type="submit" 
            className="send-button"
            disabled={!message.trim()}
          >
            
            <div className="send-button-glow" />
            <span className="send-icon">➤</span>
          </button>
        </form>
      </div>

      <style>{`
        /* Base styles */
        .chat-window-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #36393f;
          position: relative;
          overflow: hidden;
          height: 100%;
        }

        .chat-stars-bg {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 0;
        }

        .chat-star-bg {
          position: absolute;
          background: #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 4px rgba(255, 255, 255, 0.8);
          animation: twinkle infinite alternate;
          filter: blur(0.5px);
        }

        .chat-bg-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(ellipse at center, transparent 40%, rgba(54, 57, 63, 0.9) 100%);
          pointer-events: none;
          z-index: 0;
        }

        /* Header */
        .chat-header {
          padding: 16px 24px;
          border-bottom: 1px solid #202225;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #2f3136;
          position: relative;
          z-index: 1;
          min-height: 72px;
        }

        /* Mobile Back Button */
        .mobile-back-button {
          display: none;
          position: absolute;
          left: 12px;
          background: transparent;
          border: none;
          color: #ffffff;
          font-size: 24px;
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          z-index: 2;
        }

        .mobile-back-button:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .header-user {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
          min-width: 0;
          margin-left: ${isMobile && onBack ? '40px' : '0'};
        }

        .user-avatar-container {
          position: relative;
          flex-shrink: 0;
        }

        .user-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #202225;
        }

        .online-indicator {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 12px;
          height: 12px;
          background: #3ba55d;
          border: 2px solid #2f3136;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .user-info {
          flex: 1;
          min-width: 0;
        }

        .user-name {
          font-weight: 700;
          font-size: 18px;
          color: #ffffff;
          margin-bottom: 4px;
          text-shadow: 0 1px 2px rgba(0,0,0,0.5);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-status {
          font-size: 14px;
          color: #8e9297;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .status-dot.online {
          background: #3ba55d;
          animation: pulse 2s infinite;
        }

        .status-dot.offline {
          background: #747f8d;
        }

        .status-text {
          font-size: 14px;
        }

        .header-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }

        .delete-button {
          background: #ed4245;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          z-index: 1;
          min-height: 36px;
          white-space: nowrap;
        }

        .delete-button:hover {
          background: #d84040;
        }

        /* Messages container */
        .messages-container {
          flex: 1;
          padding: 24px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: transparent;
          position: relative;
          z-index: 1;
        }

        .messages-particles {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .messages-particle {
          position: absolute;
          width: 1px;
          height: 1px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          box-shadow: 0 0 3px rgba(255, 255, 255, 0.3);
          animation: float infinite alternate;
        }

        /* Message styling */
        .message-wrapper {
          display: flex;
          gap: 12px;
          max-width: 70%;
          align-self: flex-start;
          flex-direction: row;
          position: relative;
          z-index: 1;
        }

        .message-wrapper.own-message {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #202225;
          align-self: flex-end;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          flex-shrink: 0;
        }

        .message-content-wrapper {
          max-width: 100%;
        }

        .message-sender {
          color: #ffffff;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 4px;
          margin-left: 8px;
          text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        }

        .own-message .message-sender {
          margin-left: 0;
          margin-right: 8px;
          text-align: right;
        }

        .message-bubble {
          padding: 12px 16px;
          border-radius: 18px;
          max-width: 100%;
          word-wrap: break-word;
          background: #40444b;
          color: #dcddde;
          border-bottom-right-radius: 4px;
          border-bottom-left-radius: 18px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          position: relative;
          overflow: hidden;
        }

        .own-message .message-bubble {
          background: #7289da;
          color: white;
          border-bottom-right-radius: 18px;
          border-bottom-left-radius: 4px;
        }

        .message-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.05), transparent 70%);
          pointer-events: none;
        }

        .own-message .message-glow {
          background: radial-gradient(circle at 30% 30%, rgba(114, 137, 218, 0.1), transparent 70%);
        }

        .message-image {
          max-width: 300px;
          max-height: 300px;
          border-radius: 8px;
          margin-bottom: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .message-text {
          text-shadow: none;
        }

        .own-message .message-text {
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }

        .message-info {
          font-size: 11px;
          color: #8e9297;
          margin-top: 4px;
          text-align: left;
          display: flex;
          align-items: center;
          gap: 4px;
          justify-content: flex-start;
          text-shadow: 0 1px 1px rgba(0,0,0,0.3);
        }

        .own-message .message-info {
          text-align: right;
          justify-content: flex-end;
        }

        .read-indicator {
          color: #3ba55d;
          font-size: 12px;
          animation: readPulse 2s infinite;
        }

        .messages-end {
          height: 1px;
        }

        /* Input area */
        .message-input-container {
          padding: 20px 24px;
          border-top: 1px solid #202225;
          background: #2f3136;
          position: relative;
          z-index: 1;
        }

        .message-form {
          display: flex;
          gap: 12px;
          align-items: flex-end;
        }

        .message-textarea {
          flex: 1;
          padding: 12px 16px;
          background: #40444b;
          border: 1px solid #202225;
          border-radius: 8px;
          color: #dcddde;
          font-size: 16px;
          resize: none;
          max-height: 120px;
          min-height: 48px;
          font-family: "'Whitney', sans-serif";
          transition: all 0.2s;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
          box-sizing: border-box;
        }

        .message-textarea:focus {
          border-color: #7289da;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.2), 0 0 0 2px rgba(114, 137, 218, 0.2);
          outline: none;
        }

        .send-button {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #4f545c;
          color: white;
          border: none;
          cursor: not-allowed;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }

        .send-button:not(:disabled) {
          background: #7289da;
          cursor: pointer;
        }

        .send-button:not(:disabled):hover {
          background: #677bc4;
        }

        .send-button-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: sendPulse 2s infinite;
        }

        .send-button:disabled .send-button-glow {
          animation: none;
        }

        .send-icon {
          font-size: 18px;
          transform: rotate(360deg);
          position: relative;
          z-index: 1;
        }

        /* Animations */
        @keyframes twinkle {
          0%, 100% { 
            opacity: 0.2; 
            transform: scale(1);
          }
          50% { 
            opacity: 1; 
            transform: scale(1.2);
          }
        }
        
        @keyframes pulse {
          0%, 100% { 
            opacity: 1;
            transform: scale(1);
          }
          50% { 
            opacity: 0.6;
            transform: scale(1.1);
          }
        }
        
        @keyframes float {
          0%, 100% { 
            transform: translateY(0) translateX(0);
          }
          25% { 
            transform: translateY(-2px) translateX(1px);
          }
          50% { 
            transform: translateY(2px) translateX(-1px);
          }
          75% { 
            transform: translateY(-1px) translateX(-2px);
          }
        }
        
        @keyframes readPulse {
          0%, 100% { 
            opacity: 1;
          }
          50% { 
            opacity: 0.5;
          }
        }
        
        @keyframes sendPulse {
          0%, 100% { 
            opacity: 0.3;
          }
          50% { 
            opacity: 0.6;
          }
        }

        /* Mobile styles */
        @media (max-width: 768px) {
          .chat-header {
            padding: 12px 16px;
            min-height: 64px;
          }

          .mobile-back-button {
            display: flex;
          }

          .user-avatar {
            width: 40px;
            height: 40px;
          }

          .user-name {
            font-size: 16px;
          }

          .user-status {
            font-size: 12px;
          }

          .delete-button {
            padding: 6px 12px;
            font-size: 13px;
            min-height: 32px;
          }

          .messages-container {
            padding: 16px;
            gap: 12px;
          }

          .message-wrapper {
            max-width: 85%;
          }

          .message-bubble {
            padding: 10px 14px;
            font-size: 14px;
          }

          .message-image {
            max-width: 250px;
            max-height: 250px;
          }

          .message-info {
            font-size: 10px;
          }

          .message-input-container {
            padding: 16px;
          }

          .message-textarea {
            padding: 10px 14px;
            font-size: 15px;
            min-height: 44px;
          }

          .send-button {
            width: 44px;
            height: 44px;
          }

          .send-icon {
            font-size: 16px;
          }
        }

        @media (max-width: 480px) {
          .chat-header {
            flex-direction: row;
            align-items: center;
            gap: 8px;
            padding: 12px;
          }

          .header-user {
            width: auto;
            margin-left: 36px;
          }

          .header-actions {
            width: auto;
          }

          .delete-button {
            width: auto;
            padding: 6px 10px;
            font-size: 12px;
          }

          .messages-container {
            padding: 12px;
            gap: 10px;
          }

          .message-wrapper {
            max-width: 90%;
          }

          .message-bubble {
            padding: 8px 12px;
            font-size: 13px;
          }

          .message-image {
            max-width: 200px;
            max-height: 200px;
          }

          .message-input-container {
            padding: 12px;
          }

          .message-form {
            flex-direction: row;
            gap: 10px;
          }

          .message-textarea {
            width: 100%;
          }

          .send-button {
            align-self: flex-end;
            width: 40px;
            height: 40px;
          }
        }

        /* Tablet styles */
        @media (min-width: 769px) and (max-width: 1024px) {
          .chat-header {
            padding: 14px 20px;
          }

          .messages-container {
            padding: 20px;
          }

          .message-bubble {
            font-size: 15px;
          }

          .message-image {
            max-width: 280px;
          }
        }

        /* Custom scrollbar */
        .messages-container::-webkit-scrollbar {
          width: 8px;
        }
        
        .messages-container::-webkit-scrollbar-track {
          background: #2f3136;
          border-radius: 4px;
        }
        
        .messages-container::-webkit-scrollbar-thumb {
          background: #202225;
          border-radius: 4px;
        }
        
        .messages-container::-webkit-scrollbar-thumb:hover {
          background: #7289da;
        }

        @media (max-width: 768px) {
          .messages-container::-webkit-scrollbar {
            width: 4px;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatWindow;