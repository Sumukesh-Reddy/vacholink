import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const ChatWindow = ({ room, messages, onSendMessage, onTyping, onDeleteRoom }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  const otherParticipant = room.participants?.find(p => p._id !== user?._id) || room.participants?.[0];

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
    <div className="chat-window">
      <div className="chat-header">
        <img
          src={otherParticipant?.profilePhoto || `https://ui-avatars.com/api/?name=${otherParticipant?.name}&background=random`}
          alt={otherParticipant?.name}
          className="header-avatar"
        />
        <div className="header-info">
          <div className="header-name">{otherParticipant?.name || 'Unknown User'}</div>
          <div className="header-status">
            <span className="status-dot"></span>
            {otherParticipant?.online ? 'Online' : 'Offline'}
          </div>
        </div>
        <div className="header-actions">
          <button className="header-button danger" onClick={onDeleteRoom}>
            Delete chat
          </button>
        </div>
      </div>
      
      <div className="messages-container">
        {messages.map(msg => {
          const isOwnMessage = msg.sender?._id === user?._id;
          
          return (
            <div 
              key={msg._id} 
              className={`message ${isOwnMessage ? 'sent' : 'received'}`}
            >
              {!isOwnMessage && (
                <img
                  src={msg.sender?.profilePhoto || `https://ui-avatars.com/api/?name=${msg.sender?.name}&background=random`}
                  alt={msg.sender?.name}
                  className="message-avatar"
                />
              )}
              
              <div className="message-content">
                <div className="message-bubble">
                  {msg.type === 'image' && msg.mediaUrl ? (
                    <img 
                      src={msg.mediaUrl} 
                      alt="attachment" 
                      className="message-image"
                    />
                  ) : (
                    msg.content
                  )}
                </div>
                <div className="message-time">
                  {new Date(msg.createdAt).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                  {msg.read && ' ✓✓'}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="message-input-container">
        <form onSubmit={handleSubmit} className="message-input-form">
          <textarea
            value={message}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="message-input"
            rows="1"
          />
          <button 
            type="submit" 
            className="send-button"
            disabled={!message.trim()}
          >
            ➤
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;