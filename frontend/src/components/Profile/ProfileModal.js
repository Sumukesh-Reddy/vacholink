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
        background: '#2f3136',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.6)',
        border: '1px solid #202225',
        position: 'relative'
      }} onClick={(e) => e.stopPropagation()}>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px',
          borderBottom: '1px solid #202225',
          background: '#36393f'
        }}>
          <div>
            <p style={{
              color: '#8e9297',
              fontSize: '12px',
              textTransform: 'uppercase',
              marginBottom: '4px',
              fontWeight: '600'
            }}>Profile Center</p>
            <h3 style={{
              color: '#ffffff',
              fontSize: '20px',
              fontWeight: '700'
            }}>Edit Profile</h3>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#b9bbbe',
              padding: '0',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#202225'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            ×
          </button>
        </div>

        
        <div style={{
          display: 'flex',
          padding: '30px',
          gap: '30px',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #36393f 0%, #2f3136 100%)',
          borderBottom: '1px solid #202225'
        }}>
          <div style={{
            position: 'relative',
            flexShrink: 0
          }}>
            <img
              src={user?.profilePhoto || `https://ui-avatars.com/api/?name=${user?.name}&background=7289da&color=fff`}
              alt={user?.name}
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '4px solid #7289da',
                boxShadow: '0 8px 32px rgba(114, 137, 218, 0.3)'
              }}
            />
            <button
              style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                background: '#7289da',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#677bc4'}
              onMouseLeave={(e) => e.target.style.background = '#7289da'}
              onClick={() => fileInputRef.current.click()}
              disabled={loading}
            >
              {loading ? 'Uploading...' : 'Change'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              style={{ display: 'none' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{
              color: '#ffffff',
              fontSize: '24px',
              fontWeight: '700',
              marginBottom: '8px'
            }}>{user?.name}</h2>
            <p style={{ color: '#b9bbbe', marginBottom: '8px' }}>{user?.email}</p>
            <p style={{ color: '#8e9297', fontSize: '14px', marginBottom: '16px' }}>
              Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
            </p>
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <span style={{
                background: '#202225',
                color: '#b9bbbe',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600'
              }}>{user?.accountType || 'user'}</span>
              <span style={{
                background: user?.online ? '#3ba55d20' : '#747f8d20',
                color: user?.online ? '#3ba55d' : '#747f8d',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: user?.online ? '#3ba55d' : '#747f8d'
                }}></div>
                {user?.online ? 'Online' : 'Offline'}
              </span>
            </div>
            {user?.bio && (
              <p style={{
                color: '#dcddde',
                fontStyle: 'italic',
                fontSize: '14px',
                borderLeft: '3px solid #7289da',
                paddingLeft: '12px',
                marginTop: '12px'
              }}>"{user.bio}"</p>
            )}
          </div>
        </div>


        <form onSubmit={handleSubmit} style={{
          padding: '30px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px'
        }}>
          <div>
            <label htmlFor="name" style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              color: '#8e9297',
              fontSize: '12px',
              textTransform: 'uppercase'
            }}>Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
              style={{
                width: '100%',
                padding: '12px',
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
          </div>

          <div>
            <label htmlFor="email" style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              color: '#8e9297',
              fontSize: '12px',
              textTransform: 'uppercase'
            }}>Email</label>
            <input
              type="email"
              value={user?.email}
              disabled
              style={{
                width: '100%',
                padding: '12px',
                background: '#202225',
                border: '1px solid #202225',
                borderRadius: '4px',
                color: '#72767d',
                fontSize: '14px',
                cursor: 'not-allowed'
              }}
            />
            <small style={{
              display: 'block',
              marginTop: '4px',
              color: '#8e9297',
              fontSize: '12px'
            }}>Email cannot be changed</small>
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label htmlFor="bio" style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              color: '#8e9297',
              fontSize: '12px',
              textTransform: 'uppercase'
            }}>Bio</label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself"
              rows="3"
              style={{
                width: '100%',
                padding: '12px',
                background: '#202225',
                border: '1px solid #202225',
                borderRadius: '4px',
                color: '#dcddde',
                fontSize: '14px',
                transition: 'all 0.2s',
                resize: 'vertical'
              }}
              onFocus={(e) => e.target.style.borderColor = '#7289da'}
              onBlur={(e) => e.target.style.borderColor = '#202225'}
            />
          </div>

          <div style={{
            gridColumn: 'span 2',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '20px',
            borderTop: '1px solid #202225'
          }}>
            <button
              type="button"
              style={{
                background: 'transparent',
                color: '#b9bbbe',
                border: '1px solid #4f545c',
                padding: '10px 20px',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#4f545c';
                e.target.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#b9bbbe';
              }}
              onClick={() => setShowChangePassword(true)}
            >
              Change Password
            </button>
            <button
              type="submit"
              style={{
                background: loading ? '#677bc4' : '#7289da',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => !loading && (e.target.style.background = '#677bc4')}
              onMouseLeave={(e) => !loading && (e.target.style.background = '#7289da')}
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