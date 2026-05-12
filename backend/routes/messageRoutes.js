const express = require("express");
const Message = require("../models/Message");

const router = express.Router();

router.get("/:roomId", async (req, res) => {
  try {
    let msgs = await Message.find({ roomId: req.params.roomId })
      .populate("sender", "name avatar")
      .sort({ createdAt: -1 })
      .limit(200000);

    msgs = msgs.reverse();
    res.json(msgs);
  } catch (err) {
    console.error("Error loading messages:", err);
    res.status(500).json({ message: "Could not load messages" });
  }
});

module.exports = router;