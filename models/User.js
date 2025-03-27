import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["Job Seeker", "Employer"], required: true },
  profilePicture: { type: String, default: "" }, // Add this field
  bio: { type: String },
  skills: { type: String },
  experience: { type: String },
  education: { type: String },
  portfolio: { type: String },
  companyInfo: { type: String },
  website: { type: String },
  location: { type: String },
});

export default mongoose.model("User", userSchema);