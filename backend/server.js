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
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const path = require('path');

dotenv.config();


const signupOtps = new Map();

const app = express();
app.use(helmet());

// Robust CORS: allow comma-separated CLIENT_URL values
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // non-browser clients
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
// Handle preflight without path-to-regexp wildcards (Express 5)
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
  .then(() => console.log(' MongoDB connected'))
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
    fileSize: 5 * 1024 * 1024 // 5MB limit
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
  isVerified: { type: Boolean, default: false },
  resetToken: String,
  resetTokenExpires: Date,
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

// Ensure indexes are correct (handle existing non-sparse googleId index)
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

// ========== AUTH ROUTES ==========

// Utility: generate 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// 0. Send OTP for Signup
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // Check uniqueness
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const existingName = await User.findOne({ name });
    if (existingName) {
      return res.status(400).json({ success: false, message: 'Display name is already taken, please choose another' });
    }

    // Hash password now so we don't store plain text
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = generateOtp();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    signupOtps.set(email, { name, hashedPassword, otp, expiresAt });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your VachoLink signup verification code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify your email</h2>
          <p>Use the code below to complete your signup. It expires in 10 minutes.</p>
          <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px; margin: 20px 0;">
            ${otp}
          </div>
          <p>If you didn't request this, you can ignore this email.</p>
        </div>
      `
    });

    res.json({
      success: true,
      message: 'OTP sent to email',
      otp: process.env.NODE_ENV === 'production' ? undefined : otp 
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
});

// 0b. Verify OTP and complete signup
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const pending = signupOtps.get(email);
    if (!pending) {
      return res.status(400).json({ success: false, message: 'No pending signup for this email' });
    }

    if (pending.expiresAt < Date.now()) {
      signupOtps.delete(email);
      return res.status(400).json({ success: false, message: 'OTP expired, please request a new one' });
    }

    if (pending.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // Final uniqueness check in case state changed
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      signupOtps.delete(email);
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }
    const existingName = await User.findOne({ name: pending.name });
    if (existingName) {
      signupOtps.delete(email);
      return res.status(400).json({ success: false, message: 'Display name is already taken, please choose another' });
    }

    const user = await User.create({
      name: pending.name,
      email,
      password: pending.hashedPassword,
      isVerified: true
    });

    signupOtps.delete(email);

    const token = jwt.sign(
      { userId: user._id, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'Signup verified and completed',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify OTP' });
  }
});

// 1. Register with Email/Password
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
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

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    // Check if name taken
    const existingName = await User.findOne({ name });
    if (existingName) {
      return res.status(400).json({
        success: false,
        message: 'Display name is already taken, please choose another'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isVerified: true
    });

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
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

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Update online status
    user.online = true;
    user.lastSeen = new Date();
    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
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
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update profile' 
    });
  }
});

// 5. Upload Profile Photo (without multer-storage-cloudinary)
app.post('/api/auth/profile/photo', authenticateToken, upload.single('profilePhoto'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'chat-app-profiles',
      width: 500,
      height: 500,
      crop: 'limit'
    });

    // Delete old profile photo from Cloudinary if exists
    if (req.user.profilePhoto) {
      const publicId = req.user.profilePhoto.split('/').pop().split('.')[0];
      try {
        await cloudinary.uploader.destroy(`chat-app-profiles/${publicId}`);
      } catch (cloudinaryError) {
        console.error('Error deleting old photo:', cloudinaryError);
      }
    }

    // Update user with new photo URL
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
    console.error('Profile photo upload error:', error);
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

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to change password' 
    });
  }
});

// 7. Forgot Password
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    // Save reset token to user
    user.resetToken = resetToken;
    user.resetTokenExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request - Chat App',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password. Click the link below to reset it:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
    });

    res.json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process request' 
    });
  }
});

// 8. Reset Password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findOne({
      _id: decoded.userId,
      resetToken: token,
      resetTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reset password' 
    });
  }
});

// 9. Logout
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  try {
    // Update user status to offline
    await User.findByIdAndUpdate(req.user._id, {
      online: false,
      lastSeen: new Date()
    });

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
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

    // Check if participant exists
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({ 
        success: false, 
        message: 'Participant not found' 
      });
    }

    // Check if room already exists between these two users
    let room = await Room.findOne({
      isGroup: false,
      participants: { 
        $all: [req.user._id, participantId],
        $size: 2 
      }
    }).populate('participants', 'name email profilePhoto online lastSeen');

    // If room doesn't exist, create it
    if (!room) {
      room = await Room.create({
        participants: [req.user._id, participantId],
        isGroup: false
      });
      
      // Populate participants
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
    console.error('Get rooms error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch chat rooms' 
    });
  }
});

// 2a. Delete a Chat Room (and its messages)
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
    console.error('Delete room error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete chat' });
  }
});

// 3. Get Messages for a Room
app.get('/api/chat/messages/:roomId', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Check if user is participant of this room
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

    // Mark messages as read
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
    console.error('Search users error:', error);
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

// Socket.IO authentication middleware
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

// Online users map
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.userId);
  
  // Add user to online users
  onlineUsers.set(socket.userId.toString(), socket.id);
  
  // Update user status in database
  User.findByIdAndUpdate(socket.userId, {
    online: true,
    lastSeen: new Date()
  }).exec();

  // Notify others about user coming online
  socket.broadcast.emit('user-online', { userId: socket.userId });

  // Join user to their personal room
  socket.join(`user:${socket.userId}`);

  // Join chat rooms
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.userId} joined room: ${roomId}`);
  });

  // Handle sending messages
  socket.on('send-message', async (data) => {
    try {
      const { roomId, content, type = 'text', mediaUrl } = data;
      
      // Create message in database
      const message = await Message.create({
        sender: socket.userId,
        content,
        type,
        mediaUrl,
        roomId
      });

      // Populate sender info
      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'name profilePhoto');

      // Update room's last message
      await Room.findByIdAndUpdate(roomId, {
        lastMessage: message._id,
        updatedAt: new Date()
      });

      // Emit message to room
      io.to(roomId).emit('receive-message', populatedMessage);
      
      // Also send to sender for confirmation
      socket.emit('message-sent', populatedMessage);

      // Notify other participants
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
      console.error('Send message error:', error);
      socket.emit('message-error', { error: 'Failed to send message' });
    }
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    const { roomId, isTyping } = data;
    socket.to(roomId).emit('user-typing', {
      userId: socket.userId,
      userName: socket.user.name,
      isTyping
    });
  });

  // Handle read receipts
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
      console.error('Mark read error:', error);
    }
  });

  // Handle disconnect
  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.userId);
    
    // Remove from online users
    onlineUsers.delete(socket.userId.toString());
    
    // Update user status in database
    await User.findByIdAndUpdate(socket.userId, {
      online: false,
      lastSeen: new Date()
    });

    // Notify others about user going offline
    socket.broadcast.emit('user-offline', { userId: socket.userId });
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running', 
    timestamp: new Date().toISOString() 
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🌐 Client URL: ${process.env.CLIENT_URL}`);
});