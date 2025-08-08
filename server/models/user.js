const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  department: { type: String },
  year: { type: Number },
  credits: { type: Number, default: 0 },
});

module.exports = mongoose.model("user", userSchema);

