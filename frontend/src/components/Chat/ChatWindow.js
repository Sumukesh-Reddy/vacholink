import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import FriendProfileModal from '../Friends/FriendProfileModal';

const QUICK_REACTIONS = ['👍', '💞', '😂', '😮', '😢', '😡', '🔥', '🤭', '🐼'];
const EMOJIS = [
  // Smileys & Emotion
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊',
  '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜',
  '🤪', '😝', '🤑', '🤗', '🤭', '🫢', '🤫', '🤔', '🤐', '🤨', '😐', '😑',
  '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷',
  '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '😵', '🤯', '🤠', '🥳', '🥸',
  '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺',
  '🥹', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞',
  '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️',
  // Gestures & People
  '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🫰', '🤟',
  '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '🫵', '👍', '👎', '✊',
  '👊', '🤛', '🤜', '👏', '🙌', '🫶', '🤲', '🤝', '🙏', '✍️', '💅', '🤳',
  '💪', '🦾', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '👁️', '👀', '🫦', '🫀',
  // Animals & Nature
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮',
  '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐔', '🐧', '🐦', '🦆', '🦅', '🦉',
  '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🦋', '🐌', '🐞', '🐜', '🦗', '🐢',
  '🐍', '🦎', '🦑', '🐙', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈',
  '🐊', '🦧', '🦍', '🦥', '🦦', '🦨', '🦡', '🦫', '🦦', '🐿️', '🦔', '🐾',
  // Food & Drink
  '🍎', '🍊', '🍋', '🍇', '🍓', '🫐', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅',
  '🫒', '🥑', '🍆', '🥔', '🌽', '🌶️', '🥦', '🥬', '🥒', '🧄', '🧅', '🍄',
  '🍕', '🍔', '🌮', '🌯', '🥪', '🥚', '🍳', '🧇', '🥞', '🧆', '🍗', '🍖',
  '🌭', '🍟', '🧀', '🍱', '🍣', '🍜', '🍝', '🍛', '🍦', '🍧', '🍨', '🍩',
  '🍪', '🎂', '🍰', '🧁', '🍫', '🍬', '🍭', '☕', '🍵', '🧃', '🥤', '🧋',
  '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉', '🍾', '🧊', '🥄', '🍴',
  // Travel & Places
  '🚀', '✈️', '🚂', '🚗', '🚕', '🚙', '🛻', '🚌', '🏎️', '🛵', '🚲', '🛸',
  '🏠', '🏡', '🏢', '🏰', '🏯', '🗼', '🗽', '⛪', '🌁', '🌉', '🌃', '🌆',
  '🌇', '🌄', '🏔️', '⛰️', '🌋', '🏕️', '🏖️', '🏜️', '🏝️', '🌊', '🌌', '🌠',
  // Activities & Sports
  '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '⛳', '🥅',
  '🎯', '🎮', '🎲', '🎭', '🎨', '🎬', '🎤', '🎧', '🎸', '🎹', '🎺', '🎻',
  '🎁', '🎀', '🎊', '🎉', '🎆', '🎇', '🧨', '🪅', '🪆', '🎋', '🎍', '🎎',
  // Objects & Symbols
  '💡', '🔦', '🕯️', '💰', '💳', '💎', '🔑', '🗝️', '🔒', '🔓', '📱', '💻',
  '⌚', '📷', '📹', '📺', '📻', '🧭', '⏰', '⌛', '🔭', '🔬', '📡', '🧲',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕',
  '💞', '💓', '💗', '💖', '💘', '💝', '💟', '✨', '⭐', '🌟', '💫', '☀️',
  '🌈', '❄️', '⛄', '🌙', '🌛', '🌜', '🌝', '🌚', '🌞', '🪐', '🌍', '🌎',
];

const ChatWindow = ({ room, messages, onSendMessage, onTyping, onDeleteRoom, onBack, isMobile, typingUser, onEditMessage, onReactMessage, onDeleteMessage }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [hoveredMsgId, setHoveredMsgId] = useState(null);
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const [stars, setStars] = useState([]);
  const [showFriendProfile, setShowFriendProfile] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [dragStartX, setDragStartX] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [swipingMsgId, setSwipingMsgId] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Robust check for the other person in a 1v1 chat
  const otherParticipant = room.participants?.filter(p => p._id !== user?._id)[0] || room.participants?.[0];

  useEffect(() => {
    // Generate responsive stars only once or when isMobile changes
    const starCount = isMobile ? 200 : 500;
    const newStars = [];
    for (let i = 0; i < starCount; i++) {
      newStars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * (isMobile ? 1.5 : 2) + 1,
        opacity: Math.random() * 0.5 + 0.2,
        delay: Math.random() * 3,
        duration: Math.random() * 2 + 1
      });
    }
    setStars(newStars);
  }, [isMobile]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentMessage = message.trim();
    if (currentMessage || attachment) {
      const replyId = replyingTo?._id;
      // Clear input immediately for better UX
      setMessage('');
      setAttachment(null);
      setReplyingTo(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      setIsUploading(true);
      try {
        await onSendMessage(currentMessage, attachment, replyId);
        setIsTyping(false);
        onTyping(false);
        
        // Refocus textarea after send to keep keyboard open on mobile
        setTimeout(() => {
          textareaRef.current?.focus();
        }, 10);
      } catch (error) {
        // If it failed, we might want to restore the message, but for now just log
        console.error(error);
        setMessage(currentMessage); // Restore message on failure
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        toast.error('File size must be less than 20MB');
        return;
      }
      setAttachment(file);
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

  const handleFocus = () => {
    // Small delay to allow keyboard to start opening
    setTimeout(scrollToBottom, 300);
  };

  // Close dropdown or emoji picker on outside click
  useEffect(() => {
    const handler = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
      if (activeMenuId && !e.target.closest('.message-actions-dropdown') && !e.target.closest('.message-menu-trigger')) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [activeMenuId]);

  const insertEmoji = (emoji) => {
    const textarea = textareaRef.current;
    if (!textarea) { setMessage(prev => prev + emoji); return; }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newMsg = message.slice(0, start) + emoji + message.slice(end);
    setMessage(newMsg);
    setTimeout(() => {
      textarea.selectionStart = start + emoji.length;
      textarea.selectionEnd = start + emoji.length;
      textarea.focus();
    }, 0);
  };

  const handleSaveEdit = (msgId) => {
    if (editContent.trim()) onEditMessage(msgId, editContent.trim());
    setEditingMsgId(null);
    setEditContent('');
  };

  const handleReply = (msg) => {
    setReplyingTo(msg);
    textareaRef.current?.focus();
  };

  const handleDragStart = (e, msgId) => {
    const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
    setDragStartX(clientX);
    setSwipingMsgId(msgId);
    setDragOffset(0);
  };

  const handleDragMove = (e) => {
    if (dragStartX === null || swipingMsgId === null) return;
    const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
    let diff = clientX - dragStartX;
    
    // Only allow right swipe for reply
    if (diff < 0) diff = 0;
    // Rubber band effect after 80px
    if (diff > 80) diff = 80 + (diff - 80) * 0.3;
    
    setDragOffset(diff);
  };

  const handleDragEnd = () => {
    if (dragOffset > 60 && swipingMsgId) {
      const msg = messages.find(m => m._id === swipingMsgId);
      if (msg && !msg.deleted) {
        handleReply(msg);
        // Haptic feedback if available
        if (window.navigator.vibrate) window.navigator.vibrate(10);
      }
    }
    setDragStartX(null);
    setSwipingMsgId(null);
    setDragOffset(0);
  };

  const handleTouchStart = (e, msgId) => handleDragStart(e, msgId);
  const handleTouchMove = (e) => handleDragMove(e);
  const handleTouchEnd = () => handleDragEnd();

  const scrollToMessage = (msgId) => {
    const element = document.getElementById(`msg-${msgId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('message-highlight-pulse');
      setTimeout(() => element.classList.remove('message-highlight-pulse'), 2000);
    }
  };
  const renderHighlightedText = (text) => {
    if (!text) return null;
    const highlightChars = [];
    const highlightSet = new Set([...highlightChars, ...highlightChars.map(c => c.toUpperCase())]);

    return text.split('').map((char, index) => {
      if (highlightSet.has(char)) {
        return (
          <span key={index} className="special-highlight">
            {char}
          </span>
        );
      }
      return char;
    });
  };

  function formatLastSeen(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString(); // or a custom formatter
  }

  return (
    <div className="chat-window-container">

      <div className="chat-stars-bg">
        {stars.map(star => (
          <div
            key={star.id}
            className="chat-star-bg"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`
            }}
          />
        ))}
      </div>


      <div className="chat-bg-overlay" />

      <div className="chat-header">
        {/* Mobile Back Button */}
        {isMobile && onBack && (
          <button
            className="mobile-back-button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onBack();
            }}
            aria-label="Back to chats"
          >
            ←
          </button>
        )}


        <div
          className="header-user"
          onClick={() => setShowFriendProfile(true)}
          style={{ 
            cursor: 'pointer',
            marginLeft: isMobile && onBack ? '40px' : '0'
          }}
        >
          <div className="user-avatar-container">
            <img
              src={otherParticipant?.profilePhoto || `https://ui-avatars.com/api/?name=${otherParticipant?.name}&background=7289da&color=fff`}
              alt={otherParticipant?.name}
              className="user-avatar"
            />
            {otherParticipant?.online && (
              <div className="online-indicator" />
            )}
          </div>
          <div className="user-info">
            <div className="user-name">{otherParticipant?.name || 'Unknown User'}</div>
            <div className="user-status">
              <div className={`status-dot ${otherParticipant?.online ? 'online' : 'offline'}`} />
              <span className="status-text">
                {otherParticipant?.online ? 'Online' : `Last seen ${formatLastSeen(otherParticipant?.lastSeen)}`}
              </span>

            </div>
          </div>
        </div>
        <div className="header-actions">
          <button
            className="delete-button"
            onClick={onDeleteRoom}
          >
            Delete chat
          </button>
        </div>
      </div>

      <div className="messages-container" ref={messagesContainerRef}>

        <div className="messages-particles">
          {Array.from({ length: isMobile ? 8 : 15 }).map((_, i) => (
            <div
              key={i}
              className="messages-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${Math.random() * 5 + 3}s`
              }}
            />
          ))}
        </div>

        {messages.map(msg => {
          const isOwnMessage = msg.sender?._id === user?._id;
          const messageDate = new Date(msg.createdAt);
          const isToday = messageDate.toDateString() === new Date().toDateString();
          const isEditing = editingMsgId === msg._id;
          const isHovered = hoveredMsgId === msg._id;

          // Group reactions by emoji
          const reactionGroups = {};
          (msg.reactions || []).forEach(r => {
            if (!reactionGroups[r.emoji]) reactionGroups[r.emoji] = [];
            reactionGroups[r.emoji].push(r);
          });

          return (
            <div
              key={msg._id}
              id={`msg-${msg._id}`}
              className={`message-wrapper ${isOwnMessage ? 'own-message' : 'other-message'} ${msg.deleted ? 'deleted-message' : ''} ${swipingMsgId === msg._id ? 'is-swiping' : ''}`}
              onMouseEnter={() => setHoveredMsgId(msg._id)}
              onMouseLeave={() => { setHoveredMsgId(null); if (swipingMsgId === msg._id) handleDragEnd(); }}
              onTouchStart={(e) => handleTouchStart(e, msg._id)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={(e) => handleDragStart(e, msg._id)}
              onMouseMove={(e) => swipingMsgId === msg._id && handleDragMove(e)}
              onMouseUp={() => swipingMsgId === msg._id && handleDragEnd()}
            >
              {/* Swipe Reply Indicator */}
              {swipingMsgId === msg._id && dragOffset > 10 && (
                <div className="swipe-reply-indicator" style={{ 
                  opacity: Math.min(dragOffset / 60, 1),
                  transform: `scale(${Math.min(dragOffset / 60, 1)})`,
                  left: isOwnMessage ? 'auto' : '-40px',
                  right: isOwnMessage ? '-40px' : 'auto'
                }}>
                  ↩️
                </div>
              )}
              {!isOwnMessage && (
                <img
                  src={msg.sender?.profilePhoto || `https://ui-avatars.com/api/?name=${msg.sender?.name}&background=7289da&color=fff`}
                  alt={msg.sender?.name}
                  className="message-avatar"
                  style={{
                    transform: swipingMsgId === msg._id ? `translateX(${dragOffset}px)` : 'none',
                    transition: swipingMsgId === msg._id ? 'none' : 'transform 0.2s cubic-bezier(0.18, 0.89, 0.32, 1.28)'
                  }}
                />
              )}

              <div 
                className="message-content-wrapper"
                style={{
                  transform: swipingMsgId === msg._id ? `translateX(${dragOffset}px)` : 'none',
                  transition: swipingMsgId === msg._id ? 'none' : 'transform 0.2s cubic-bezier(0.18, 0.89, 0.32, 1.28)'
                }}
              >
                {!isOwnMessage && (
                  <div className="message-sender">{msg.sender?.name}</div>
                )}

                {/* Hover reaction bar - ONLY emojis now */}
                {isHovered && !isEditing && !msg.deleted && (
                  <div className={`reaction-bar ${isOwnMessage ? 'reaction-bar-own' : 'reaction-bar-other'}`}>
                    {QUICK_REACTIONS.map(emoji => (
                      <button key={emoji} className="reaction-btn" onClick={() => onReactMessage(msg._id, emoji)}>
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                {/* Action Menu Trigger (Small Arrow) - OUTSIDE BUBBLE */}
                {isHovered && !isEditing && !msg.deleted && (
                  <div className="message-menu-container">
                    <button 
                      className="message-menu-trigger" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === msg._id ? null : msg._id);
                      }}
                    >
                      ▼
                    </button>
                    {activeMenuId === msg._id && (
                      <div className={`message-actions-dropdown ${isOwnMessage ? 'dropdown-own' : 'dropdown-other'}`}>
                        <button onClick={() => { handleReply(msg); setActiveMenuId(null); }}>
                          <span className="menu-icon">↩️</span> Reply
                        </button>
                        {isOwnMessage && (
                          <>
                            <button onClick={() => { setEditingMsgId(msg._id); setEditContent(msg.content || ''); setActiveMenuId(null); }}>
                              <span className="menu-icon">✏️</span> Edit
                            </button>
                            <button className="delete-option" onClick={() => { if(window.confirm('Delete this message?')) onDeleteMessage(msg._id); setActiveMenuId(null); }}>
                              <span className="menu-icon">🗑️</span> Delete
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="message-bubble">
                  <div className="message-glow" />
                  
                  {/* Reply Context */}
                  {msg.replyTo && (
                    <div 
                      className="reply-context-bubble" 
                      onClick={() => scrollToMessage(msg.replyTo?._id)}
                    >
                      <div className="reply-context-user">{msg.replyTo?.sender?.name}</div>
                      <div className="reply-context-content">
                        {msg.replyTo?.deleted ? 'This message was deleted' : (msg.replyTo?.content || 'Attachment')}
                      </div>
                    </div>
                  )}

                  {msg.type === 'image' && msg.mediaUrl && !msg.deleted && (
                    <img src={msg.mediaUrl} alt="attachment" className="message-image" />
                  )}
                  {msg.type === 'video' && msg.mediaUrl && (
                    <video controls src={msg.mediaUrl} className="message-video" />
                  )}
                  {msg.type === 'file' && msg.mediaUrl && (
                    <a href={msg.mediaUrl} target="_blank" rel="noopener noreferrer" className="message-file-link">
                      <span className="file-icon">📄</span>
                      <span className="file-name">{msg.mediaName || 'Attachment'}</span>
                    </a>
                  )}
                  {isEditing ? (
                    <div className="edit-mode">
                      <textarea
                        className="edit-textarea"
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSaveEdit(msg._id); } if (e.key === 'Escape') { setEditingMsgId(null); } }}
                        autoFocus
                      />
                      <div className="edit-actions">
                        <button className="edit-save" onClick={() => handleSaveEdit(msg._id)}>Save</button>
                        <button className="edit-cancel" onClick={() => setEditingMsgId(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    msg.deleted ? (
                      <span className="message-text deleted-text">🚫 This message was deleted</span>
                    ) : (
                      msg.content && <span className="message-text">{renderHighlightedText(msg.content)}</span>
                    )
                  )}
                  {msg.editedAt && !isEditing && <span className="edited-label"> (edited)</span>}
                </div>

                {/* Reactions chips */}
                {Object.keys(reactionGroups).length > 0 && (
                  <div className="reactions-display">
                    {Object.entries(reactionGroups).map(([emoji, reactors]) => {
                      const iMine = reactors.some(r => (r.userId?._id || r.userId) === user?._id);
                      return (
                        <button key={emoji} className={`reaction-chip${iMine ? ' my-reaction' : ''}`} onClick={() => onReactMessage(msg._id, emoji)}>
                          {emoji} {reactors.length}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="message-info">
                  {isToday
                    ? messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : messageDate.toLocaleDateString() + ' ' + messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }
                  {isOwnMessage && msg.read && (
                    <span className="read-indicator">✓✓</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} className="messages-end" />

        {/* Typing indicator */}
        {typingUser && (
          <div className="typing-indicator-wrapper">
            <img
              src={otherParticipant?.profilePhoto || `https://ui-avatars.com/api/?name=${otherParticipant?.name}&background=7289da&color=fff`}
              alt={otherParticipant?.name}
              className="message-avatar"
            />
            <div className="typing-bubble">
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          </div>
        )}
      </div>

      <div className="message-input-container">
        {replyingTo && (
          <div className="replying-preview">
            <div className="reply-info">
              <div className="reply-to-user">Replying to {replyingTo.sender?.name}</div>
              <div className="reply-to-content">{replyingTo.content || 'Attachment'}</div>
            </div>
            <button className="cancel-reply" onClick={() => setReplyingTo(null)}>✕</button>
          </div>
        )}
        {attachment && (
          <div className="attachment-preview">
            <span className="attachment-name">{attachment.name}</span>
            <button
              type="button"
              className="remove-attachment"
              onClick={() => {
                setAttachment(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
            >
              ✕
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="message-form">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            accept="image/*,video/*,application/pdf"
          />
          <button
            type="button"
            className="attach-button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            title="Attach file"
          >
            <span className="attach-icon">📎</span>
          </button>

          {/* Emoji picker trigger + panel */}
          <div className="emoji-picker-wrapper" ref={emojiPickerRef}>
            <button
              type="button"
              className="emoji-trigger-btn"
              onClick={() => setShowEmojiPicker(p => !p)}
              title="Emoji"
            >
              😊
            </button>
            {showEmojiPicker && (
              <div className="emoji-picker-panel">
                <div className="emoji-grid">
                  {EMOJIS.map(emoji => (
                    <button key={emoji} type="button" className="emoji-item" onClick={() => { insertEmoji(emoji); setShowEmojiPicker(false); }}>
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            onFocus={handleFocus}
            placeholder="Type a message..."
            className="message-textarea"
            rows="1"
            disabled={isUploading && attachment} // Only disable if uploading a file, otherwise keep enabled for typing
          />
          <button
            type="submit"
            className="send-button"
            disabled={(!message.trim() && !attachment) || isUploading}
          >
            <div className="send-button-glow" />
            <span className="send-icon">{isUploading ? '⌛' : '➤'}</span>
          </button>
        </form>
      </div>

      {showFriendProfile && (
        <FriendProfileModal
          user={otherParticipant}
          onClose={() => setShowFriendProfile(false)}
        />
      )}

      <style>{`
        /* Base styles */
        .chat-window-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #36393f;
          position: relative;
          overflow: hidden;
          height: 100%;
        }

        .chat-stars-bg {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 0;
        }

        .chat-star-bg {
          position: absolute;
          background: #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 4px rgba(255, 255, 255, 0.8);
          animation: twinkle infinite alternate;
          filter: blur(0.5px);
        }

        .chat-bg-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(ellipse at center, transparent 40%, rgba(54, 57, 63, 0.9) 100%);
          pointer-events: none;
          z-index: 0;
        }

        /* Header */
        .chat-header {
          padding: 16px 24px;
          border-bottom: 1px solid #202225;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #2f3136;
          position: relative;
          z-index: 1;
          min-height: 72px;
        }

        /* Mobile Back Button */
        .mobile-back-button {
          display: none;
          position: absolute;
          left: 12px;
          background: transparent;
          border: none;
          color: #ffffff;
          font-size: 24px;
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          z-index: 2;
        }

        .mobile-back-button:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .header-user {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
          min-width: 0;
        }

        .user-avatar-container {
          position: relative;
          flex-shrink: 0;
        }

        .user-avatar {
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
          animation: pulse 2s infinite;
        }

        .user-info {
          flex: 1;
          min-width: 0;
        }

        .user-name {
          font-weight: 700;
          font-size: 18px;
          color: #ffffff;
          margin-bottom: 4px;
          text-shadow: 0 1px 2px rgba(0,0,0,0.5);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-status {
          font-size: 14px;
          color: #8e9297;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .status-dot.online {
          background: #3ba55d;
          animation: pulse 2s infinite;
        }

        .status-dot.offline {
          background: #747f8d;
        }

        .status-text {
          font-size: 14px;
        }

        .header-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
          align-items: center;
        }

        .delete-button {
          background: #ed4245;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          z-index: 1;
          min-height: 36px;
          white-space: nowrap;
        }

        .delete-button:hover {
          background: #d84040;
        }

        /* Messages container */
        .messages-container {
          flex: 1;
          padding: 24px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: transparent;
          position: relative;
          z-index: 1;
        }

        .messages-particles {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .messages-particle {
          position: absolute;
          width: 1px;
          height: 1px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          box-shadow: 0 0 3px rgba(255, 255, 255, 0.3);
          animation: float infinite alternate;
        }

        /* Message styling */
        .message-wrapper {
          display: flex;
          gap: 12px;
          max-width: 70%;
          align-self: flex-start;
          flex-direction: row;
          position: relative;
          z-index: 1;
        }

        .message-wrapper.own-message {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #202225;
          align-self: flex-end;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          flex-shrink: 0;
        }

        .message-content-wrapper {
          max-width: 100%;
        }

        .message-sender {
          color: #ffffff;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 4px;
          margin-left: 8px;
          text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        }

        .own-message .message-sender {
          margin-left: 0;
          margin-right: 8px;
          text-align: right;
        }

        .message-bubble {
          padding: 12px 16px;
          border-radius: 18px;
          max-width: 100%;
          word-wrap: break-word;
          background: #40444b;
          color: #dcddde;
          border-bottom-left-radius: 4px;
          border-bottom-right-radius: 18px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          position: relative;
          overflow: hidden;
        }

        .own-message .message-bubble {
          background: #7289da;
          color: white;
          border-bottom-left-radius: 18px;
          border-bottom-right-radius: 4px;
        }

        .message-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.05), transparent 70%);
          pointer-events: none;
        }

        .own-message .message-glow {
          background: radial-gradient(circle at 30% 30%, rgba(114, 137, 218, 0.1), transparent 70%);
        }

        .message-image {
          max-width: 300px;
          max-height: 300px;
          border-radius: 8px;
          margin-bottom: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .message-text {
          text-shadow: none;
        }

        .own-message .message-text {
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }

        .special-highlight {
          background: linear-gradient(135deg, #ff69b4 0%, #ffd700 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-family: 'Georgia', serif;
          font-weight: 800;
          display: inline-block;
          filter: drop-shadow(0 0 1px rgba(255, 215, 0, 0.3));
          padding: 0 1px;
          transform: scale(1.1);
        }

        .message-info {
          font-size: 11px;
          color: #8e9297;
          margin-top: 4px;
          text-align: left;
          display: flex;
          align-items: center;
          gap: 4px;
          justify-content: flex-start;
          text-shadow: 0 1px 1px rgba(0,0,0,0.3);
        }

        .own-message .message-info {
          text-align: right;
          justify-content: flex-end;
        }

        .read-indicator {
          color: #3ba55d;
          font-size: 12px;
          animation: readPulse 2s infinite;
        }

        .messages-end {
          height: 1px;
        }

        /* Typing indicator */
        .typing-indicator-wrapper {
          display: flex;
          gap: 12px;
          align-items: flex-end;
          align-self: flex-start;
          margin-top: 4px;
        }

        .typing-bubble {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 12px 16px;
          background: #40444b;
          border-radius: 18px;
          border-bottom-left-radius: 4px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          min-width: 56px;
        }

        .typing-dot {
          width: 8px;
          height: 8px;
          background: #8e9297;
          border-radius: 50%;
          animation: typingBounce 1.2s infinite ease-in-out;
        }

        .typing-dot:nth-child(1) { animation-delay: 0s; }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }

        /* Reaction bar (hover) */
        .message-content-wrapper { position: relative; }

        .reaction-bar {
          position: absolute;
          display: flex;
          gap: 4px;
          background: #2f3136;
          border: 1px solid #40444b;
          border-radius: 20px;
          padding: 4px 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          z-index: 10;
          bottom: 100%;
          animation: reactionFadeIn 0.15s ease;
        }
        .reaction-bar-other { left: 0; }
        .reaction-bar-own   { right: 0; }

        @keyframes reactionFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .reaction-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 18px;
          padding: 2px 4px;
          border-radius: 8px;
          transition: transform 0.15s, background 0.15s;
          line-height: 1;
        }
        .reaction-btn:hover { background: rgba(114,137,218,0.2); transform: scale(1.25); }
        .edit-trigger-btn { font-size: 15px; }

        /* Reactions chips below bubble */
        .reactions-display {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-top: 4px;
        }
        .reaction-chip {
          background: #40444b;
          border: 1px solid #4f545c;
          color: #dcddde;
          border-radius: 12px;
          padding: 2px 8px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          gap: 3px;
        }
        .reaction-chip:hover { background: #4f545c; }
        .reaction-chip.my-reaction {
          background: rgba(114,137,218,0.25);
          border-color: #7289da;
          color: #fff;
        }

        /* Edited label */
        .edited-label {
          font-size: 10px;
          opacity: 0.55;
          font-style: italic;
        }

        /* Inline edit mode */
        .edit-mode { display: flex; flex-direction: column; gap: 6px; }
        .edit-textarea {
          width: 100%;
          min-height: 60px;
          background: rgba(0,0,0,0.3);
          border: 1px solid #7289da;
          border-radius: 6px;
          color: #fff;
          font-size: 14px;
          padding: 6px 10px;
          resize: vertical;
          font-family: inherit;
          outline: none;
        }
        .edit-actions { display: flex; gap: 6px; }
        .edit-save {
          background: #7289da; color: #fff; border: none;
          padding: 4px 12px; border-radius: 4px; cursor: pointer;
          font-size: 12px; font-weight: 600; transition: background 0.2s;
        }
        .edit-save:hover { background: #5b6eae; }
        .edit-cancel {
          background: #40444b; color: #dcddde; border: none;
          padding: 4px 12px; border-radius: 4px; cursor: pointer;
          font-size: 12px; transition: background 0.2s;
        }
        .edit-cancel:hover { background: #4f545c; }

        /* Emoji picker in input bar */
        .emoji-picker-wrapper { position: relative; flex-shrink: 0; }
        .emoji-trigger-btn {
          width: 48px; height: 48px; border-radius: 50%;
          background: #4f545c; border: none; cursor: pointer;
          font-size: 22px; display: flex; align-items: center;
          justify-content: center; transition: background 0.2s;
        }
        .emoji-trigger-btn:hover { background: #7289da; }

        .emoji-picker-panel {
          position: absolute;
          bottom: calc(100% + 10px);
          left: 0;
          background: #2f3136;
          border: 1px solid #40444b;
          border-radius: 12px;
          padding: 10px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.5);
          z-index: 100;
          width: 320px;
          max-height: 300px;
          overflow-y: auto;
          animation: reactionFadeIn 0.15s ease;
          scrollbar-width: thin;
          scrollbar-color: #202225 #2f3136;
        }

        .emoji-picker-panel::-webkit-scrollbar {
          width: 6px;
        }
        
        .emoji-picker-panel::-webkit-scrollbar-track {
          background: #2f3136;
          border-radius: 10px;
        }
        
        .emoji-picker-panel::-webkit-scrollbar-thumb {
          background: #202225;
          border-radius: 10px;
        }
        
        .emoji-picker-panel::-webkit-scrollbar-thumb:hover {
          background: #7289da;
        }

        .emoji-grid {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 4px;
        }
        .emoji-item {
          background: transparent; border: none; cursor: pointer;
          font-size: 20px; padding: 4px; border-radius: 6px;
          transition: background 0.15s, transform 0.15s;
          line-height: 1;
        }
        .emoji-item:hover { background: rgba(114,137,218,0.2); transform: scale(1.2); }

        /* Input area */
        .message-input-container {
          padding: 20px 24px;
          border-top: 1px solid #202225;
          background: #2f3136;
          position: relative;
          z-index: 1;
        }

        .message-form {
          display: flex;
          gap: 12px;
          align-items: flex-end;
          width: 100%;
        }

        .attachment-preview {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #202225;
          border-radius: 8px;
          margin-bottom: 12px;
          width: fit-content;
          border: 1px solid #7289da;
        }

        .attachment-name {
          color: #dcddde;
          font-size: 14px;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .remove-attachment {
          background: transparent;
          border: none;
          color: #ed4245;
          cursor: pointer;
          font-size: 14px;
          padding: 0 4px;
        }

        .attach-button {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #4f545c;
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s;
        }

        .attach-button:not(:disabled):hover {
          background: #7289da;
        }

        .attach-button:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .attach-icon {
          font-size: 20px;
        }

        .message-video {
          max-width: 300px;
          border-radius: 8px;
          margin-bottom: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .message-file-link {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          text-decoration: none;
          color: #ffffff;
          margin-bottom: 8px;
          transition: background 0.2s;
        }

        .message-file-link:hover {
          background: rgba(0, 0, 0, 0.3);
        }

        .file-icon {
          font-size: 24px;
        }

        .file-name {
          font-size: 14px;
          font-weight: 500;
          word-break: break-all;
        }

        .message-textarea {
          flex: 1;
          padding: 12px 16px;
          background: #40444b;
          border: 1px solid #202225;
          border-radius: 8px;
          color: #dcddde;
          font-size: 16px;
          resize: none;
          max-height: 120px;
          min-height: 48px;
          font-family: "'Whitney', sans-serif";
          transition: all 0.2s;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
          box-sizing: border-box;
        }

        .message-textarea:focus {
          border-color: #7289da;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.2), 0 0 0 2px rgba(114, 137, 218, 0.2);
          outline: none;
        }

        .send-button {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #4f545c;
          color: white;
          border: none;
          cursor: not-allowed;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }

        .send-button:not(:disabled) {
          background: #7289da;
          cursor: pointer;
        }

        .send-button:not(:disabled):hover {
          background: #677bc4;
        }

        .send-button-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: sendPulse 2s infinite;
        }

        .send-button:disabled .send-button-glow {
          animation: none;
        }

        .send-icon {
          font-size: 18px;
          transform: rotate(360deg);
          position: relative;
          z-index: 1;
        }

        /* Animations */
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

        /* Mobile styles */
        @media (max-width: 768px) {
          .chat-header {
            padding: 12px 16px;
            min-height: 64px;
          }

          .mobile-back-button {
            display: flex;
          }

          .user-avatar {
            width: 40px;
            height: 40px;
          }

          .user-name {
            font-size: 16px;
          }

          .user-status {
            font-size: 12px;
          }

          .delete-button {
            padding: 6px 12px;
            font-size: 13px;
            min-height: 32px;
          }

          .messages-container {
            padding: 16px;
            gap: 12px;
          }

          .message-wrapper {
            max-width: 85%;
          }

          .message-bubble {
            padding: 10px 14px;
            font-size: 14px;
          }

          .message-image {
            max-width: 250px;
            max-height: 250px;
          }

          .message-info {
            font-size: 10px;
          }

          .message-input-container {
            padding: 16px;
          }

          .message-textarea {
            padding: 10px 14px;
            font-size: 15px;
            min-height: 44px;
          }

          .send-button {
            width: 44px;
            height: 44px;
          }

          .send-icon {
            font-size: 16px;
          }
        }

        @media (max-width: 480px) {
          .chat-header {
            flex-direction: row;
            align-items: center;
            gap: 8px;
            padding: 12px;
          }

          .header-user {
            width: auto;
            margin-left: 36px;
          }

          .header-actions {
            width: auto;
          }

          .delete-button {
            width: auto;
            padding: 6px 10px;
            font-size: 12px;
          }

          .messages-container {
            padding: 12px;
            gap: 10px;
          }

          .message-wrapper {
            max-width: 90%;
          }

          .message-bubble {
            padding: 8px 12px;
            font-size: 13px;
          }

          .message-image {
            max-width: 200px;
            max-height: 200px;
          }

          .message-input-container {
            padding: 12px;
          }

          .message-form {
            flex-direction: row;
            gap: 10px;
          }

          .message-textarea {
            width: 100%;
          }

          .send-button {
            align-self: flex-end;
            width: 40px;
            height: 40px;
          }
        }

        /* Tablet styles */
        @media (min-width: 769px) and (max-width: 1024px) {
          .chat-header {
            padding: 14px 20px;
          }

          .messages-container {
            padding: 20px;
          }

          .message-bubble {
            font-size: 15px;
          }

          .message-image {
            max-width: 280px;
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

        @media (max-width: 768px) {
          .messages-container::-webkit-scrollbar {
            width: 4px;
          }
        }
        /* Dropdown Menu Styles */
        .message-menu-container {
          position: absolute;
          top: 0px;
          right: -10px;
          z-index: 30;
        }

        .own-message .message-menu-container {
          right: -10px;
          left: auto;
        }

        .other-message .message-menu-container {
          right: -30px;
          left: auto;
        }

        .message-menu-trigger {
          background: #2f3136;
          border: 1px solid #4f545c;
          color: #fff;
          cursor: pointer;
          font-size: 12px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.5);
        }

        .message-menu-trigger:hover {
          background: #7289da;
          border-color: #fff;
          transform: scale(1.1);
        }

        .message-actions-dropdown {
          position: absolute;
          top: 28px;
          background: #18191c;
          border: 1px solid #202225;
          border-radius: 8px;
          padding: 8px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
          width: 130px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          animation: dropdownIn 0.15s ease;
        }

        .dropdown-own {
          right: 0;
        }

        .dropdown-other {
          left: 0;
        }

        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .message-actions-dropdown button {
          background: transparent;
          border: none;
          color: #dcddde;
          padding: 8px 12px;
          text-align: left;
          font-size: 13px;
          cursor: pointer;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: background 0.2s;
        }

        .message-actions-dropdown button:hover {
          background: #4752c4;
          color: #fff;
        }

        .message-actions-dropdown .delete-option:hover {
          background: #ed4245;
        }

        .menu-icon {
          font-size: 14px;
        }

        .message-highlight-pulse {
          animation: highlightPulse 2s ease;
        }

        @keyframes highlightPulse {
          0% { transform: scale(1); background: rgba(114, 137, 218, 0.2); }
          50% { transform: scale(1.02); background: rgba(114, 137, 218, 0.4); }
          100% { transform: scale(1); background: transparent; }
        }

        /* Reply context in bubble */
        .reply-context-bubble {
          background: rgba(0, 0, 0, 0.2);
          border-left: 3px solid #7289da;
          padding: 8px 12px;
          border-radius: 4px;
          margin-bottom: 8px;
          cursor: pointer;
          font-size: 13px;
          transition: background 0.2s;
        }
        .reply-context-bubble:hover {
          background: rgba(0, 0, 0, 0.3);
        }
        .reply-context-user {
          font-weight: bold;
          color: #7289da;
          margin-bottom: 2px;
        }
        .reply-context-content {
          color: #b9bbbe;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 200px;
        }

        /* Replying to preview above input */
        .replying-preview {
          background: #202225;
          border-left: 4px solid #7289da;
          padding: 10px 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          margin-bottom: 1px;
          animation: slideUp 0.2s ease;
        }
        @keyframes slideUp {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .reply-info {
          flex: 1;
          min-width: 0;
        }
        .reply-to-user {
          font-weight: bold;
          color: #7289da;
          font-size: 12px;
          margin-bottom: 2px;
        }
        .reply-to-content {
          color: #8e9297;
          font-size: 13px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .cancel-reply {
          background: transparent;
          border: none;
          color: #8e9297;
          cursor: pointer;
          padding: 5px;
          font-size: 16px;
        }

        /* Deleted message styles */
        .deleted-text {
          font-style: italic;
          opacity: 0.7;
          color: #f04747 !important;
        }
        .deleted-message {
          opacity: 0.8;
        }

        /* Swipe to reply styles */
        .is-swiping {
          cursor: grabbing;
          user-select: none;
        }

        .swipe-reply-indicator {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(114, 137, 218, 0.2);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          color: white;
          pointer-events: none;
          z-index: 0;
          box-shadow: 0 0 10px rgba(114, 137, 218, 0.3);
          transition: background 0.2s;
        }
      `}</style>
    </div>
  );
};

export default ChatWindow;