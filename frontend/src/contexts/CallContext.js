import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const CallContext = createContext({});

export const useCall = () => useContext(CallContext);

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

export const CallProvider = ({ children }) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  
  const [callStatus, setCallStatus] = useState('idle'); // idle, calling, incoming, connected, rejected
  const [callType, setCallType] = useState(null); // audio, video
  const [remoteUser, setRemoteUser] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  
  const pc = useRef(null);
  const pendingCandidates = useRef([]);

  const endCall = (notify = true) => {
    if (pc.current) {
      pc.current.close();
      pc.current = null;
    }
    
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    if (notify && remoteUser && socket) {
      socket.emit('end-call', { to: remoteUser._id });
    }
    
    setCallStatus('idle');
    setCallType(null);
    setRemoteUser(null);
    setLocalStream(null);
    setRemoteStream(null);
    setIsMuted(false);
    setIsCameraOff(false);
    pendingCandidates.current = [];
  };

  const setupWebRTC = async (isCaller, remoteUserId) => {
    pc.current = new RTCPeerConnection(servers);
    
    // Add local tracks to peer connection
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: callType === 'video'
    });
    setLocalStream(stream);
    stream.getTracks().forEach(track => pc.current.addTrack(track, stream));

    // Handle remote tracks
    pc.current.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    // Handle ICE candidates
    pc.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          to: remoteUserId,
          candidate: event.candidate
        });
      }
    };

    return pc.current;
  };

  const initiateCall = async (targetUser, type) => {
    try {
      setCallType(type);
      setRemoteUser(targetUser);
      setCallStatus('calling');

      const peer = await setupWebRTC(true, targetUser._id);
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      socket.emit('call-user', {
        to: targetUser._id,
        offer,
        type
      });
    } catch (error) {
      console.error('Failed to initiate call:', error);
      toast.error('Could not access camera/microphone');
      endCall(false);
    }
  };

  const answerCall = async () => {
    try {
      const peer = await setupWebRTC(false, remoteUser._id);
      
      // Process any pending candidates
      if (pendingCandidates.current.length > 0) {
        pendingCandidates.current.forEach(async (candidate) => {
          await peer.addIceCandidate(new RTCIceCandidate(candidate));
        });
        pendingCandidates.current = [];
      }

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socket.emit('answer-call', {
        to: remoteUser._id,
        answer
      });
      
      setCallStatus('connected');
    } catch (error) {
      console.error('Failed to answer call:', error);
      toast.error('Could not answer call');
      endCall();
    }
  };

  const rejectCall = () => {
    if (remoteUser && socket) {
      socket.emit('reject-call', { to: remoteUser._id });
    }
    endCall(false);
  };

  useEffect(() => {
    if (!socket) return;

    socket.on('incoming-call', async (data) => {
      const { from, callerName, callerPhoto, offer, type } = data;
      setRemoteUser({ _id: from, name: callerName, profilePhoto: callerPhoto });
      setCallType(type);
      setCallStatus('incoming');
      
      // Store offer for later when answering
      pc.current = new RTCPeerConnection(servers);
      await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
    });

    socket.on('call-answered', async (data) => {
      const { answer } = data;
      if (pc.current) {
        await pc.current.setRemoteDescription(new RTCSessionDescription(answer));
        setCallStatus('connected');
      }
    });

    socket.on('ice-candidate', async (data) => {
      const { candidate } = data;
      if (pc.current && pc.current.remoteDescription) {
        await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        pendingCandidates.current.push(candidate);
      }
    });

    socket.on('call-ended', () => {
      toast.info('Call ended');
      endCall(false);
    });

    socket.on('call-rejected', () => {
      toast.error('Call rejected');
      endCall(false);
    });

    return () => {
      socket.off('incoming-call');
      socket.off('call-answered');
      socket.off('ice-candidate');
      socket.off('call-ended');
      socket.off('call-rejected');
    };
  }, [socket]);

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsCameraOff(!isCameraOff);
    }
  };

  return (
    <CallContext.Provider value={{
      callStatus,
      callType,
      remoteUser,
      localStream,
      remoteStream,
      isMuted,
      isCameraOff,
      initiateCall,
      answerCall,
      rejectCall,
      endCall,
      toggleMute,
      toggleCamera
    }}>
      {children}
    </CallContext.Provider>
  );
};
