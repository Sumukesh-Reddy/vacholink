import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const UserList = ({ onSelectUser, onClose }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = useCallback(async () => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setUsers([]);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get('http://localhost:3001/api/users/search', {
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content user-list-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Start New Chat</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="user-search">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="user-list">
          {loading ? (
            <div className="loading">Loading users...</div>
          ) : users.length > 0 ? (
            users.map(otherUser => (
              <div
                key={otherUser._id}
                className="user-item"
                onClick={() => onSelectUser(otherUser._id)}
              >
                <img
                  src={otherUser.profilePhoto || `https://ui-avatars.com/api/?name=${otherUser.name}&background=random`}
                  alt={otherUser.name}
                  className="user-avatar"
                />
                <div className="user-info">
                  <div className="user-name">{otherUser.name}</div>
                  <div className="user-status">
                    <span className={`status-dot ${otherUser.online ? 'online' : 'offline'}`}></span>
                    {otherUser.online ? 'Online' : 'Offline'}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-users">No users found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserList;