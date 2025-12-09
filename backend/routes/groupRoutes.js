const express = require("express");
const Group = require("../models/Group");

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const { name, memberIds } = req.body;

    const group = await Group.create({
      name,
      members: memberIds,
    });

    const populatedGroup = await Group.findById(group._id)
      .populate("members", "name email avatar");

    res.json(populatedGroup);
  } catch (err) {
    console.error("Group create error:", err);
    res.status(500).json({ message: "Group create error" });
  }
});

router.get("/my/:userId", async (req, res) => {
  try {
    const groups = await Group.find({ 
      members: req.params.userId 
    }).populate("members", "name avatar");

    res.json(groups);
  } catch (err) {
    console.error("Fetch groups error:", err);
    res.status(500).json({ message: "Fetch error" });
  }
});

module.exports = router;