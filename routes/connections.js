import express from "express";
import * as connectionController from "../controllers/connectionController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/connect", auth, connectionController.connect);
router.post("/accept", auth, connectionController.acceptConnection);
router.post("/remove", auth, connectionController.removeConnection);
router.get("/list", auth, connectionController.getConnections);

export default router;