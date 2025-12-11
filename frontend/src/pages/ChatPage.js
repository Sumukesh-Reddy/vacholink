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
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebarOnMobile, setShowSidebarOnMobile] = useState(true);

  // Check mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Generate animated stars and comets
  useEffect(() => {
    const generateStars = () => {
      const starCount = isMobile ? 25 : 50;
      const newStars = [];
      for (let i = 0; i < starCount; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * (isMobile ? 2 : 3) + 1,
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
      const cometCount = isMobile ? 2 : 3;
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
  }, [isMobile]);

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
      // On mobile, hide sidebar when chat is selected
      if (isMobile) {
        setShowSidebarOnMobile(false);
      }
    }
  }, [socket, selectedRoom, isMobile]);

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
    // On mobile, hide sidebar when selecting a room
    if (isMobile) {
      setShowSidebarOnMobile(false);
    }
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
        // On mobile, show sidebar when chat is deleted
        if (isMobile) {
          setShowSidebarOnMobile(true);
        }
      }
      toast.success('Chat deleted');
    } catch (error) {
      toast.error('Failed to delete chat');
    }
  };

  const handleBackToChats = () => {
    setSelectedRoom(null);
    // On mobile, show sidebar when going back
    if (isMobile) {
      setShowSidebarOnMobile(true);
    }
  };

  if (loading) {
    return (
      <div className="chat-loading-container">
        {/* ... loading content remains the same ... */}
      </div>
    );
  }

  return (
    <div className="chat-container">
      
      <div className="chat-bg-gradient" />
      
      
      <div className="chat-stars">
        {stars.map(star => (
          <div
            key={star.id}
            className="chat-star"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              background: star.type === 'blue' ? '#7289da' : '#ffffff',
              opacity: star.opacity,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`
            }}
          />
        ))}
      </div>
      
      
      <div className="chat-comets">
        {comets.map(comet => (
          <div
            key={comet.id}
            className="chat-comet"
            style={{
              left: `${comet.x}%`,
              top: `${comet.y}%`,
              width: `${comet.size * 20}px`,
              height: `${comet.size}px`,
              background: `linear-gradient(90deg, ${comet.color} 0%, rgba(114, 137, 218, 0) 100%)`,
              animationDelay: `${comet.delay}s`,
              animationDuration: `${comet.duration}s`
            }}
          />
        ))}
      </div>
      
      
      <div className="chat-nebula nebula-1" />
      <div className="chat-nebula nebula-2" />

      
      <div className="chat-particles">
        {Array.from({ length: isMobile ? 8 : 15 }).map((_, i) => (
          <div
            key={i}
            className="chat-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`
            }}
          />
        ))}
      </div>
      
      
      {/* Desktop: Always show sidebar */}
      {!isMobile && (
        <ChatSidebar
          rooms={rooms}
          selectedRoom={selectedRoom}
          onSelectRoom={handleSelectRoom}
          onStartNewChat={() => setShowUserList(true)}
          onlineUsers={onlineUsers}
        />
      )}
      
      {/* Mobile: Show sidebar when no chat is selected or when explicitly showing */}
      {isMobile && (showSidebarOnMobile || !selectedRoom) && (
        <ChatSidebar
          rooms={rooms}
          selectedRoom={selectedRoom}
          onSelectRoom={handleSelectRoom}
          onStartNewChat={() => setShowUserList(true)}
          onlineUsers={onlineUsers}
        />
      )}
      
      {/* Show chat window when a room is selected */}
      {selectedRoom ? (
        <ChatWindow
          room={selectedRoom}
          messages={messages}
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          onDeleteRoom={() => handleDeleteRoom(selectedRoom?._id)}
          onBack={handleBackToChats}
          isMobile={isMobile}
        />
      ) : (
        // Show welcome screen on desktop when no chat is selected
        !isMobile && (
          <div className="chat-welcome">
            <div className="welcome-content">
              
              <div className="welcome-logo">
                ꍡ
              </div>
              
              <h2 className="welcome-title">Welcome to VachoLink!</h2>
              
              <p className="welcome-text">
                Connect with friends and colleagues in real-time.<br />
                Start meaningful conversations that matter.
              </p>
              
              <button 
                className="welcome-button"
                onClick={() => setShowUserList(true)}
              >
                <div className="welcome-button-glow" />
                <span className="welcome-button-text">
                  Start New Chat
                </span>
              </button>
              
              <div className="welcome-stats">
                <div className="stat-item">
                  <div className="stat-number">{onlineUsers.size}</div>
                  <div className="stat-label">Online</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{rooms.length}</div>
                  <div className="stat-label">Chats</div>
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {showUserList && (
        <UserList
          onSelectUser={handleStartNewChat}
          onClose={() => setShowUserList(false)}
        />
      )}

      <style>{`
        /* Base styles */
        .chat-container {
          display: flex;
          height: calc(100vh - 48px);
          background: #0a0a0a;
          position: relative;
          overflow: hidden;
        }

        .chat-bg-gradient {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          background: radial-gradient(ellipse at center, #1a1c22 0%, #0a0a0a 100%);
          z-index: 0;
        }

        .chat-stars, .chat-comets, .chat-particles {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 1;
        }

        .chat-star {
          position: absolute;
          border-radius: 50%;
          box-shadow: 0 0 var(--size, 6px) var(--color, rgba(255, 255, 255, 0.8));
          animation: starTwinkle infinite alternate;
          filter: blur(0.5px);
        }

        .chat-comet {
          position: absolute;
          border-radius: 2px;
          opacity: 0.6;
          animation: cometTrail linear infinite;
          transform-origin: right center;
          filter: blur(1px);
        }

        .chat-particle {
          position: absolute;
          width: 1px;
          height: 1px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          box-shadow: 0 0 3px rgba(255, 255, 255, 0.3);
          animation: particleFloat linear infinite;
        }

        .chat-nebula {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, var(--color), transparent 70%);
          filter: blur(40px);
          animation: nebulaFloat ease-in-out infinite alternate;
          pointer-events: none;
          z-index: 0;
        }

        .nebula-1 {
          top: 20%;
          left: 10%;
          width: 300px;
          height: 300px;
          --color: rgba(114, 137, 218, 0.1);
          animation-duration: 20s;
        }

        .nebula-2 {
          bottom: 10%;
          right: 15%;
          width: 400px;
          height: 400px;
          --color: rgba(67, 181, 129, 0.05);
          animation-duration: 25s;
        }

        /* Welcome screen */
        .chat-welcome {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          background: rgba(47, 49, 54, 0.7);
          backdrop-filter: blur(10px);
          position: relative;
          border-left: 1px solid rgba(32, 34, 37, 0.5);
          z-index: 2;
        }

        .welcome-content {
          text-align: center;
          padding: 50px 60px;
          background: rgba(54, 57, 63, 0.8);
          border-radius: 16px;
          border: 1px solid rgba(32, 34, 37, 0.5);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
          max-width: 500px;
          backdrop-filter: blur(5px);
          position: relative;
          overflow: hidden;
        }

        .welcome-logo {
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
          margin: 0 auto 24px;
          box-shadow: 0 0 30px rgba(114, 137, 218, 0.5);
          animation: welcomeLogo 3s ease-in-out infinite;
        }

        .welcome-title {
          color: #ffffff;
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 16px;
          font-family: "'Ginto', sans-serif";
          text-shadow: 0 2px 8px rgba(0,0,0,0.5);
          background: linear-gradient(90deg, #ffffff, #b9bbbe);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .welcome-text {
          color: #b9bbbe;
          font-size: 16px;
          margin-bottom: 32px;
          line-height: 1.6;
        }

        .welcome-button {
          background: linear-gradient(135deg, #7289da 0%, #5b6eae 100%);
          color: white;
          border: none;
          padding: 14px 32px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          font-family: "'Whitney', sans-serif";
          box-shadow: 0 4px 20px rgba(114, 137, 218, 0.4);
          position: relative;
          overflow: hidden;
          min-height: 48px;
        }

        .welcome-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(114, 137, 218, 0.6);
        }

        .welcome-button-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: buttonGlow 2s ease-in-out infinite;
        }

        .welcome-button-text {
          position: relative;
          z-index: 1;
        }

        .welcome-stats {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid rgba(32, 34, 37, 0.5);
        }

        .stat-item {
          display: inline-block;
          text-align: center;
          margin: 0 10px;
          color: #8e9297;
          font-size: 14px;
        }

        .stat-number {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 4px;
        }

        .stat-item:first-child .stat-number {
          color: #43b581;
        }

        .stat-item:last-child .stat-number {
          color: #7289da;
        }

        /* Mobile specific styles */
        @media (max-width: 768px) {
          .chat-container {
            height: calc(100vh - 48px);
            flex-direction: column;
          }

          .nebula-1, .nebula-2 {
            display: none;
          }

          .chat-welcome {
            display: none;
          }
        }

        /* Ensure proper z-index for mobile views */
        @media (max-width: 768px) {
          .chat-sidebar {
            z-index: 10;
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100%;
            height: 100%;
          }

          .chat-window-container {
            z-index: 20;
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100%;
            height: 100%;
          }
        }

        /* Tablet styles */
        @media (min-width: 769px) and (max-width: 1024px) {
          .nebula-1 {
            width: 200px;
            height: 200px;
          }

          .nebula-2 {
            width: 300px;
            height: 300px;
          }

          .welcome-content {
            padding: 40px 50px;
            max-width: 450px;
          }

          .welcome-title {
            font-size: 28px;
          }

          .welcome-text {
            font-size: 15px;
          }
        }

        /* Animations */
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

        /* Mobile scrollbar */
        @media (max-width: 768px) {
          ::-webkit-scrollbar {
            width: 6px;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatPage;