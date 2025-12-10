import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const ChatSidebar = ({ rooms, selectedRoom, onSelectRoom, onStartNewChat, onlineUsers }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filter rooms based on search
  const filteredRooms = rooms.filter(room => {
    if (!searchQuery) return true;
    
    const otherParticipant = room.participants?.find(p => p._id !== user?._id?.toString()) || room.participants?.[0];
    const searchLower = searchQuery.toLowerCase();
    
    return (
      otherParticipant?.name?.toLowerCase().includes(searchLower) ||
      otherParticipant?.email?.toLowerCase().includes(searchLower) ||
      room.lastMessage?.content?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="chat-sidebar">
      <div className="sidebar-header">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        <button 
          className="new-chat-button"
          onClick={onStartNewChat}
        >
          + New Chat
        </button>
      </div>
      
      <div className="rooms-list">
        {filteredRooms.map(room => {
          const otherParticipant = room.participants?.find(p => p._id !== user?._id?.toString()) || room.participants?.[0];
          const isOnline = onlineUsers.has(otherParticipant?._id?.toString());
          
          return (
            <div
              key={room._id}
              className={`room-item ${selectedRoom?._id === room._id ? 'selected' : ''}`}
              onClick={() => onSelectRoom(room)}
            >
              <div className="room-avatar-container">
                <img
                  src={otherParticipant?.profilePhoto || `https://ui-avatars.com/api/?name=${otherParticipant?.name}&background=7289da&color=fff`}
                  alt={otherParticipant?.name}
                  className="room-avatar"
                />
                {isOnline && (
                  <div className="online-indicator" />
                )}
              </div>
              
              <div className="room-info">
                <div className="room-header">
                  <div className="room-name">{otherParticipant?.name || 'Unknown User'}</div>
                  {isOnline && (
                    <div className="online-dot" />
                  )}
                </div>
                <div className="room-preview">
                  {room.lastMessage?.content || 'No messages yet'}
                </div>
              </div>
              
              <div className="room-meta">
                <div className="room-time">
                  {room.lastMessage?.createdAt 
                    ? new Date(room.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : ''
                  }
                </div>
                {(room.unreadCount > 0) && (
                  <div className="unread-badge">
                    {room.unreadCount}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredRooms.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <div className="empty-title">No chats found</div>
            <div className="empty-text">
              {searchQuery ? 'Try a different search' : 'Start a new chat to get started'}
            </div>
            <button 
              className="empty-action-button"
              onClick={onStartNewChat}
            >
              Start New Chat
            </button>
          </div>
        )}
      </div>

      <style>{`
        /* Base styles */
        .chat-sidebar {
          width: 320px;
          background: #2f3136;
          border-right: 1px solid #202225;
          display: flex;
          flex-direction: column;
          height: 100%;
          flex-shrink: 0;
        }

        /* Header */
        .sidebar-header {
          padding: 20px;
          border-bottom: 1px solid #202225;
          background: #2f3136;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .search-container {
          position: relative;
          margin-bottom: 12px;
        }

        .search-input {
          width: 100%;
          padding: 12px 40px 12px 16px;
          background: #202225;
          border: 1px solid #202225;
          border-radius: 4px;
          color: #dcddde;
          font-size: 14px;
          transition: all 0.2s;
          box-sizing: border-box;
        }

        .search-input:focus {
          border-color: #7289da;
          outline: none;
        }

        .search-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #8e9297;
          font-size: 14px;
        }

        .new-chat-button {
          width: 100%;
          background: #7289da;
          color: white;
          border: none;
          padding: 12px;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: "'Whitney', sans-serif";
          min-height: 40px;
        }

        .new-chat-button:hover {
          background: #677bc4;
        }

        /* Rooms list */
        .rooms-list {
          flex: 1;
          overflow-y: auto;
          padding: 8px 0;
        }

        /* Room item */
        .room-item {
          display: flex;
          align-items: center;
          padding: 12px 20px;
          cursor: pointer;
          transition: background-color 0.2s;
          border-bottom: 1px solid #202225;
          background: transparent;
          border-left: 4px solid transparent;
          min-height: 76px;
        }

        .room-item:hover {
          background: #202225;
        }

        .room-item.selected {
          background: #202225;
          border-left: 4px solid #7289da;
        }

        .room-avatar-container {
          position: relative;
          margin-right: 12px;
          flex-shrink: 0;
        }

        .room-avatar {
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
        }

        .room-info {
          flex: 1;
          min-width: 0;
        }

        .room-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }

        .room-name {
          font-weight: 600;
          color: #ffffff;
          font-size: 14px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .online-dot {
          width: 6px;
          height: 6px;
          background: #3ba55d;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .room-preview {
          font-size: 13px;
          color: #8e9297;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .room-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          flex-shrink: 0;
          margin-left: 8px;
        }

        .room-time {
          font-size: 12px;
          color: #8e9297;
          white-space: nowrap;
        }

        .unread-badge {
          background: #ed4245;
          color: white;
          font-size: 12px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 10px;
          margin-top: 4px;
          min-width: 20px;
          text-align: center;
        }

        /* Empty state */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          text-align: center;
          color: #8e9297;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .empty-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #b9bbbe;
        }

        .empty-text {
          font-size: 14px;
          margin-bottom: 20px;
          max-width: 250px;
          line-height: 1.4;
        }

        .empty-action-button {
          background: #7289da;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          min-height: 36px;
        }

        .empty-action-button:hover {
          background: #677bc4;
        }

        /* Mobile styles */
        @media (max-width: 768px) {
          .chat-sidebar {
            width: 100%;
            height: auto;
            max-height: 60vh;
            position: absolute;
            top: 48px;
            left: 0;
            right: 0;
            z-index: 100;
            border-right: none;
            border-bottom: 1px solid #202225;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          }

          .sidebar-header {
            padding: 16px;
            position: relative;
          }

          .search-input {
            padding: 10px 36px 10px 12px;
            font-size: 13px;
          }

          .search-icon {
            right: 10px;
            font-size: 13px;
          }

          .new-chat-button {
            padding: 10px;
            font-size: 13px;
            min-height: 36px;
          }

          .room-item {
            padding: 10px 16px;
            min-height: 68px;
          }

          .room-avatar {
            width: 40px;
            height: 40px;
          }

          .room-name {
            font-size: 13px;
          }

          .room-preview {
            font-size: 12px;
          }

          .room-time {
            font-size: 11px;
          }

          .unread-badge {
            font-size: 11px;
            padding: 1px 5px;
            min-width: 18px;
          }

          .empty-state {
            padding: 30px 16px;
          }

          .empty-icon {
            font-size: 40px;
          }

          .empty-title {
            font-size: 15px;
          }

          .empty-text {
            font-size: 13px;
          }
        }

        /* Tablet styles */
        @media (min-width: 769px) and (max-width: 1024px) {
          .chat-sidebar {
            width: 280px;
          }

          .sidebar-header {
            padding: 16px;
          }

          .room-item {
            padding: 10px 16px;
          }

          .room-name {
            font-size: 13px;
          }

          .room-preview {
            font-size: 12px;
          }
        }

        /* Custom scrollbar */
        .rooms-list::-webkit-scrollbar {
          width: 8px;
        }
        
        .rooms-list::-webkit-scrollbar-track {
          background: #2f3136;
          border-radius: 4px;
        }
        
        .rooms-list::-webkit-scrollbar-thumb {
          background: #202225;
          border-radius: 4px;
        }
        
        .rooms-list::-webkit-scrollbar-thumb:hover {
          background: #7289da;
        }

        @media (max-width: 768px) {
          .rooms-list::-webkit-scrollbar {
            width: 4px;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatSidebar;
