const express = require("express");
const Message = require("../models/Message");

const router = express.Router();

router.get("/:roomId", async (req, res) => {
  try {
    const msgs = await Message.find({ roomId: req.params.roomId })
      .populate("sender", "name avatar")
      .sort({ createdAt: 1 })
      .limit(100); // Limit to last 100 messages

    res.json(msgs);
  } catch (err) {
    console.error("Error loading messages:", err);
    res.status(500).json({ message: "Could not load messages" });
  }
});

module.exports = router;