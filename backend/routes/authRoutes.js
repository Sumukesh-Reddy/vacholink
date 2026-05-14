const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const authenticateToken = require('../middleware/authMiddleware');
const { uploadProfile } = require('../middleware/upload');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');
const { Resend } = require('resend');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const resend = new Resend(process.env.RESEND_API_KEY);
const signupOtps = new Map();

// Utility: generate 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Google Auth
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ success: false, message: 'Google credential is required' });

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const { sub: googleId, email, name, picture } = ticket.getPayload();
    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    let isNewUser = false;

    if (!user) {
      const displayName = name || email.split('@')[0];
      let uniqueName = displayName;
      let counter = 1;
      while (await User.findOne({ name: uniqueName })) {
        uniqueName = `${displayName}${counter++}`;
      }

      user = new User({
        googleId,
        email,
        name: uniqueName,
        profilePhoto: picture || '',
        isVerified: true,
        isGoogleUser: true,
        needsPasswordChange: true,
        needsProfileCompletion: true
      });
      await user.save();
      isNewUser = true;
    } else {
      user.online = true;
      user.lastSeen = new Date();
      if (!user.googleId) user.googleId = googleId;
      await user.save();
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const userResponse = await User.findById(user._id).select('-password');

    res.json({
      success: true,
      token,
      user: userResponse,
      isNewUser,
      needsProfileCompletion: userResponse.needsProfileCompletion
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ success: false, message: 'Google authentication failed' });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Missing required fields' });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password: hashedPassword, isVerified: true });
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({ success: true, message: 'Registration successful', token, user: userResponse });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    user.online = true;
    user.lastSeen = new Date();
    await user.save();

    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ success: true, message: 'Login successful', token, user: userResponse });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// Complete Profile
router.post('/complete-profile', authenticateToken, async (req, res) => {
  try {
    const { name, password } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const updates = { needsProfileCompletion: false, updatedAt: new Date() };
    if (name) updates.name = name;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
      updates.needsPasswordChange = false;
    }

    const updatedUser = await User.findByIdAndUpdate(user._id, updates, { new: true }).select('-password');
    res.json({ success: true, message: 'Profile completed', user: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to complete profile' });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const resetOtp = generateOtp();
    user.resetToken = resetOtp;
    user.resetTokenExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    await resend.emails.send({
      from: 'VachoLink <onboarding@resend.dev>',
      to: email,
      subject: 'VachoLink - Password Reset OTP',
      html: `<div style="font-family: Arial; padding: 20px;"><h2>Reset OTP: ${resetOtp}</h2></div>`
    });

    res.json({ success: true, message: 'Reset OTP sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to process request' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email, resetToken: otp, resetTokenExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to reset password' });
  }
});

// Profile Photo Upload
router.post('/profile/photo', authenticateToken, uploadProfile.single('profilePhoto'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const result = await uploadToCloudinary(req.file.path, 'chat-app-profiles');

    if (req.user.profilePhoto && req.user.profilePhoto.includes('cloudinary')) {
      const publicId = req.user.profilePhoto.split('/').pop().split('.')[0];
      await deleteFromCloudinary(`chat-app-profiles/${publicId}`);
    }

    const user = await User.findByIdAndUpdate(req.user._id, { profilePhoto: result.secure_url }, { new: true }).select('-password');
    res.json({ success: true, message: 'Profile photo updated', user, photoUrl: result.secure_url });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to upload photo' });
  }
});

// Logout
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { online: false, lastSeen: new Date() });
    res.json({ success: true, message: 'Logged out' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Logout failed' });
  }
});

// Get Profile
router.get('/profile', authenticateToken, async (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;