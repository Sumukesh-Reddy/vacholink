const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, unique: true, sparse: true },
    name: String,
    email: { type: String, unique: true },
    avatar: String,
    isGoogleUser: { type: Boolean, default: false },
    needsPasswordChange: { type: Boolean, default: false },
    password: { type: String, select: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);