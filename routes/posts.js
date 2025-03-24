import express from "express";
import * as postController from "../controllers/postController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/create", auth, postController.createPost);
router.get("/list", auth, postController.getPosts);

export default router;