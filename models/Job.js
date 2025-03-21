const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  company: { type: String, required: true },
  hourlyRate: { type: Number, required: true },
  location: { type: String, required: true },
  jobType: { type: String, enum: ["Full-Time", "Part-Time", "Contract", "Freelance"], required: true },
  isFeatured: { type: Boolean, default: false },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Job", jobSchema);