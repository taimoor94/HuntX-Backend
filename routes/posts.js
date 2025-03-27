import express from "express";
import * as postController from "../controllers/postController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/create", auth, postController.createPost);
router.get("/list", auth, postController.getPosts);
router.post("/like/:postId", auth, postController.likePost);
router.post("/comment/:postId", auth, postController.commentOnPost);

export default router;