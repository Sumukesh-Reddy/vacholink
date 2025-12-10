import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const ChatSidebar = ({ rooms, selectedRoom, onSelectRoom, onStartNewChat, onlineUsers }) => {
  const { user } = useAuth();

  return (
    <div style={{
      width: '320px',
      background: '#2f3136',
      borderRight: '1px solid #202225',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      flexShrink: 0
    }}>
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #202225'
      }}>
        <div style={{
          position: 'relative',
          marginBottom: '12px'
        }}>
          <input
            type="text"
            placeholder="Search chats..."
            style={{
              width: '100%',
              padding: '12px 40px 12px 16px',
              background: '#202225',
              border: '1px solid #202225',
              borderRadius: '4px',
              color: '#dcddde',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#7289da'}
            onBlur={(e) => e.target.style.borderColor = '#202225'}
          />
          <span style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#8e9297',
            fontSize: '14px'
          }}>🔍</span>
        </div>
        <button 
          style={{
            width: '100%',
            background: '#7289da',
            color: 'white',
            border: 'none',
            padding: '12px',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontFamily: "'Whitney', sans-serif"
          }}
          onMouseEnter={(e) => e.target.style.background = '#677bc4'}
          onMouseLeave={(e) => e.target.style.background = '#7289da'}
          onClick={onStartNewChat}
        >
          + New Chat
        </button>
      </div>
      
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '8px 0'
      }}>
        {rooms.map(room => {
          const otherParticipant = room.participants?.find(p => p._id !== user?._id?.toString()) || room.participants?.[0];
          const isOnline = onlineUsers.has(otherParticipant?._id?.toString());
          
          return (
            <div
              key={room._id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 20px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                borderBottom: '1px solid #202225',
                background: selectedRoom?._id === room._id ? '#202225' : 'transparent',
                borderLeft: selectedRoom?._id === room._id ? '4px solid #7289da' : '4px solid transparent'
              }}
              onMouseEnter={(e) => {
                if (selectedRoom?._id !== room._id) {
                  e.target.style.background = '#202225';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedRoom?._id !== room._id) {
                  e.target.style.background = 'transparent';
                }
              }}
              onClick={() => onSelectRoom(room)}
            >
              <div style={{
                position: 'relative',
                marginRight: '12px',
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
                {isOnline && (
                  <div style={{
                    position: 'absolute',
                    bottom: '2px',
                    right: '2px',
                    width: '12px',
                    height: '12px',
                    background: '#3ba55d',
                    border: '2px solid #2f3136',
                    borderRadius: '50%'
                  }}></div>
                )}
              </div>
              
              <div style={{
                flex: 1,
                minWidth: 0
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '4px'
                }}>
                  <div style={{
                    fontWeight: '600',
                    color: '#ffffff',
                    fontSize: '14px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>{otherParticipant?.name || 'Unknown User'}</div>
                  {isOnline && (
                    <div style={{
                      width: '6px',
                      height: '6px',
                      background: '#3ba55d',
                      borderRadius: '50%'
                    }}></div>
                  )}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#8e9297',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {room.lastMessage?.content || 'No messages yet'}
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                flexShrink: 0
              }}>
                <div style={{
                  fontSize: '12px',
                  color: '#8e9297'
                }}>
                  {room.lastMessage?.createdAt 
                    ? new Date(room.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : ''
                  }
                </div>
                {(room.unreadCount > 0) && (
                  <div style={{
                    background: '#ed4245',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: '600',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    marginTop: '4px'
                  }}>
                    {room.unreadCount}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatSidebar;