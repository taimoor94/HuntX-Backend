import express from "express";
import * as messageController from "../controllers/messageController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/start", auth, messageController.startConversation);
router.post("/send", auth, messageController.sendMessage);
router.get("/conversations", auth, messageController.getConversations);

export default router;