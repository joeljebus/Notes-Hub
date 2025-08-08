const jwt = require("jsonwebtoken");
const User = require("../models/user"); // 🔁 Adjust path if needed

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("🔐 Token received:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Fetch user from DB to get full ObjectId and user info
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user; // 👈 Now req.user._id is a real ObjectId
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = protect;

