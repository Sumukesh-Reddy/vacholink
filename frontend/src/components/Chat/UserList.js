import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

const UserList = ({ onSelectUser, onClose }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stars, setStars] = useState([]);

  useEffect(() => {
    // Generate random stars for modal
    const generateStars = () => {
      const starCount = 200;
      const newStars = [];
      for (let i = 0; i < starCount; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.4 + 0.1,
          delay: Math.random() * 3,
          duration: Math.random() * 2 + 1
        });
      }
      setStars(newStars);
    };
    
    generateStars();
  }, []);

  const fetchUsers = useCallback(async () => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setUsers([]);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/api/users/search`, {
        params: { query: searchQuery }
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, fetchUsers]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000,
      padding: '20px'
    }} onClick={onClose}>
      
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
              boxShadow: '0 0 4px rgba(255, 255, 255, 0.8)',
              animation: `twinkle ${star.duration}s infinite ${star.delay}s alternate`,
              filter: 'blur(0.5px)'
            }}
          />
        ))}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(ellipse at center, rgba(47, 49, 54, 0.3) 0%, rgba(47, 49, 54, 0.8) 100%)',
        }} />
      </div>
      
      <div style={{
        background: '#2f3136',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '480px',
        maxHeight: '600px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        border: '1px solid #202225',
        position: 'relative',
        zIndex: 1,
        overflow: 'hidden'
      }} onClick={(e) => e.stopPropagation()}>
        
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #202225',
          background: 'linear-gradient(135deg, #36393f 0%, #2f3136 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 50% 0%, rgba(114, 137, 218, 0.1), transparent 70%)',
            pointerEvents: 'none'
          }} />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
            zIndex: 1
          }}>
            <h3 style={{
              color: '#ffffff',
              fontSize: '20px',
              fontWeight: '700',
              margin: 0,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>Start New Chat</h3>
            <button 
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '28px',
                cursor: 'pointer',
                color: '#b9bbbe',
                padding: '0',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#202225';
                e.target.style.color = '#ffffff';
                e.target.style.transform = 'rotate(90deg)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#b9bbbe';
                e.target.style.transform = 'rotate(0deg)';
              }}
            >
              ×
            </button>
          </div>
        </div>
        
        
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #202225',
          position: 'relative'
        }}>
          <div style={{
            position: 'relative'
          }}>
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setLoading(true);
              }}
              style={{
                width: '100%',
                padding: '14px 20px 14px 48px',
                background: '#202225',
                border: '1px solid #202225',
                borderRadius: '8px',
                color: '#dcddde',
                fontSize: '14px',
                transition: 'all 0.3s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#7289da';
                e.target.style.boxShadow = '0 0 0 2px rgba(114, 137, 218, 0.3), 0 4px 12px rgba(0,0,0,0.3)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#202225';
                e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
              }}
              autoFocus
            />
            <div style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#8e9297',
              fontSize: '16px',
              animation: 'searchPulse 2s infinite'
            }}>🔍</div>
          </div>
          <div style={{
            color: '#8e9297',
            fontSize: '12px',
            marginTop: '8px',
            paddingLeft: '4px'
          }}>
            Type at least 2 characters to search
          </div>
        </div>
        
        
        <div style={{
          flex: 1,
          overflowY: 'auto',
          maxHeight: '400px',
          position: 'relative'
        }}>
          {loading ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 20px',
              color: '#b9bbbe'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid #202225',
                borderTop: '3px solid #7289da',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '16px'
              }}></div>
              <div style={{
                fontSize: '14px',
                animation: 'fadeInOut 2s infinite'
              }}>Searching users...</div>
            </div>
          ) : users.length > 0 ? (
            users.map((otherUser, index) => (
              <div
                key={otherUser._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px 20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  borderBottom: '1px solid #202225',
                  animation: `slideIn ${0.1 * index + 0.3}s ease-out`,
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#202225';
                  e.target.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.transform = 'translateX(0)';
                }}
                onClick={() => onSelectUser(otherUser._id)}
              >
               
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(90deg, transparent, rgba(114, 137, 218, 0.05), transparent)',
                  opacity: 0,
                  transition: 'opacity 0.3s'
                }} />
                
                <img
                  src={otherUser.profilePhoto || `https://ui-avatars.com/api/?name=${otherUser.name}&background=7289da&color=fff`}
                  alt={otherUser.name}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #202225',
                    marginRight: '16px',
                    position: 'relative',
                    zIndex: 1,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s'
                  }}
                />
                <div style={{
                  flex: 1,
                  position: 'relative',
                  zIndex: 1
                }}>
                  <div style={{
                    color: '#ffffff',
                    fontSize: '16px',
                    fontWeight: '600',
                    marginBottom: '4px',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                  }}>{otherUser.name}</div>
                  <div style={{
                    color: '#b9bbbe',
                    fontSize: '13px',
                    marginBottom: '4px'
                  }}>{otherUser.email}</div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      background: otherUser.online ? '#3ba55d' : '#747f8d',
                      borderRadius: '50%',
                      animation: otherUser.online ? 'statusPulse 2s infinite' : 'none'
                    }}></span>
                    <span style={{
                      color: otherUser.online ? '#3ba55d' : '#747f8d',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {otherUser.online ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
                <div style={{
                  color: '#7289da',
                  fontSize: '20px',
                  opacity: 0,
                  transform: 'translateX(-10px)',
                  transition: 'all 0.3s',
                  position: 'relative',
                  zIndex: 1
                }}>
                  →
                </div>
              </div>
            ))
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 20px',
              color: '#8e9297',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '16px',
                animation: 'starTwinkle 3s infinite'
              }}>⭐</div>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#b9bbbe'
              }}>
                {searchQuery.trim().length >= 2 
                  ? 'No users found'
                  : 'Search for users to start a chat'
                }
              </div>
              <div style={{
                fontSize: '14px'
              }}>
                {searchQuery.trim().length >= 2 
                  ? 'Try a different search term'
                  : 'Type in the search box above'
                }
              </div>
            </div>
          )}
        </div>
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
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes fadeInOut {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes searchPulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
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
        
        @keyframes starTwinkle {
          0%, 100% { 
            transform: scale(1) rotate(0deg);
            filter: brightness(1);
          }
          25% { 
            transform: scale(1.1) rotate(5deg);
            filter: brightness(1.2);
          }
          50% { 
            transform: scale(1) rotate(0deg);
            filter: brightness(1);
          }
          75% { 
            transform: scale(1.1) rotate(-5deg);
            filter: brightness(1.2);
          }
        }
        
        /* Custom scrollbar for user list */
        div::-webkit-scrollbar {
          width: 8px;
        }
        
        div::-webkit-scrollbar-track {
          background: #2f3136;
          border-radius: 4px;
        }
        
        div::-webkit-scrollbar-thumb {
          background: #202225;
          border-radius: 4px;
        }
        
        div::-webkit-scrollbar-thumb:hover {
          background: #7289da;
        }
        
        /* Hover effects for user items */
        div:hover > div:last-child {
          opacity: 1 !important;
          transform: translateX(0) !important;
        }
      `}</style>
    </div>
  );
};

export default UserList;