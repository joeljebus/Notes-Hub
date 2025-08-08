const express = require("express");
const router = express.Router();
const user = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// Register Route
router.post("/register", async (req, res) => {
  console.log("📥 Incoming register request:", req.body);

  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const existingUser = await user.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new user({
      name,
      email,
      password: hashedPassword,
      credits: 0,
    });

    await newUser.save();
    console.log("✅ User saved to DB");

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
    console.log("🔐 JWT created");

    res.status(201).json({ token, name: newUser.name });
  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ First declare the variable
    const user1 = await user.findOne({ email });

    // ✅ Then use it
    if (!user1) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user1.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user1._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      token,
      name: user1.name,
      credits: user1.credits,
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// 🥇 GET /api/users/leaderboard - Get top users by credits
router.get("/leaderboard", async (req, res) => {
  try {
    const topUsers = await user.find({})
      .select("name email creditsEarned")
      .sort({ creditsEarned: -1 }) // 🔽 Descending
      .limit(10); // Show top 10 users

    res.status(200).json(topUsers);
  } catch (err) {
    res.status(500).json({ message: "Error fetching leaderboard", error: err.message });
  }
});
const authMiddleware = require("../middleware/authMiddleware");

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const User = await user.findById(req.user.id).select("-password");
    if (!User) return res.status(404).json({ message: "User not found" });
    res.json(User);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching user", error: err.message });
  }
});

module.exports = router;
