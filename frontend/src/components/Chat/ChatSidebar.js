import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const ChatSidebar = ({ rooms, selectedRoom, onSelectRoom, onStartNewChat, onlineUsers }) => {
  const { user } = useAuth();

  return (
    <div className="chat-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-search">
          <input
            type="text"
            placeholder="Search chats..."
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        <button className="new-chat-button" onClick={onStartNewChat}>
          + New Chat
        </button>
      </div>
      
      <div className="chat-list">
        {rooms.map(room => {
          const otherParticipant = room.participants?.find(p => p._id !== user?._id?.toString()) || room.participants?.[0];
          const isOnline = onlineUsers.has(otherParticipant?._id?.toString());
          
          return (
            <div
              key={room._id}
              className={`chat-item ${selectedRoom?._id === room._id ? 'active' : ''}`}
              onClick={() => onSelectRoom(room)}
            >
              <div className="chat-avatar">
                <img
                  src={otherParticipant?.profilePhoto || `https://ui-avatars.com/api/?name=${otherParticipant?.name}&background=random`}
                  alt={otherParticipant?.name}
                  className="avatar-img"
                />
                {isOnline && <div className="online-dot"></div>}
              </div>
              
              <div className="chat-info">
                <div className="chat-name">{otherParticipant?.name || 'Unknown User'}</div>
                <div className="chat-preview">
                  {room.lastMessage?.content || 'No messages yet'}
                </div>
              </div>
              
              <div className="chat-meta">
                <div className="chat-time">
                  {room.lastMessage?.createdAt 
                    ? new Date(room.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : ''
                  }
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatSidebar;