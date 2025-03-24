import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  linkedin: { type: String },
  workExperience: { type: String, required: true },
  education: { type: String, required: true },
  skills: { type: String, required: true },
  coverLetter: { type: String, required: true },
  resume: { type: String, required: true },
  question1: { type: String },
  status: { type: String, default: "Pending" },
  appliedAt: { type: Date, default: Date.now },
});

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  company: { type: String, required: true },
  hourlyRate: { type: Number, required: true },
  location: { type: String, required: true },
  jobType: { type: String, required: true },
  isFeatured: { type: Boolean, default: false },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  applications: [applicationSchema],
});

export default mongoose.model("Job", jobSchema);