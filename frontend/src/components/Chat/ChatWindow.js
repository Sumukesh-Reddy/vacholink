import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const ChatWindow = ({ room, messages, onSendMessage, onTyping, onDeleteRoom }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const [stars, setStars] = useState([]);
  
  const otherParticipant = room.participants?.find(p => p._id !== user?._id) || room.participants?.[0];

  useEffect(() => {
    // Generate random stars
    const generateStars = () => {
      const starCount = 1000;
      const newStars = [];
      for (let i = 0; i < starCount; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.2,
          delay: Math.random() * 3,
          duration: Math.random() * 2 + 1
        });
      }
      setStars(newStars);
    };
    
    generateStars();
  }, []);

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
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      background: '#36393f',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 0
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
              boxShadow: '0 0 4px rgba(255, 255, 255, 0.8)',
              animation: `twinkle ${star.duration}s infinite ${star.delay}s alternate`,
              filter: 'blur(0.5px)'
            }}
          />
        ))}
      </div>

      
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(54, 57, 63, 0.9) 100%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid #202225',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        background: '#2f3136',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          position: 'relative',
          flexShrink: 0
        }}>
          <img
            src={otherParticipant?.profilePhoto || `https://ui-avatars.com/api/?name=${otherParticipant?.name}&background=7289da&color=fff`}
            alt={otherParticipant?.name}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid #202225'
            }}
          />
          {otherParticipant?.online && (
            <div style={{
              position: 'absolute',
              bottom: '2px',
              right: '2px',
              width: '12px',
              height: '12px',
              background: '#3ba55d',
              border: '2px solid #2f3136',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }}></div>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontWeight: '700',
            fontSize: '18px',
            color: '#ffffff',
            marginBottom: '4px',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)'
          }}>{otherParticipant?.name || 'Unknown User'}</div>
          <div style={{
            fontSize: '14px',
            color: '#8e9297',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              background: otherParticipant?.online ? '#3ba55d' : '#747f8d',
              borderRadius: '50%',
              animation: otherParticipant?.online ? 'pulse 2s infinite' : 'none'
            }}></div>
            
          </div>
        </div>
        <div style={{
          display: 'flex',
          gap: '8px'
        }}>
          <button 
            style={{
              background: '#ed4245',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              position: 'relative',
              zIndex: 1
            }}
            onMouseEnter={(e) => e.target.style.background = '#d84040'}
            onMouseLeave={(e) => e.target.style.background = '#ed4245'}
            onClick={onDeleteRoom}
          >
            Delete chat
          </button>
        </div>
      </div>
      
      <div style={{
        flex: 1,
        padding: '24px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        background: 'transparent',
        position: 'relative',
        zIndex: 1
      }}>
        
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          overflow: 'hidden'
        }}>
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: '1px',
                height: '1px',
                background: 'rgba(255, 255, 255, 0.3)',
                borderRadius: '50%',
                animation: `float ${Math.random() * 5 + 3}s infinite ${Math.random() * 2}s alternate`,
                boxShadow: '0 0 3px rgba(255, 255, 255, 0.3)'
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
              style={{
                display: 'flex',
                gap: '12px',
                maxWidth: '70%',
                alignSelf: isOwnMessage ? 'flex-end' : 'flex-start',
                flexDirection: isOwnMessage ? 'row-reverse' : 'row',
                position: 'relative',
                zIndex: 1
              }}
            >
              {!isOwnMessage && (
                <img
                  src={msg.sender?.profilePhoto || `https://ui-avatars.com/api/?name=${msg.sender?.name}&background=7289da&color=fff`}
                  alt={msg.sender?.name}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #202225',
                    alignSelf: 'flex-end',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                  }}
                />
              )}
              
              <div>
                {!isOwnMessage && (
                  <div style={{
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginBottom: '4px',
                    marginLeft: isOwnMessage ? '0' : '8px',
                    marginRight: isOwnMessage ? '8px' : '0',
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                  }}>
                    {msg.sender?.name}
                  </div>
                )}
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '18px',
                  maxWidth: '100%',
                  wordWrap: 'break-word',
                  background: isOwnMessage ? '#7289da' : '#40444b',
                  color: isOwnMessage ? 'white' : '#dcddde',
                  borderBottomRightRadius: isOwnMessage ? '4px' : '18px',
                  borderBottomLeftRadius: isOwnMessage ? '18px' : '4px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: isOwnMessage 
                      ? 'radial-gradient(circle at 30% 30%, rgba(114, 137, 218, 0.1), transparent 70%)'
                      : 'radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.05), transparent 70%)',
                    pointerEvents: 'none'
                  }} />
                  
                  {msg.type === 'image' && msg.mediaUrl ? (
                    <img 
                      src={msg.mediaUrl} 
                      alt="attachment" 
                      style={{
                        maxWidth: '300px',
                        maxHeight: '300px',
                        borderRadius: '8px',
                        marginBottom: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                      }}
                    />
                  ) : (
                    <span style={{
                      textShadow: isOwnMessage ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'
                    }}>
                      {msg.content}
                    </span>
                  )}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#8e9297',
                  marginTop: '4px',
                  textAlign: isOwnMessage ? 'right' : 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                  textShadow: '0 1px 1px rgba(0,0,0,0.3)'
                }}>
                  {isToday 
                    ? messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : messageDate.toLocaleDateString() + ' ' + messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }
                  {isOwnMessage && msg.read && (
                    <span style={{
                      color: '#3ba55d',
                      fontSize: '12px',
                      animation: 'readPulse 2s infinite'
                    }}>✓✓</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      
      <div style={{
        padding: '20px 24px',
        borderTop: '1px solid #202225',
        background: '#2f3136',
        position: 'relative',
        zIndex: 1
      }}>
        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          gap: '12px'
        }}>
          <textarea
            value={message}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            style={{
              flex: 1,
              padding: '12px 16px',
              background: '#40444b',
              border: '1px solid #202225',
              borderRadius: '8px',
              color: '#dcddde',
              fontSize: '16px',
              resize: 'none',
              maxHeight: '120px',
              minHeight: '48px',
              fontFamily: "'Whitney', sans-serif",
              transition: 'all 0.2s',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#7289da';
              e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.2), 0 0 0 2px rgba(114, 137, 218, 0.2)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#202225';
              e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.2)';
            }}
            rows="1"
          />
          <button 
            type="submit" 
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: message.trim() ? '#7289da' : '#4f545c',
              color: 'white',
              border: 'none',
              cursor: message.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.2s',
              position: 'relative',
              overflow: 'hidden'
            }}
            disabled={!message.trim()}
            onMouseEnter={(e) => message.trim() && (e.target.style.background = '#677bc4')}
            onMouseLeave={(e) => message.trim() && (e.target.style.background = '#7289da')}
          >
            
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)',
              animation: message.trim() ? 'sendPulse 2s infinite' : 'none'
            }} />
            <span style={{
              fontSize: '18px',
              transform: 'rotate(360deg)',
              position: 'relative',
              zIndex: 1
            }}>➤</span>
          </button>
        </form>
      </div>

      <style>{`
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
      `}</style>
    </div>
  );
};

export default ChatWindow;