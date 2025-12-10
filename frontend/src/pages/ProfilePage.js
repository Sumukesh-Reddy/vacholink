import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import ProfileModal from '../components/Profile/ProfileModal';

const ProfilePage = () => {
  const { user } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);

  if (!user) {
    return null;
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 48px)',
      background: '#0a0a0a',
      backgroundImage: 'radial-gradient(white, rgba(255,255,255,.2) 2px, transparent 40px), radial-gradient(white, rgba(255,255,255,.15) 1px, transparent 30px)',
      backgroundSize: '550px 550px, 350px 350px',
      padding: '40px 20px',
      position: 'relative'
    }}>
      {/* Animated star overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        animation: 'twinkle 3s infinite alternate'
      }}></div>
      
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <h1 style={{
            color: '#ffffff',
            fontSize: '32px',
            fontWeight: '700',
            fontFamily: "'Ginto', sans-serif"
          }}>My Profile</h1>
          <button 
            style={{
              background: '#7289da',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#677bc4'}
            onMouseLeave={(e) => e.target.style.background = '#7289da'}
            onClick={() => setShowProfileModal(true)}
          >
            Edit Profile
          </button>
        </div>

        <div style={{
          background: '#2f3136',
          borderRadius: '8px',
          border: '1px solid #202225',
          overflow: 'hidden',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            padding: '30px',
            gap: '30px',
            alignItems: 'center'
          }}>
            <div style={{
              flexShrink: 0
            }}>
              <img
                src={user.profilePhoto || `https://ui-avatars.com/api/?name=${user.name}&background=7289da&color=fff`}
                alt={user.name}
                style={{
                  width: '150px',
                  height: '150px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid #7289da'
                }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <h2 style={{
                color: '#ffffff',
                fontSize: '28px',
                fontWeight: '700',
                marginBottom: '8px'
              }}>{user.name}</h2>
              <p style={{
                color: '#b9bbbe',
                fontSize: '16px',
                marginBottom: '20px'
              }}>{user.email}</p>
              
              {user.bio && (
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{
                    color: '#ffffff',
                    fontSize: '16px',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>Bio</h3>
                  <p style={{
                    color: '#dcddde',
                    fontSize: '14px',
                    lineHeight: '1.5'
                  }}>{user.bio}</p>
                </div>
              )}

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                marginTop: '20px'
              }}>
                <div style={{
                  background: '#202225',
                  padding: '16px',
                  borderRadius: '6px'
                }}>
                  <div style={{
                    color: '#8e9297',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    marginBottom: '8px'
                  }}>Account Type</div>
                  <div style={{
                    color: '#ffffff',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>{user.accountType}</div>
                </div>
                
                <div style={{
                  background: '#202225',
                  padding: '16px',
                  borderRadius: '6px'
                }}>
                  <div style={{
                    color: '#8e9297',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    marginBottom: '8px'
                  }}>Status</div>
                  <div style={{
                    color: user.online ? '#3ba55d' : '#747f8d',
                    fontSize: '16px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: user.online ? '#3ba55d' : '#747f8d'
                    }}></div>
                    {user.online ? 'Online' : 'Offline'}
                  </div>
                </div>
                
                <div style={{
                  background: '#202225',
                  padding: '16px',
                  borderRadius: '6px'
                }}>
                  <div style={{
                    color: '#8e9297',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    marginBottom: '8px'
                  }}>Joined</div>
                  <div style={{
                    color: '#ffffff',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center'
        }}>
          <button 
            style={{
              background: '#7289da',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#677bc4'}
            onMouseLeave={(e) => e.target.style.background = '#7289da'}
            onClick={() => setShowProfileModal(true)}
          >
            Edit Profile
          </button>
          <button 
            style={{
              background: 'transparent',
              color: '#b9bbbe',
              border: '1px solid #4f545c',
              padding: '12px 24px',
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
            onClick={() => toast.info('This feature is coming soon!')}
          >
            Account Settings
          </button>
        </div>
      </div>

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;