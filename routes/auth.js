import express from "express";
import * as authController from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/signin", authController.signin);

export default router;