import React, { useEffect, useRef } from 'react';
import { useCall } from '../../contexts/CallContext';
import { FaPhone, FaVideo, FaPhoneSlash, FaMicrophone, FaMicrophoneSlash, FaVideoSlash, FaTimes } from 'react-icons/fa';
import '../../styles/CallOverlay.css';

const CallOverlay = () => {
  const {
    callStatus,
    callType,
    remoteUser,
    localStream,
    remoteStream,
    isMuted,
    isCameraOff,
    answerCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleCamera
  } = useCall();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (callStatus === 'idle') return null;

  return (
    <div className={`call-overlay ${callStatus}`}>
      <div className="call-container">
        {/* Remote Video / User Info */}
        <div className="remote-view">
          {callStatus === 'connected' && callType === 'video' ? (
            <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />
          ) : (
            <div className="remote-info">
              <img
                src={remoteUser?.profilePhoto || `https://ui-avatars.com/api/?name=${remoteUser?.name}&background=7289da&color=fff`}
                alt={remoteUser?.name}
                className="call-avatar"
              />
              <h3>{remoteUser?.name}</h3>
              <p>{callStatus === 'incoming' ? 'Incoming Call...' : callStatus === 'calling' ? 'Ringing...' : 'Connected'}</p>
            </div>
          )}
        </div>

        {/* Local Video (PiP) */}
        {callType === 'video' && localStream && (
          <div className="local-view">
            <video ref={localVideoRef} autoPlay playsInline muted className="local-video" />
          </div>
        )}

        {/* Controls */}
        <div className="call-controls">
          {callStatus === 'incoming' ? (
            <div className="incoming-actions">
              <button className="action-btn accept" onClick={answerCall}>
                {callType === 'video' ? <FaVideo /> : <FaPhone />}
              </button>
              <button className="action-btn reject" onClick={rejectCall}>
                <FaPhoneSlash />
              </button>
            </div>
          ) : (
            <div className="active-actions">
              <button className={`action-btn ${isMuted ? 'muted' : ''}`} onClick={toggleMute}>
                {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
              </button>
              
              {callType === 'video' && (
                <button className={`action-btn ${isCameraOff ? 'off' : ''}`} onClick={toggleCamera}>
                  {isCameraOff ? <FaVideoSlash /> : <FaVideo />}
                </button>
              )}
              
              <button className="action-btn end" onClick={() => endCall()}>
                <FaPhoneSlash />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallOverlay;
