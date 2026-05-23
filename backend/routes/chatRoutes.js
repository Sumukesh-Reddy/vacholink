const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const { uploadToMemory } = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');
const Room = require('../models/Room');
const Message = require('../models/Message');
const User = require('../models/User');

// Upload Chat Attachment
router.post('/upload', authenticateToken, uploadToMemory.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    let resourceType = 'auto';
    if (req.file.mimetype.startsWith('video/')) resourceType = 'video';
    else if (req.file.mimetype.startsWith('image/')) resourceType = 'image';
    else if (req.file.mimetype === 'application/pdf') resourceType = 'raw';
    else resourceType = 'raw';

    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'chat_attachments',
          resource_type: resourceType
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      uploadStream.end(req.file.buffer);
    });

    const result = await uploadPromise;

    let type = 'file';
    if (req.file.mimetype.startsWith('image/')) type = 'image';
    else if (req.file.mimetype.startsWith('video/')) type = 'video';

    res.json({
      success: true,
      url: result.secure_url,
      type: type,
      mediaName: req.file.originalname
    });
  } catch (error) {
    console.error('Attachment upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload attachment' });
  }
});

// Get or Create Direct Chat Room
router.post('/room', authenticateToken, async (req, res) => {
  try {
    const { participantId } = req.body;

    if (!participantId) {
      return res.status(400).json({
        success: false,
        message: 'Participant ID is required'
      });
    }

    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }

    let room = await Room.findOne({
      isGroup: false,
      participants: {
        $all: [req.user._id, participantId],
        $size: 2
      }
    }).populate('participants', 'name email profilePhoto online lastSeen');

    if (!room) {
      room = await Room.create({
        participants: [req.user._id, participantId],
        isGroup: false
      });

      room = await Room.findById(room._id)
        .populate('participants', 'name email profilePhoto online lastSeen');
    }

    res.json({
      success: true,
      room
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create chat room'
    });
  }
});

// Get User's Chat Rooms
router.get('/rooms', authenticateToken, async (req, res) => {
  try {
    const rooms = await Room.find({
      participants: req.user._id
    })
      .populate('participants', 'name email profilePhoto online lastSeen')
      .populate('lastMessage')
      .populate('groupAdmin', 'name profilePhoto')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      rooms
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat rooms'
    });
  }
});

// Delete a Chat Room
router.delete('/room/:roomId', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const isParticipant = room.participants.some(p => p.toString() === req.user._id.toString());
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this room' });
    }

    await Message.deleteMany({ roomId });
    await Room.findByIdAndDelete(roomId);

    res.json({ success: true, message: 'Chat deleted' });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete chat' });
  }
});

// Get Messages for a Room
router.get('/messages/:roomId', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 100 } = req.query;

    const room = await Room.findOne({
      _id: roomId,
      participants: req.user._id
    });

    if (!room) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    let messages = await Message.find({
      roomId
    })
      .populate('sender', 'name profilePhoto')
      .populate({
        path: 'replyTo',
        populate: { path: 'sender', select: 'name' }
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Reverse to get chronological order
    messages = messages.reverse();

    await Message.updateMany(
      {
        roomId,
        receiver: req.user._id,
        read: false
      },
      {
        read: true,
        readAt: new Date()
      }
    );

    res.json({
      success: true,
      messages,
      page,
      total: await Message.countDocuments({ roomId, deleted: false })
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
});

module.exports = router;
