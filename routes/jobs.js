const express = require("express");
const Job = require("../models/Job");
const Application = require("../models/Application");
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
      .populate("postedBy", "name email")
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
    const application = new Application({
      jobId,
      userId: req.user.id,
      resume,
      coverLetter,
    });
    await application.save();
    res.status(201).json({ message: "Application submitted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;