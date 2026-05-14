const mongoose = require('mongoose');

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
  isGoogleUser: { type: Boolean, default: false },
  needsPasswordChange: { type: Boolean, default: false },
  needsProfileCompletion: { type: Boolean, default: false },
  resetToken: String,
  resetTokenExpires: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Ensure indexes
(async () => {
  try {
    const User = mongoose.model('User', userSchema);
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

module.exports = mongoose.model('User', userSchema);