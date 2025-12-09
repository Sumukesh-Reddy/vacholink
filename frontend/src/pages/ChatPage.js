import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import ChatSidebar from '../components/Chat/ChatSidebar';
import ChatWindow from '../components/Chat/ChatWindow';
import UserList from '../components/Chat/UserList';

const ChatPage = () => {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserList, setShowUserList] = useState(false);

  const fetchChatRooms = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/chat/rooms');
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
      const response = await axios.get(`http://localhost:3001/api/chat/messages/${roomId}`);
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
      const response = await axios.post('http://localhost:3001/api/chat/room', {
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
      await axios.delete(`http://localhost:3001/api/chat/room/${roomId}`);
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
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading chats...</p>
      </div>
    );
  }

  return (
    <div className="chat-page">
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
        <div className="no-chat-selected">
          <div className="no-chat-content">
            <h2>Welcome to Chat App!</h2>
            <p>Select a conversation or start a new one</p>
            <button 
              className="new-chat-button"
              onClick={() => setShowUserList(true)}
            >
              Start New Chat
            </button>
          </div>
        </div>
      )}

      {showUserList && (
        <UserList
          onSelectUser={handleStartNewChat}
          onClose={() => setShowUserList(false)}
        />
      )}
    </div>
  );
};

export default ChatPage;