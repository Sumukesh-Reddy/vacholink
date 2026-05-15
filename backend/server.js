const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const helmet = require('helmet');
const path = require('path');
const jwt = require('jsonwebtoken');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const userRoutes = require('./routes/userRoutes');

// Model Imports
const User = require('./models/User');
const Message = require('./models/Message');
const Room = require('./models/Room');

dotenv.config();

const app = express();
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.set('trust proxy', 1);

// CORS configuration
const defaultAllowedOrigins = [
  'https://vacholink.vercel.app',
  'http://localhost:3000'
];

const allowedOrigins = Array.from(new Set([
  ...defaultAllowedOrigins,
  ...(process.env.CLIENT_URL || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean)
]));

const corsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads (if needed)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!mongoUri) {
  console.error('❌ MongoDB connection string is missing');
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// ========== WEBSOCKET SETUP ==========
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return next(new Error('User not found'));

    socket.userId = user._id;
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.userId);
  onlineUsers.set(socket.userId.toString(), socket.id);

  User.findByIdAndUpdate(socket.userId, { online: true, lastSeen: new Date() }).exec();
  socket.broadcast.emit('user-online', { userId: socket.userId });
  socket.join(`user:${socket.userId}`);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.userId} joined room: ${roomId}`);
  });

  socket.on('send-message', async (data) => {
    try {
      const { roomId, content, type = 'text', mediaUrl, mediaName, replyTo } = data;
      const room = await Room.findById(roomId);
      if (!room) return socket.emit('message-error', { error: 'Room not found' });

      const message = await Message.create({
        sender: socket.userId,
        content,
        type,
        mediaUrl,
        mediaName,
        roomId,
        replyTo: replyTo || null
      });

      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'name profilePhoto')
        .populate({
          path: 'replyTo',
          populate: { path: 'sender', select: 'name' }
        });

      room.lastMessage = message._id;
      room.updatedAt = new Date();
      await room.save();

      io.to(roomId).emit('receive-message', populatedMessage);
      socket.emit('message-sent', populatedMessage);

      room.participants.forEach(participantId => {
        if (participantId.toString() !== socket.userId.toString()) {
          io.to(`user:${participantId}`).emit('new-message-notification', {
            roomId,
            message: populatedMessage,
            sender: socket.user
          });
        }
      });
    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('message-error', { error: 'Failed to send message' });
    }
  });

  socket.on('edit-message', async (data) => {
    try {
      const { messageId, content } = data;
      const message = await Message.findById(messageId);
      if (!message || message.sender.toString() !== socket.userId.toString()) return;
      
      message.content = content;
      message.editedAt = new Date();
      await message.save();
      
      const updated = await Message.findById(messageId).populate('sender', 'name profilePhoto');
      io.to(message.roomId).emit('message-edited', updated);
    } catch (error) {
      console.error('Edit error:', error);
    }
  });

  socket.on('react-message', async (data) => {
    try {
      const { messageId, emoji } = data;
      const message = await Message.findById(messageId);
      if (!message) return;

      const existingIdx = message.reactions.findIndex(
        r => r.userId.toString() === socket.userId.toString() && r.emoji === emoji
      );
      
      if (existingIdx !== -1) {
        message.reactions.splice(existingIdx, 1);
      } else {
        message.reactions = message.reactions.filter(r => r.userId.toString() !== socket.userId.toString());
        message.reactions.push({ emoji, userId: socket.userId, userName: socket.user.name });
      }
      
      await message.save();
      const updated = await Message.findById(messageId).populate('sender', 'name profilePhoto');
      io.to(message.roomId).emit('message-reacted', updated);
    } catch (error) {
      console.error('React error:', error);
    }
  });

  socket.on('delete-message', async (data) => {
    try {
      const { messageId } = data;
      const message = await Message.findById(messageId);
      if (!message || message.sender.toString() !== socket.userId.toString()) return;

      message.deleted = true;
      message.deletedAt = new Date();
      await message.save();

      io.to(message.roomId).emit('message-deleted', { messageId, roomId: message.roomId });
    } catch (error) {
      console.error('Delete error:', error);
    }
  });

  socket.on('typing', (data) => {
    const { roomId, isTyping } = data;
    socket.to(roomId).emit('user-typing', {
      userId: socket.userId,
      userName: socket.user.name,
      isTyping
    });
  });

  socket.on('disconnect', async () => {
    onlineUsers.delete(socket.userId.toString());
    await User.findByIdAndUpdate(socket.userId, { online: false, lastSeen: new Date() });
    socket.broadcast.emit('user-offline', { userId: socket.userId });
  });
});

// Keep Render Live
const keepRenderLive = () => {
  setInterval(() => {
    const publicUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
    const client = publicUrl.startsWith('https') ? require('https') : http;
    client.get(`${publicUrl}/health`, (res) => {
      res.on('data', () => { });
    }).on('error', (err) => {
      console.error('Keep-alive failed:', err.message);
    });
  }, 5 * 60 * 1000); // Every 5 minutes
};

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  keepRenderLive();
});