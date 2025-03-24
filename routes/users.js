import express from "express";
import * as userController from "../controllers/userController.js";
import auth from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/profile", auth, userController.getProfile);
router.put("/profile", auth, userController.updateProfile);
router.post(
  "/profile-picture",
  auth,
  upload.single("profilePicture"),
  userController.uploadProfilePicture
);
router.get("/list", auth, userController.getUsers);

export default router;