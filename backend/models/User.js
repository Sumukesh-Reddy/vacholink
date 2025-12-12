const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, unique: true, sparse: true },
    name: String,
    email: { type: String, unique: true },
    avatar: String,
    needsProfileCompletion: { type: Boolean, default: false }, // Add this line
    password: { type: String, select: false }, // Add this for password storage
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);