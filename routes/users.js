import express from "express";
import * as userController from "../controllers/userController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/profile", auth, userController.getProfile);
router.put("/profile", auth, userController.updateProfile);
router.post("/profile-picture", auth, userController.uploadProfilePicture);
router.get("/list", auth, userController.getUsers);

export default router;