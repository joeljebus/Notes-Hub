const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  pdfUrl: { type: String, required: true },
  department: { type: String, required: true },
  subject: { type: String, required: true },
  unit: { type: Number, required: true },
  topic: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  creditsEarned: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  isValidated: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },

  // Average rating & count
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },

  // Individual ratings & comments by validators
  ratings: [
    {
      stars: { type: Number, min: 1, max: 5 },
      comment: String,
      validator: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
      ratedAt: { type: Date, default: Date.now },
    },
  ],
  validations: [
    {
      ratedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
      stars: Number,
      comment: String,
      validatedAt: { type: Date, default: Date.now },
    },
  ],
  validatedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
});


module.exports = mongoose.model("note", noteSchema);
