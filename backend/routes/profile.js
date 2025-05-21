const express = require("express");
const protect = require("../middleware/auth"); // Import the authentication middleware
const User = require("../models/User"); // Import the User model

const router = express.Router();

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private (requires JWT token)
router.get("/profile", protect, async (req, res) => {
  try {
    // req.user is populated by the 'protect' middleware
    const user = await User.findById(req.user.id).select("-password"); // Fetch user data excluding password
    if (user) {
      res.json({
        id: user._id,
        username: user.username,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error fetching profile" });
  }
});

module.exports = router;