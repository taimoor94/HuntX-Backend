import Job from "../models/Job.js";
import Notification from "../models/Notification.js";

export const postJob = async (req, res) => {
  const { title, description, company, hourlyRate, location, jobType, isFeatured, requirements, benefits } = req.body;
  if (!title || !description || !company || !hourlyRate || !location || !jobType) {
    return res.status(400).json({ message: "All required fields must be provided" });
  }

  try {
    const job = new Job({
      title,
      description,
      company,
      hourlyRate,
      location,
      jobType,
      isFeatured: isFeatured || false,
      requirements,
      benefits,
      postedBy: req.user.id,
    });
    await job.save();

    const notification = new Notification({
      userId: req.user.id,
      message: `You posted a new job: ${title}`,
      type: "job",
      relatedId: job._id,
    });
    await notification.save();

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getFeaturedJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ isFeatured: true }).populate("postedBy", "name company");
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getJobList = async (req, res) => {
  const { search, jobType, location, company, page = 1, limit = 9 } = req.query;
  const query = {};
  if (search) query.title = { $regex: search, $options: "i" };
  if (jobType) query.jobType = jobType;
  if (location) query.location = { $regex: location, $options: "i" };
  if (company) query.company = { $regex: company, $options: "i" };

  try {
    const jobs = await Job.find(query)
      .populate("postedBy", "name company")
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Job.countDocuments(query);
    res.status(200).json({ jobs, total });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getJobById = async (req, res) => {
  const { jobId } = req.params;
  try {
    const job = await Job.findById(jobId).populate("postedBy", "name company");
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user.id });
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const applyForJob = async (req, res) => {
  const { jobId, fullName, email, phone, linkedin, workExperience, education, skills, question1, coverLetter, resume } = req.body;

  if (!jobId || !fullName || !email || !phone || !workExperience || !education || !skills || !coverLetter || !resume) {
    return res.status(400).json({ message: "All required fields must be provided" });
  }

  try {
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const application = {
      applicant: req.user.id,
      fullName,
      email,
      phone,
      linkedin,
      workExperience,
      education,
      skills,
      coverLetter, // Base64 string
      resume, // Base64 string
      question1,
      status: "Pending",
    };

    job.applications.push(application);
    await job.save();

    const notification = new Notification({
      userId: job.postedBy,
      message: `${fullName} applied for your job: ${job.title}`,
      type: "job",
      relatedId: job._id,
    });
    await notification.save();

    res.status(200).json({ message: "Application submitted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const jobs = await Job.find({ "applications.applicant": req.user.id });
    const applications = jobs
      .map((job) =>
        job.applications
          .filter((app) => app.applicant.toString() === req.user.id)
          .map((app) => ({
            ...app.toObject(),
            job: {
              _id: job._id,
              title: job.title,
              company: job.company,
              location: job.location,
              jobType: job.jobType,
              hourlyRate: job.hourlyRate,
            },
          }))
      )
      .flat();
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getTopCompanies = async (req, res) => {
  try {
    const jobs = await Job.find().populate("postedBy", "name");
    const companies = jobs.reduce((acc, job) => {
      const companyName = job.company;
      if (!acc[companyName]) {
        acc[companyName] = {
          name: companyName,
          logo: null, // We'll fetch from user profile if needed
          jobCount: 0,
        };
      }
      acc[companyName].jobCount += 1;
      return acc;
    }, {});

    const topCompanies = Object.values(companies)
      .sort((a, b) => b.jobCount - a.jobCount)
      .slice(0, 4);
    res.status(200).json(topCompanies);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};