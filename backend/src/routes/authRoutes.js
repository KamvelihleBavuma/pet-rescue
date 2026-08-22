import express from "express";
import {
  checkAuth,
  loginUser,
  logoutUser,
  signupUser,
} from "../controllers/authController.js";
import { protectAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/signup", signupUser);
router.post("/logout", logoutUser);

router.get("/check-auth", protectAuth, checkAuth);

export default router;
