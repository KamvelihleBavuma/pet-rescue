import express from "express";
import { loginUser, signupUser } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", loginUser);

// ✅ Login Route with role
router.post("/signup", signupUser);

export default router;