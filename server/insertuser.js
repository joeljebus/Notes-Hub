const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/user");

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    const hashedPassword = await bcrypt.hash("123456", 10);

    const newUser = new User({
      name: "Joel Jebus",
      email: "joel@example.com",
      password: hashedPassword,
      credits: 0,
    });

    await newUser.save();
    console.log("✅ User inserted successfully");
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("❌ Error inserting user:", err.message);
  });
