const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Note = require("../models/note");
const mongoose = require("mongoose");

// 1️⃣ Set up storage for PDFs
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // folder to save uploaded files
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName); // make sure filenames are unique
  },
});

// 2️⃣ File filter - only accept PDF
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed!"), false);
  }
};

// 3️⃣ Create multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

// 4️⃣ Upload note with PDF
const authMiddleware = require("../middleware/authMiddleware");

router.post(
  "/upload",
  authMiddleware,
  upload.single("pdf"),
  async (req, res) => {
    try {
      const { title, department, subject, unit, topic } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: "PDF file is required" });
      }

      const note = new Note({
        title,
        pdfUrl: req.file.path,
        department,
        subject,
        unit,
        topic,
        uploadedBy: req.user._id,
      });

      await note.save();
      res.status(201).json({ message: "Note uploaded successfully", note });
    } catch (err) {
      console.error("Upload error full:", err);
      res.status(500).json({
        message: "Failed to upload note",
        error: err.message || "Unknown error"
      });
    }
  }
);



// 📌 VIEW NOTES ROUTE
// 🔁 View all notes with optional filters and sorted by most viewed
router.get("/", async (req, res) => {
  try {
    const { department, subject, unit, topic } = req.query;

    let filter = {};
    if (department) filter.department = department;
    if (subject) filter.subject = subject;
    if (unit) filter.unit = unit;
    if (topic) filter.topic = topic;

    const notes = await Note.find(filter)
      .sort({ viewCount: -1 }) // 🔽 Sort by most viewed first
      .populate("uploadedBy", "name email");

    res.status(200).json(notes);
  } catch (err) {
    res.status(500).json({ message: "Error fetching notes", error: err.message });
  }
});

const User = require("../models/user"); // <-- add this at top with other imports
 // make sure this is imported

// 👁️ GET /api/notes/:id/view — View a note, increase viewCount + viewer's credits
router.get("/:id/view", authMiddleware, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // 1️⃣ Increase note's view count
    note.viewCount += 1;
    await note.save();

    // 2️⃣ Reward viewer with 2 credits
    const user = await User.findById(req.user);
    if (user) {
      user.creditsEarned += 2;
      await user.save();
    }

    res.status(200).json({ message: "Note viewed successfully", note });
  } catch (err) {
    res.status(500).json({ message: "Error viewing note", error: err.message });
  }
});
// 📨 DOWNLOAD NOTE ROUTE (deduct 5 credits)
router.get("/:id/download", authMiddleware, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.creditsEarned < 5) {
      return res.status(403).json({ message: "Not enough credits to download this note" });
    }

    // Deduct credits
    user.creditsEarned -= 5;
    await user.save();

    // Send file path or actual file
    res.status(200).json({
      message: "Download ready. 5 credits deducted.",
      pdfUrl: note.pdfUrl
    });
  } catch (err) {
    res.status(500).json({ message: "Download failed", error: err.message });
  }
});

// ✅ POST /api/notes/:id/validate

// GET all notes pending validation


// GET: Validated notes based on filters
router.get("/view", authMiddleware, async (req, res) => {
  try {
    const user1 = req.user;

    const notes = await Note.find({ isValidated: true });

    const visibleNotes = notes.map((note) => {
      const canAccess = user1.credits >= note.creditsEarned;

      const totalStars = note.validations.reduce((sum, v) => sum + v.stars, 0);
      const avgStars = note.validations.length
        ? (totalStars / note.validations.length).toFixed(1)
        : null;

      return {
        _id: note._id,
        title: note.title,
        pdfUrl: note.pdfUrl,
        department: note.department,
        subject: note.subject,
        unit: note.unit,
        topic: note.topic,
        creditsRequired: note.creditsEarned,
        canAccess,
        views: note.views,
        avgStars,
        comments: note.validations.map((v) => v.comment).filter(Boolean),
      };
    });

    res.json(visibleNotes);
  } catch (err) {
    console.error("❌ Error fetching notes:", err);
    res
      .status(500)
      .json({ message: "Error fetching notes", error: err.message });
  }
});





// ✅ POST: Submit validation (with stars + comment)
router.post("/validate/:noteId", authMiddleware, async (req, res) => {
  try {
    const { stars, comment } = req.body;
    const noteId = req.params.noteId;
    const userId = new mongoose.Types.ObjectId(req.user._id);

    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({ message: "Invalid star rating" });
    }

    const note = await Note.findById(noteId);
    if (!note) return res.status(404).json({ message: "Note not found" });

    // ✅ Reject if already validated by this user
    if (note.validatedBy.some((id) => id && id.equals(userId))) {
      return res
        .status(400)
        .json({ message: "You have already validated this note." });
    }

    // ✅ Store validation
    note.validations.push({
      ratedBy: userId,
      stars,
      comment,
    });

   

    note.validatedBy.push(new mongoose.Types.ObjectId(userId));


 // Track this user has validated

    note.ratingCount = note.validations.length;
    note.rating = (
      note.validations.reduce((sum, v) => sum + v.stars, 0) / note.ratingCount
    ).toFixed(1);

    
    console.log("Before saving validatedBy:", note.validatedBy);

    await note.save();
    const updated = await Note.findById(noteId);
    console.log("✅ After save, validatedBy:", updated.validatedBy);

    res.status(200).json({ message: "Validation submitted successfully." });
  } catch (err) {
    console.error("Validation error:", err);
    res.status(500).json({ message: "Server error during validation." });
  }
});






// GET /api/notes/unvalidated - Show notes this user has NOT validated



router.get("/unvalidated", authMiddleware, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

     const notes = await Note.find();

     const filtered = notes.filter(
       (note) =>
         !note.validations?.some(
           (v) => v?.ratedBy?.toString() === userId.toString()
         )
     );

     res.json(filtered);
    console.log(userId)
    console.log(notes);
    
  } catch (err) {
    console.error("❌ Error fetching unvalidated notes:", err);
    res
      .status(500)
      .json({ message: "Error fetching data", error: err.message });
  }
});







module.exports = router;
