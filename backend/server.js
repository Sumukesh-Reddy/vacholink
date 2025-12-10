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

const signupOtps = new Map();

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

// Resend Email Client
const createResendClient = () => {
  console.log('📧 Creating Resend client...');
  
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is not set in environment variables');
    return null;
  }
  
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    console.log('✅ Resend client created successfully');
    return resend;
  } catch (error) {
    console.error('❌ Failed to create Resend client:', error.message);
    return null;
  }
};

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

// ========== AUTH ROUTES ==========

// Utility: generate 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// 0. Send OTP for Signup - DISABLED
app.post('/api/auth/send-otp', async (req, res) => {
  return res.status(410).json({ success: false, message: 'OTP verification has been disabled' });
});

// OTP endpoint code commented out - using direct registration instead
app.post('/api/auth/send-otp-disabled', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log('🔐 Send OTP request received for:', email);
    console.log('📧 Environment check:', {
      NODE_ENV: process.env.NODE_ENV || 'development',
      RESEND_API_KEY_SET: !!process.env.RESEND_API_KEY
    });

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

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = generateOtp();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP in memory
    signupOtps.set(email, { name, hashedPassword, otp, expiresAt });
    
    console.log('📦 Generated OTP for', email, ':', otp);

    // Send email via Resend
    try {
      const resend = createResendClient();
      
      if (!resend) {
        throw new Error('Resend client not available');
      }

      const senderEmail =  'onboarding@resend.dev' || process.env.RESEND_SENDER;
      
      console.log('📤 Attempting to send email via Resend...');
      
      const { data, error } = await resend.emails.send({
        from: `VachoLink <${senderEmail}>`,
        to: [email],
        subject: 'Your VachoLink Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e8e8e8; border-radius: 12px; background: linear-gradient(135deg, #1a1c22 0%, #0a0a0a 100%); color: #ffffff;">
            <div style="text-align: center; margin-bottom: 40px;">
              <div style="display: inline-flex; align-items: center; justify-content: center; width: 70px; height: 70px; background: linear-gradient(135deg, #43b581 0%, #3ba55d 100%); border-radius: 50%; color: white; font-weight: bold; font-size: 32px; margin-bottom: 20px; box-shadow: 0 0 20px rgba(67, 181, 129, 0.4);">
                ꍡ
              </div>
              <h2 style="color: #ffffff; font-size: 28px; font-weight: 700; margin-bottom: 10px;">Verify Your Email</h2>
              <p style="color: #b9bbbe; font-size: 16px;">Welcome to VachoLink! Use the code below to complete your signup.</p>
            </div>
            
            <div style="background: rgba(32, 34, 37, 0.8); padding: 30px; text-align: center; border-radius: 10px; margin: 40px 0; border: 1px solid rgba(67, 181, 129, 0.3); backdrop-filter: blur(10px);">
              <p style="color: #8e9297; margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">VERIFICATION CODE</p>
              <div style="font-size: 48px; font-weight: bold; letter-spacing: 15px; color: #43b581; font-family: 'Courier New', monospace; padding: 20px; background: rgba(0,0,0,0.3); border-radius: 8px; display: inline-block; text-shadow: 0 0 10px rgba(67, 181, 129, 0.5);">
                ${otp}
              </div>
              <p style="color: #8e9297; margin-top: 20px; font-size: 13px;">This code expires in 10 minutes</p>
            </div>
            
            <div style="color: #8e9297; font-size: 14px; text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid rgba(32, 34, 37, 0.8);">
              <p>If you didn't request this, please ignore this email.</p>
              <p style="margin-top: 30px; font-size: 12px; color: #4f545c;">© ${new Date().getFullYear()} VachoLink. All rights reserved.</p>
            </div>
          </div>
        `,
        text: `Your VachoLink verification code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, please ignore this email.`
      });

      if (error) {
        console.error('❌ Resend API error:', error);
        throw new Error(`Resend failed: ${error.message}`);
      }

      console.log('✅ Email sent successfully via Resend! Email ID:', data?.id);
      
      // Success - don't return OTP in production
      res.json({
        success: true,
        message: 'Verification code sent to your email',
        otp: process.env.NODE_ENV === 'production' ? undefined : otp
      });

    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError.message);
      
      // Fallback: Return OTP anyway for user to manually enter
      console.log('⚠️ Email service failed, returning OTP for manual entry:', otp);
      
      res.json({
        success: true,
        message: 'Check your email for verification code. If not received, use this code:',
        otp: otp,
        emailFailed: true
      });
    }

  } catch (error) {
    console.error('❌ Send OTP error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process OTP request',
      debug: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// 0b. Verify OTP and complete signup - DISABLED
app.post('/api/auth/verify-otp', async (req, res) => {
  return res.status(410).json({ success: false, message: 'OTP verification has been disabled' });
});

// OTP verification code commented out - using direct registration instead
app.post('/api/auth/verify-otp-disabled', async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log('🔍 Verify OTP request:', { email, otpLength: otp?.length });

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const pending = signupOtps.get(email);
    if (!pending) {
      return res.status(400).json({ success: false, message: 'No pending signup for this email' });
    }

    console.log('📦 Found pending signup for:', email);

    if (pending.expiresAt < Date.now()) {
      signupOtps.delete(email);
      console.log('❌ OTP expired for:', email);
      return res.status(400).json({ success: false, message: 'OTP expired, please request a new one' });
    }

    if (pending.otp !== otp) {
      console.log('❌ Invalid OTP for:', email);
      console.log('Expected:', pending.otp, 'Got:', otp);
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // Final uniqueness check
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

    console.log('✅ OTP verified for:', email);
    console.log('👤 Creating user:', pending.name);

    // Create user
    const user = await User.create({
      name: pending.name,
      email,
      password: pending.hashedPassword,
      isVerified: true
    });

    // Clean up
    signupOtps.delete(email);

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    console.log('🎉 User created successfully:', user.email);

    res.status(201).json({
      success: true,
      message: 'Signup verified and completed',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('❌ Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify OTP' });
  }
});

// 1. Register with Email/Password (legacy endpoint)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log('📝 Legacy register endpoint called for:', email);

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

    const existingUser = await User.findOne({ email });
    if (existingUser) {
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

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isVerified: true
    });

    const token = jwt.sign(
      { userId: user._id, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

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

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    user.online = true;
    user.lastSeen = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

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
    console.error('Change password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to change password' 
    });
  }
});

// 7. Forgot Password - DISABLED
app.post('/api/auth/forgot-password', async (req, res) => {
  return res.status(410).json({ success: false, message: 'Password reset has been disabled' });
});

// Forgot password code commented out
app.post('/api/auth/forgot-password-disabled', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const resetToken = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    user.resetToken = resetToken;
    user.resetTokenExpires = Date.now() + 3600000;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    
    console.log('📧 Password reset requested for:', email);

    // Send email via Resend
    try {
      const resend = createResendClient();
      
      if (resend) {
        const senderEmail =  'onboarding@resend.dev' || process.env.RESEND_SENDER;
        
        await resend.emails.send({
          from: `VachoLink <${senderEmail}>`,
          to: [email],
          subject: 'Password Reset Request - VachoLink',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e8e8e8; border-radius: 12px; background: linear-gradient(135deg, #1a1c22 0%, #0a0a0a 100%); color: #ffffff;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #ffffff; font-size: 24px; font-weight: 700; margin-bottom: 10px;">Password Reset</h2>
                <p style="color: #b9bbbe;">You requested to reset your password. Click the button below:</p>
              </div>
              
              <div style="text-align: center; margin: 40px 0;">
                <a href="${resetUrl}" style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #43b581 0%, #3ba55d 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(67, 181, 129, 0.3);">
                  Reset Password
                </a>
              </div>
              
              <div style="color: #8e9297; font-size: 14px; text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(32, 34, 37, 0.8);">
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
                <p style="margin-top: 30px; font-size: 12px; color: #4f545c;">© ${new Date().getFullYear()} VachoLink. All rights reserved.</p>
              </div>
            </div>
          `,
          text: `You requested to reset your password. Click this link: ${resetUrl}\n\nThis link expires in 1 hour.`
        });
        
        console.log('✅ Password reset email sent via Resend');
      }
    } catch (emailError) {
      console.error('❌ Failed to send password reset email:', emailError.message);
    }

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

// 8. Reset Password - DISABLED
app.post('/api/auth/reset-password', async (req, res) => {
  return res.status(410).json({ success: false, message: 'Password reset has been disabled' });
});

// Reset password code commented out
app.post('/api/auth/reset-password-disabled', async (req, res) => {
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

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    console.log('✅ Password reset for user:', user.email);

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
    console.error('Delete room error:', error);
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
  console.log('User connected:', socket.userId);
  
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
      console.error('Send message error:', error);
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
      console.error('Mark read error:', error);
    }
  });

  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.userId);
    
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
    environment: process.env.NODE_ENV || 'development'
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Allowed origins: ${allowedOrigins.join(', ') || 'None'}`);
});