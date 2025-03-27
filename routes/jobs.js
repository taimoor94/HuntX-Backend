import express from "express";
import * as jobController from "../controllers/jobController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/post", auth, jobController.postJob);
router.get("/featured", jobController.getFeaturedJobs);
router.get("/list", jobController.getJobList);
router.get("/my-jobs", auth, jobController.getMyJobs);
router.post("/apply", auth, jobController.applyForJob);
router.get("/my-applications", auth, jobController.getMyApplications);
router.get("/top-companies", jobController.getTopCompanies);
router.get("/:jobId", jobController.getJobById);

export default router;