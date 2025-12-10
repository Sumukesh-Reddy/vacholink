import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import ChatSidebar from '../components/Chat/ChatSidebar';
import ChatWindow from '../components/Chat/ChatWindow';
import UserList from '../components/Chat/UserList';
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

const ChatPage = () => {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserList, setShowUserList] = useState(false);
  const [stars, setStars] = useState([]);
  const [comets, setComets] = useState([]);

  // Generate animated stars and comets
  useEffect(() => {
    const generateStars = () => {
      const starCount = 50;
      const newStars = [];
      for (let i = 0; i < starCount; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.6 + 0.1,
          delay: Math.random() * 5,
          duration: Math.random() * 3 + 2,
          type: Math.random() > 0.8 ? 'blue' : 'white',
          twinkleSpeed: Math.random() * 2 + 1
        });
      }
      setStars(newStars);
    };

    const generateComets = () => {
      const cometCount = 3;
      const newComets = [];
      for (let i = 0; i < cometCount; i++) {
        const startX = Math.random() * 100;
        const startY = Math.random() * 100;
        newComets.push({
          id: i,
          x: startX,
          y: startY,
          endX: startX - (Math.random() * 30 + 10),
          endY: startY + (Math.random() * 20 - 10),
          size: Math.random() * 2 + 1,
          delay: Math.random() * 10,
          duration: Math.random() * 5 + 3,
          color: Math.random() > 0.5 ? '#7289da' : '#43b581'
        });
      }
      setComets(newComets);
    };

    generateStars();
    generateComets();

    // Regenerate comets periodically
    const cometInterval = setInterval(() => {
      generateComets();
    }, 15000);

    return () => clearInterval(cometInterval);
  }, []);

  const fetchChatRooms = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/chat/rooms`);
      setRooms(response.data.rooms);
      
      if (response.data.rooms.length > 0 && !selectedRoom) {
        setSelectedRoom(response.data.rooms[0]);
        fetchMessages(response.data.rooms[0]._id);
      }
    } catch (error) {
      toast.error('Failed to load chat rooms');
    } finally {
      setLoading(false);
    }
  }, [selectedRoom]);

  useEffect(() => {
    fetchChatRooms();
  }, [user, fetchChatRooms]);

  useEffect(() => {
    if (socket && selectedRoom) {
      socket.emit('join-room', selectedRoom._id);
    }
  }, [socket, selectedRoom]);

  useEffect(() => {
    if (!socket) return;

    const handleIncomingMessage = (message) => {
      setRooms(prevRooms => prevRooms.map(room => 
        room._id === message.roomId 
          ? { ...room, lastMessage: message, updatedAt: new Date().toISOString() }
          : room
      ));

      setMessages(prev => (
        selectedRoom && message.roomId === selectedRoom._id
          ? [...prev, message]
          : prev
      ));
    };

    socket.on('receive-message', handleIncomingMessage);

    return () => {
      socket.off('receive-message', handleIncomingMessage);
    };
  }, [socket, selectedRoom]);

  const fetchMessages = async (roomId) => {
    try {
      const response = await axios.get(`${API_URL}/api/chat/messages/${roomId}`);
      setMessages(response.data.messages);
    } catch (error) {
      toast.error('Failed to load messages');
    }
  };

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    fetchMessages(room._id);
  };

  const handleSendMessage = (content) => {
    if (!socket || !selectedRoom || !content.trim()) return;

    socket.emit('send-message', {
      roomId: selectedRoom._id,
      content: content.trim(),
      type: 'text'
    });
  };

  const handleTyping = (isTyping) => {
    if (socket && selectedRoom) {
      socket.emit('typing', {
        roomId: selectedRoom._id,
        isTyping
      });
    }
  };

  const handleStartNewChat = async (userId) => {
    try {
      const response = await axios.post(`${API_URL}/api/chat/room`, {
        participantId: userId
      });

      const newRoom = response.data.room;
      setRooms(prev => [newRoom, ...prev]);
      setSelectedRoom(newRoom);
      setShowUserList(false);
      fetchMessages(newRoom._id);
      
      toast.success('Chat started!');
    } catch (error) {
      toast.error('Failed to start chat');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!roomId) return;
    if (!window.confirm('Delete this chat and all its messages?')) return;

    try {
      await axios.delete(`${API_URL}/api/chat/room/${roomId}`);
      setRooms(prev => prev.filter(r => r._id !== roomId));
      if (selectedRoom && selectedRoom._id === roomId) {
        setSelectedRoom(null);
        setMessages([]);
      }
      toast.success('Chat deleted');
    } catch (error) {
      toast.error('Failed to delete chat');
    }
  };

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
        
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 30% 30%, #1a1c22 0%, #0a0a0a 70%)',
          pointerEvents: 'none'
        }} />
        
        
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none'
        }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                background: '#ffffff',
                borderRadius: '50%',
                opacity: Math.random() * 0.5 + 0.2,
                animation: `twinkle ${Math.random() * 3 + 2}s infinite ${Math.random() * 2}s alternate`,
                filter: 'blur(0.5px)'
              }}
            />
          ))}
        </div>

        <div style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px'
        }}>
          
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
            animation: 'logoFloat 3s ease-in-out infinite',
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
              background: 'radial-gradient(circle, rgba(114, 137, 218, 0.3) 0%, transparent 70%)',
              animation: 'logoPulse 2s ease-in-out infinite',
              pointerEvents: 'none'
            }} />
          </div>
          
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid rgba(32, 34, 37, 0.3)',
            borderTop: '3px solid #7289da',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '10px',
            boxShadow: '0 0 20px rgba(114, 137, 218, 0.3)'
          }}></div>
          
          <p style={{ 
            color: '#b9bbbe', 
            fontFamily: "'Whitney', sans-serif",
            fontSize: '18px',
            fontWeight: '500',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            animation: 'textGlow 2s ease-in-out infinite'
          }}>Loading chats...</p>
          
          <div style={{
            display: 'flex',
            gap: '8px',
            marginTop: '20px'
          }}>
            {[0, 1, 2].map(i => (
              <div
                key={i}
                style={{
                  width: '10px',
                  height: '10px',
                  background: '#7289da',
                  borderRadius: '50%',
                  animation: `dotPulse 1.5s ease-in-out infinite ${i * 0.2}s`
                }}
              />
            ))}
          </div>
        </div>

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
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
          
          @keyframes logoFloat {
            0%, 100% { 
              transform: translateY(0) scale(1);
              box-shadow: 0 0 30px rgba(114, 137, 218, 0.5);
            }
            50% { 
              transform: translateY(-10px) scale(1.05);
              box-shadow: 0 0 50px rgba(114, 137, 218, 0.7);
            }
          }
          
          @keyframes logoPulse {
            0%, 100% { 
              opacity: 0.5;
              transform: scale(1);
            }
            50% { 
              opacity: 0.8;
              transform: scale(1.2);
            }
          }
          
          @keyframes textGlow {
            0%, 100% { 
              opacity: 0.7;
              text-shadow: 0 2px 4px rgba(0,0,0,0.5);
            }
            50% { 
              opacity: 1;
              text-shadow: 0 2px 8px rgba(114, 137, 218, 0.3);
            }
          }
          
          @keyframes dotPulse {
            0%, 100% { 
              transform: scale(1);
              opacity: 0.5;
            }
            50% { 
              transform: scale(1.5);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      height: 'calc(100vh - 48px)',
      background: '#0a0a0a',
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
        background: 'radial-gradient(ellipse at center, #1a1c22 0%, #0a0a0a 100%)',
        zIndex: 0
      }} />
      
      
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 1
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
              boxShadow: `0 0 ${star.size * 2}px ${star.type === 'blue' ? 'rgba(114, 137, 218, 0.8)' : 'rgba(255, 255, 255, 0.8)'}`,
              animation: `starTwinkle ${star.duration}s infinite ${star.delay}s alternate`,
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
        pointerEvents: 'none',
        zIndex: 1
      }}>
        {comets.map(comet => (
          <div
            key={comet.id}
            style={{
              position: 'absolute',
              left: `${comet.x}%`,
              top: `${comet.y}%`,
              width: `${comet.size * 20}px`,
              height: `${comet.size}px`,
              background: `linear-gradient(90deg, ${comet.color} 0%, rgba(114, 137, 218, 0) 100%)`,
              borderRadius: '2px',
              opacity: 0.6,
              animation: `cometTrail ${comet.duration}s linear ${comet.delay}s infinite`,
              transformOrigin: 'right center',
              filter: 'blur(1px)'
            }}
          />
        ))}
      </div>
      
      
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '10%',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(114, 137, 218, 0.1) 0%, transparent 70%)',
        filter: 'blur(40px)',
        animation: 'nebulaFloat 20s ease-in-out infinite alternate',
        pointerEvents: 'none',
        zIndex: 0
      }} />
      
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '15%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(67, 181, 129, 0.05) 0%, transparent 70%)',
        filter: 'blur(60px)',
        animation: 'nebulaFloat2 25s ease-in-out infinite alternate',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 0
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
              animation: `particleFloat ${Math.random() * 10 + 10}s linear infinite ${Math.random() * 5}s`,
              boxShadow: '0 0 3px rgba(255, 255, 255, 0.3)'
            }}
          />
        ))}
      </div>
      
      
      <div style={{
        display: 'flex',
        width: '100%',
        position: 'relative',
        zIndex: 2
      }}>
        <ChatSidebar
          rooms={rooms}
          selectedRoom={selectedRoom}
          onSelectRoom={handleSelectRoom}
          onStartNewChat={() => setShowUserList(true)}
          onlineUsers={onlineUsers}
        />
        
        {selectedRoom ? (
          <ChatWindow
            room={selectedRoom}
            messages={messages}
            onSendMessage={handleSendMessage}
            onTyping={handleTyping}
            onDeleteRoom={() => handleDeleteRoom(selectedRoom?._id)}
          />
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'rgba(47, 49, 54, 0.7)',
            backdropFilter: 'blur(10px)',
            position: 'relative',
            borderLeft: '1px solid rgba(32, 34, 37, 0.5)'
          }}>
            <div style={{
              textAlign: 'center',
              padding: '50px 60px',
              background: 'rgba(54, 57, 63, 0.8)',
              borderRadius: '16px',
              border: '1px solid rgba(32, 34, 37, 0.5)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
              maxWidth: '500px',
              backdropFilter: 'blur(5px)',
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
                margin: '0 auto 24px',
                boxShadow: '0 0 30px rgba(114, 137, 218, 0.5)',
                animation: 'welcomeLogo 3s ease-in-out infinite'
              }}>
                ꍡ
              </div>
              
              <h2 style={{
                color: '#ffffff',
                fontSize: '32px',
                fontWeight: '700',
                marginBottom: '16px',
                fontFamily: "'Ginto', sans-serif",
                textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                background: 'linear-gradient(90deg, #ffffff, #b9bbbe)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>Welcome to VachoLink!</h2>
              
              <p style={{
                color: '#b9bbbe',
                fontSize: '16px',
                marginBottom: '32px',
                lineHeight: '1.6'
              }}>
                Connect with friends and colleagues in real-time.<br />
                Start meaningful conversations that matter.
              </p>
              
              <button 
                style={{
                  background: 'linear-gradient(135deg, #7289da 0%, #5b6eae 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '14px 32px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  fontFamily: "'Whitney', sans-serif",
                  boxShadow: '0 4px 20px rgba(114, 137, 218, 0.4)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(114, 137, 218, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 20px rgba(114, 137, 218, 0.4)';
                }}
                onClick={() => setShowUserList(true)}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%)',
                  animation: 'buttonGlow 2s ease-in-out infinite'
                }} />
                <span style={{ position: 'relative', zIndex: 1 }}>
                  Start New Chat
                </span>
              </button>
              
              <div style={{
                marginTop: '32px',
                paddingTop: '24px',
                borderTop: '1px solid rgba(32, 34, 37, 0.5)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '20px',
                  color: '#8e9297',
                  fontSize: '14px'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#43b581' }}>
                      {onlineUsers.size}
                    </div>
                    <div>Online</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#7289da' }}>
                      {rooms.length}
                    </div>
                    <div>Chats</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showUserList && (
        <UserList
          onSelectUser={handleStartNewChat}
          onClose={() => setShowUserList(false)}
        />
      )}

      <style>{`
        @keyframes starTwinkle {
          0%, 100% { 
            opacity: 0.2; 
            transform: scale(1) rotate(0deg);
          }
          50% { 
            opacity: 1; 
            transform: scale(1.3) rotate(180deg);
          }
        }
        
        @keyframes cometTrail {
          0% {
            opacity: 0;
            transform: translateX(0) scale(1);
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            opacity: 0;
            transform: translateX(-100vw) scale(0.5);
          }
        }
        
        @keyframes nebulaFloat {
          0%, 100% { 
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
          }
          50% { 
            transform: translate(50px, 50px) scale(1.2);
            opacity: 0.5;
          }
        }
        
        @keyframes nebulaFloat2 {
          0%, 100% { 
            transform: translate(0, 0) scale(1);
            opacity: 0.2;
          }
          50% { 
            transform: translate(-100px, -50px) scale(1.3);
            opacity: 0.4;
          }
        }
        
        @keyframes particleFloat {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.5;
          }
          90% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(-100vh) translateX(100px);
            opacity: 0;
          }
        }
        
        @keyframes welcomeLogo {
          0%, 100% { 
            transform: scale(1) rotate(0deg);
            box-shadow: 0 0 30px rgba(114, 137, 218, 0.5);
          }
          33% { 
            transform: scale(1.1) rotate(5deg);
            box-shadow: 0 0 40px rgba(114, 137, 218, 0.7);
          }
          66% { 
            transform: scale(1.05) rotate(-5deg);
            box-shadow: 0 0 35px rgba(114, 137, 218, 0.6);
          }
        }
        
        @keyframes buttonGlow {
          0%, 100% { 
            opacity: 0.3;
            transform: scale(1);
          }
          50% { 
            opacity: 0.6;
            transform: scale(1.1);
          }
        }
        
        /* Scrollbar styling */
        ::-webkit-scrollbar {
          width: 10px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(32, 34, 37, 0.3);
          border-radius: 5px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(114, 137, 218, 0.5);
          border-radius: 5px;
          transition: background 0.3s;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(114, 137, 218, 0.8);
        }
      `}</style>
    </div>
  );
};

export default ChatPage;