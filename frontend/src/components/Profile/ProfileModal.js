import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import ChangePassword from './ChangePassword';

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, updateProfile, uploadProfilePhoto } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [loading, setLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && user) {
      setName(user.name || '');
      setBio(user.bio || '');
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await updateProfile({ name, bio });
    
    if (result.success) {
      toast.success('Profile updated successfully!');
      onClose();
    } else {
      toast.error(result.message);
    }
    
    setLoading(false);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setLoading(true);
    const result = await uploadProfilePhoto(file);
    
    if (result.success) {
      toast.success('Profile photo updated!');
    } else {
      toast.error(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content profile-modal glass" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">Profile Center</p>
            <h3>Edit Profile</h3>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="profile-hero">
          <div className="profile-photo-container floating">
            <img
              src={user?.profilePhoto || `https://ui-avatars.com/api/?name=${user?.name}&background=random`}
              alt={user?.name}
              className="profile-photo-large"
            />
            <button
              className="photo-upload-button"
              onClick={() => fileInputRef.current.click()}
              disabled={loading}
            >
              {loading ? 'Uploading...' : 'Change Photo'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              style={{ display: 'none' }}
            />
          </div>
          <div className="profile-hero-info card-3d">
            <h2>{user?.name}</h2>
            <p className="muted">{user?.email}</p>
            <p className="muted">Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</p>
            <div className="chip-row">
              <span className="chip">{user?.accountType || 'user'}</span>
              <span className={`chip ${user?.online ? 'chip-success' : 'chip-muted'}`}>
                {user?.online ? 'Online' : 'Offline'}
              </span>
            </div>
            {user?.bio && <p className="bio-preview">“{user.bio}”</p>}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="profile-form two-column">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={user?.email}
              disabled
              className="disabled-input"
            />
            <small className="hint">Email cannot be changed</small>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => setShowChangePassword(true)}
            >
              Change Password
            </button>
            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        {showChangePassword && (
          <ChangePassword
            onClose={() => setShowChangePassword(false)}
            onSuccess={() => {
              setShowChangePassword(false);
              toast.success('Password changed successfully!');
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ProfileModal;