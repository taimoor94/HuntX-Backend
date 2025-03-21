const express = require("express");
const Job = require("../models/Job");
const Application = require("../models/Application");
const User = require("../models/User");
const router = express.Router();
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

router.post("/post", authMiddleware, async (req, res) => {
  const { title, description, company, hourlyRate, location, jobType, isFeatured } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== "Employer") {
      return res.status(403).json({ message: "Only employers can post jobs" });
    }
    const job = new Job({
      title,
      description,
      company,
      hourlyRate,
      location,
      jobType,
      isFeatured,
      postedBy: req.user.id,
    });
    await job.save();
    res.status(201).json({ message: "Job posted successfully", job });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/list", async (req, res) => {
  const { search, jobType, location, page = 1, limit = 9 } = req.query;
  try {
    let query = {};
    if (search) query.title = { $regex: search, $options: "i" };
    if (jobType) query.jobType = jobType;
    if (location) query.location = { $regex: location, $options: "i" };

    const jobs = await Job.find(query)
      .populate("postedBy", "name email") // Populates postedBy with _id, name, and email
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Job.countDocuments(query);

    res.json({ jobs, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/featured", async (req, res) => {
  try {
    const jobs = await Job.find({ isFeatured: true })
      .populate("postedBy", "name email")
      .limit(3);
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/apply", authMiddleware, async (req, res) => {
  const { jobId, resume, coverLetter } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== "Job Seeker") {
      return res.status(403).json({ message: "Only job seekers can apply for jobs" });
    }

    const application = new Application({
      jobId,
      userId: req.user.id,
      resume,
      coverLetter,
    });
    await application.save();

    // Update user's resume
    user.resume = resume;
    await user.save();

    res.status(201).json({ message: "Application submitted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/schedule-interview", authMiddleware, async (req, res) => {
  const { applicationId, interviewDate } = req.body;
  try {
    const application = await Application.findById(applicationId);
    if (!application) return res.status(404).json({ message: "Application not found" });

    const job = await Job.findById(application.jobId);
    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the job poster can schedule interviews" });
    }

    application.interviewScheduled = true;
    application.interviewDate = new Date(interviewDate);
    await application.save();

    res.json({ message: "Interview scheduled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/my-applications", authMiddleware, async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user.id })
      .populate("jobId", "title company")
      .populate("userId", "name email");
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;