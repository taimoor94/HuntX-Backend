import express from "express";
import * as notificationController from "../controllers/notificationController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/list", auth, notificationController.getNotifications);
router.post("/mark-read", auth, notificationController.markNotificationsAsRead);

export default router;