import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from './SocketContext';
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
  
  const [callStatus, setCallStatus] = useState('idle'); // idle, calling, incoming, connected, rejected
  const [callType, setCallType] = useState(null); // audio, video
  const [remoteUser, setRemoteUser] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  
  const pc = useRef(null);
  const pendingCandidates = useRef([]);

  const endCall = useCallback((notify = true) => {
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
  }, [localStream, remoteUser, socket]);

  const setupWebRTC = async (remoteUserId) => {
    // Create connection if it doesn't exist
    if (!pc.current) {
      pc.current = new RTCPeerConnection(servers);
    }
    
    const peer = pc.current;

    // Monitor connection state
    peer.oniceconnectionstatechange = () => {
      console.log("ICE Connection State:", peer.iceConnectionState);
      if (peer.iceConnectionState === 'disconnected' || 
          peer.iceConnectionState === 'failed' || 
          peer.iceConnectionState === 'closed') {
        endCall(false);
      }
    };

    // Add local tracks to peer connection
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === 'video' || (pc.current && pc.current.localDescription && pc.current.localDescription.type === 'offer' && callType === 'video')
      });
      setLocalStream(stream);
      stream.getTracks().forEach(track => peer.addTrack(track, stream));
    } catch (err) {
      console.error("Error accessing media devices:", err);
      toast.error("Could not access camera/microphone");
      throw err;
    }

    // Handle remote tracks
    peer.ontrack = (event) => {
      console.log("Received remote stream");
      setRemoteStream(event.streams[0]);
    };

    // Handle ICE candidates
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          to: remoteUserId,
          candidate: event.candidate
        });
      }
    };

    return peer;
  };

  const initiateCall = async (targetUser, type) => {
    try {
      setCallType(type);
      setRemoteUser(targetUser);
      setCallStatus('calling');

      const peer = await setupWebRTC(targetUser._id);
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
      const peer = await setupWebRTC(remoteUser._id);
      
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

    socket.on('call-ended', (data) => {
      const { reason } = data;
      if (reason === 'disconnected') {
        toast.info('Other party disconnected');
      } else {
        toast.info('Call ended');
      }
      endCall(false);
    });

    socket.on('call-rejected', (data) => {
      const { reason } = data;
      if (reason === 'busy') {
        toast.error('User is busy on another call');
      } else {
        toast.error('Call rejected');
      }
      endCall(false);
    });

    socket.on('call-error', (data) => {
      toast.error(data.error || 'Call error');
      endCall(false);
    });

    return () => {
      socket.off('incoming-call');
      socket.off('call-answered');
      socket.off('ice-candidate');
      socket.off('call-ended');
      socket.off('call-rejected');
    };
  }, [socket, endCall]);

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
