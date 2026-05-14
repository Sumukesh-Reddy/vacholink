const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: { type: String, required: false },
  type: { type: String, enum: ['text', 'image', 'video', 'file'], default: 'text' },
  mediaUrl: { type: String },
  mediaName: { type: String },
  read: { type: Boolean, default: false },
  readAt: { type: Date },
  roomId: { type: String, required: true },
  deleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
  editedAt: { type: Date },
  reactions: [{
    emoji: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String }
  }],
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
