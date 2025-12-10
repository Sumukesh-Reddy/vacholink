import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
const API_URL =   process.env.REACT_APP_API_URL || "http://localhost:3001" ;

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/auth/forgot-password`, {
        email
      });

      if (response.data.success) {
        setEmailSent(true);
        toast.success('Password reset email sent!');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      backgroundImage: 'radial-gradient(white, rgba(255,255,255,.2) 2px, transparent 40px), radial-gradient(white, rgba(255,255,255,.15) 1px, transparent 30px), radial-gradient(white, rgba(255,255,255,.1) 2px, transparent 40px)',
      backgroundSize: '550px 550px, 350px 350px, 250px 250px',
      backgroundPosition: '0 0, 40px 60px, 130px 270px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#2f3136',
        borderRadius: '8px',
        padding: '40px',
        width: '100%',
        maxWidth: '480px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        border: '1px solid #202225',
        position: 'relative',
        overflow: 'hidden'
      }}>
        
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)',
          pointerEvents: 'none',
          animation: 'twinkle 3s infinite alternate'
        }}></div>
        
        <h2 style={{
          color: '#ffffff',
          fontSize: '28px',
          fontWeight: '700',
          textAlign: 'center',
          marginBottom: '10px',
          fontFamily: "'Ginto', 'Whitney', 'Helvetica Neue', Helvetica, Arial, sans-serif"
        }}>Reset Password</h2>
        
        <p style={{
          textAlign: 'center',
          color: '#b9bbbe',
          marginBottom: '30px',
          fontSize: '14px'
        }}>
          {emailSent 
            ? 'Check your email for reset instructions'
            : 'Enter your email to receive a reset link'
          }
        </p>

        {!emailSent ? (
          <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="email" style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#8e9297',
                fontSize: '12px',
                textTransform: 'uppercase'
              }}>EMAIL</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#202225',
                  border: '1px solid #202225',
                  borderRadius: '4px',
                  color: '#dcddde',
                  fontSize: '16px',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#7289da'}
                onBlur={(e) => e.target.style.borderColor = '#202225'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                background: loading ? '#677bc4' : '#7289da',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                fontFamily: "'Whitney', 'Helvetica Neue', Helvetica, Arial, sans-serif"
              }}
              onMouseEnter={(e) => !loading && (e.target.style.background = '#677bc4')}
              onMouseLeave={(e) => !loading && (e.target.style.background = '#7289da')}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <div style={{
            background: '#2f3136',
            border: '1px solid #202225',
            borderRadius: '4px',
            padding: '20px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <p style={{ color: '#ffffff', marginBottom: '10px' }}>
              We've sent password reset instructions to your email.
            </p>
            <p style={{ color: '#b9bbbe', fontSize: '14px' }}>
              Check your inbox and follow the link to reset your password.
            </p>
          </div>
        )}

        <div style={{ textAlign: 'center', paddingTop: '20px', borderTop: '1px solid #202225' }}>
          <p style={{ color: '#8e9297', fontSize: '14px' }}>
            Remember your password?{' '}
            <Link to="/login" style={{
              color: '#7289da',
              textDecoration: 'none',
              fontWeight: '600'
            }}>
              Back to Login
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;