const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  linkedin: { type: String },
  workExperience: { type: String },
  education: { type: String },
  skills: { type: String },
  coverLetter: { type: String, required: true },
  resume: { type: String, required: true },
  question1: { type: String },
  interviewScheduled: { type: Boolean, default: false },
  interviewDate: { type: Date },
  appliedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Application", applicationSchema);