const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { Resend } = require('resend');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const path = require('path');

dotenv.config();

const app = express();
app.use(helmet());
app.set('trust proxy', 1);

// CORS configuration
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return cors(corsOptions)(req, res, next);
  }
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api', limiter);

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!mongoUri) {
  console.error('❌ MongoDB connection string is missing (MONGODB_URI)');
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer configuration for file uploads
const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, uuidv4() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// ========== MODELS ==========

// User Model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, select: false },
  googleId: { type: String, unique: true, sparse: true },
  profilePhoto: { type: String, default: '' },
  bio: { type: String, default: '' },
  online: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  accountType: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
  isVerified: { type: Boolean, default: true }, // Auto-verify for simple auth
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

userSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

const User = mongoose.model('User', userSchema);

// Message Model
const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: { type: String, required: true },
  type: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
  mediaUrl: { type: String },
  read: { type: Boolean, default: false },
  readAt: { type: Date },
  roomId: { type: String, required: true },
  deleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// Chat Room Model
const roomSchema = new mongoose.Schema({
  name: { type: String },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  isGroup: { type: Boolean, default: false },
  groupPhoto: { type: String },
  groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Room = mongoose.model('Room', roomSchema);

// Ensure indexes
(async () => {
  try {
    const indexes = await User.collection.indexes();
    const googleIndex = indexes.find((i) => i.name === 'googleId_1');
    if (googleIndex && !googleIndex.sparse) {
      await User.collection.dropIndex('googleId_1');
    }
    await User.collection.createIndex({ googleId: 1 }, { unique: true, sparse: true });
  } catch (err) {
    console.warn('Index sync warning:', err.message);
  }
})();

// ========== AUTHENTICATION MIDDLEWARE ==========
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};

// ========== SIMPLE AUTH ROUTES (NO OTP) ==========

// 1. Simple Registration (No OTP)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log('📝 Simple registration request for:', email);

    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide name, email, and password' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters' 
      });
    }

    // Check uniqueness
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    const existingName = await User.findOne({ name });
    if (existingName) {
      return res.status(400).json({
        success: false,
        message: 'Display name is already taken, please choose another'
      });
    }

    // Hash password and create user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isVerified: true
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    console.log('✅ User registered successfully:', user.email);

    res.status(201).json({
      success: true,
      message: 'Registration successful! You can now login.',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 2. Login with Email/Password
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Update user status
    user.online = true;
    user.lastSeen = new Date();
    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
});

// 3. Get Current User Profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('❌ Profile fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch profile' 
    });
  }
});

// 4. Update Profile
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { name, bio } = req.body;
    
    const updates = {};
    if (name) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    
    const user = await User.findByIdAndUpdate(
      req.user._id, 
      updates, 
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('❌ Profile update error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update profile' 
    });
  }
});

// 5. Upload Profile Photo
app.post('/api/auth/profile/photo', authenticateToken, upload.single('profilePhoto'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'chat-app-profiles',
      width: 500,
      height: 500,
      crop: 'limit'
    });

    if (req.user.profilePhoto) {
      const publicId = req.user.profilePhoto.split('/').pop().split('.')[0];
      try {
        await cloudinary.uploader.destroy(`chat-app-profiles/${publicId}`);
      } catch (cloudinaryError) {
        console.error('Error deleting old photo:', cloudinaryError);
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePhoto: result.secure_url },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile photo updated successfully',
      user,
      photoUrl: result.secure_url
    });
  } catch (error) {
    console.error('❌ Profile photo upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to upload profile photo' 
    });
  }
});

// 6. Change Password
app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'New password must be at least 6 characters' 
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('❌ Change password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to change password' 
    });
  }
});

// 7. Logout
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      online: false,
      lastSeen: new Date()
    });

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Logout failed' 
    });
  }
});

// ========== CHAT ROUTES ==========

// 1. Get or Create Direct Chat Room
app.post('/api/chat/room', authenticateToken, async (req, res) => {
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
    console.error('❌ Create room error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create chat room' 
    });
  }
});

// 2. Get User's Chat Rooms
app.get('/api/chat/rooms', authenticateToken, async (req, res) => {
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
    console.error('❌ Get rooms error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch chat rooms' 
    });
  }
});

// 2a. Delete a Chat Room
app.delete('/api/chat/room/:roomId', authenticateToken, async (req, res) => {
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
    console.error('❌ Delete room error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete chat' });
  }
});

// 3. Get Messages for a Room
app.get('/api/chat/messages/:roomId', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;

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

    const messages = await Message.find({
      roomId,
      deleted: false
    })
      .populate('sender', 'name profilePhoto')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: 1 });

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
    console.error('❌ Get messages error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch messages' 
    });
  }
});

// 4. Search Users
app.get('/api/users/search', authenticateToken, async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.json({ success: true, users: [] });
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: req.user._id } },
        {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    })
      .select('name email profilePhoto online lastSeen bio')
      .limit(20);

    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('❌ Search users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to search users' 
    });
  }
});

// ========== WEBSOCKET SETUP ==========
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"]
  }
});

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return next(new Error('User not found'));
    }

    socket.userId = user._id;
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.userId);
  
  onlineUsers.set(socket.userId.toString(), socket.id);
  
  User.findByIdAndUpdate(socket.userId, {
    online: true,
    lastSeen: new Date()
  }).exec();

  socket.broadcast.emit('user-online', { userId: socket.userId });

  socket.join(`user:${socket.userId}`);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.userId} joined room: ${roomId}`);
  });

  socket.on('send-message', async (data) => {
    try {
      const { roomId, content, type = 'text', mediaUrl } = data;
      
      const message = await Message.create({
        sender: socket.userId,
        content,
        type,
        mediaUrl,
        roomId
      });

      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'name profilePhoto');

      await Room.findByIdAndUpdate(roomId, {
        lastMessage: message._id,
        updatedAt: new Date()
      });

      io.to(roomId).emit('receive-message', populatedMessage);
      
      socket.emit('message-sent', populatedMessage);

      const room = await Room.findById(roomId);
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
      console.error('❌ Send message error:', error);
      socket.emit('message-error', { error: 'Failed to send message' });
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

  socket.on('mark-read', async (data) => {
    try {
      const { messageId } = data;
      
      await Message.findByIdAndUpdate(messageId, {
        read: true,
        readAt: new Date()
      });

      const message = await Message.findById(messageId);
      io.to(message.roomId).emit('message-read', {
        messageId,
        userId: socket.userId,
        readAt: new Date()
      });
    } catch (error) {
      console.error('❌ Mark read error:', error);
    }
  });

  socket.on('disconnect', async () => {
    console.log('❌ User disconnected:', socket.userId);
    
    onlineUsers.delete(socket.userId.toString());
    
    await User.findByIdAndUpdate(socket.userId, {
      online: false,
      lastSeen: new Date()
    });

    socket.broadcast.emit('user-offline', { userId: socket.userId });
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    auth: 'simple-no-otp'
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Simple auth system active (no OTP)`);
});
