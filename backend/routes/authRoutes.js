const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const authenticateToken = require('../middleware/authMiddleware');
const { uploadProfile } = require('../middleware/upload');
const { deleteFromCloudinary } = require('../utils/cloudinary');
const cloudinary = require('../config/cloudinary');
const { Resend } = require('resend');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const resend = new Resend(process.env.RESEND_API_KEY);
const signupOtps = new Map();
const verifiedEmails = new Map();

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

// Send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: 'User already exists' });

    const otp = generateOtp();
    signupOtps.set(email, {
      otp,
      expires: Date.now() + 10 * 60 * 1000 // 10 minutes
    });

    await resend.emails.send({
      from: 'VachoLink <onboarding@sumukesh.app>',
      to: email,
      subject: 'VachoLink - Verify Your Email',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 40px 20px; text-align: center; border-radius: 12px; max-width: 480px; margin: 0 auto; border: 1px solid rgba(114, 137, 218, 0.2); box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <div style="font-size: 48px; color: #7289da; margin-bottom: 20px; line-height: 1;">ꍡ</div>
          <h2 style="margin-top: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">Verify Your Email</h2>
          <p style="color: #b9bbbe; font-size: 15px; line-height: 1.6; margin: 15px 0 25px;">Welcome to VachoLink! Please use the 6-digit One-Time Password (OTP) below to verify your email address. It is valid for 10 minutes.</p>
          <div style="background-color: #202225; color: #7289da; font-size: 32px; font-weight: 700; letter-spacing: 4px; padding: 16px 24px; border-radius: 8px; display: inline-block; margin: 10px 0 30px; border: 1px solid rgba(114, 137, 218, 0.1); box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);">
            ${otp}
          </div>
          <p style="color: #8e9297; font-size: 12px; margin-top: 20px; line-height: 1.5;">If you did not request this verification code, you can safely ignore this email.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(79, 84, 92, 0.3); color: #4f545c; font-size: 11px;">
            © 2026 VachoLink. Secure Communication Platform.
          </div>
        </div>
      `
    });

    const responseData = { success: true, message: 'Verification OTP sent to your email' };
    if (process.env.NODE_ENV !== 'production') {
      responseData.otp = otp;
    }
    res.json(responseData);
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP are required' });

    const record = signupOtps.get(email);
    if (!record) return res.status(400).json({ success: false, message: 'No OTP requested or OTP expired' });

    if (Date.now() > record.expires) {
      signupOtps.delete(email);
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    if (record.otp !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // Mark email as verified for 15 minutes
    verifiedEmails.set(email, Date.now() + 15 * 60 * 1000);
    signupOtps.delete(email);

    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify OTP' });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Missing required fields' });

    // Enforce email verification check
    const verifiedExpiry = verifiedEmails.get(email);
    if (!verifiedExpiry || verifiedExpiry < Date.now()) {
      return res.status(400).json({ success: false, message: 'Please verify your email first' });
    }
    verifiedEmails.delete(email); // consume verification status

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
      from: 'VachoLink <onboarding@sumukesh.app>',
      to: email,
      subject: 'VachoLink - Password Reset OTP',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 40px 20px; text-align: center; border-radius: 12px; max-width: 480px; margin: 0 auto; border: 1px solid rgba(114, 137, 218, 0.2); box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <div style="font-size: 48px; color: #7289da; margin-bottom: 20px; line-height: 1;">🔐</div>
          <h2 style="margin-top: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">Password Reset Request</h2>
          <p style="color: #b9bbbe; font-size: 15px; line-height: 1.6; margin: 15px 0 25px;">You have requested to reset your password. Please use the following One-Time Password (OTP) to proceed. This OTP is valid for 15 minutes.</p>
          <div style="background-color: #202225; color: #7289da; font-size: 32px; font-weight: 700; letter-spacing: 4px; padding: 16px 24px; border-radius: 8px; display: inline-block; margin: 10px 0 30px; border: 1px solid rgba(114, 137, 218, 0.1); box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);">
            ${resetOtp}
          </div>
          <p style="color: #8e9297; font-size: 12px; margin-top: 20px; line-height: 1.5;">If you did not request a password reset, you can safely ignore this email.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(79, 84, 92, 0.3); color: #4f545c; font-size: 11px;">
            © 2026 VachoLink. Secure Communication Platform.
          </div>
        </div>
      `
    });

    res.json({ success: true, message: 'Reset OTP sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
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

    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'chat-app-profiles',
          resource_type: 'image'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      uploadStream.end(req.file.buffer);
    });

    const result = await uploadPromise;

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