import express from "express";
import {
  checkAuth,
  getAllUsers,
  loginUser,
  logoutUser,
  registerManager,
  registerRescueCoordinator,
  signupUser,
} from "../controllers/authController.js";
import { protectAuth } from "../middlewares/authMiddleware.js";
import { protectITAdmin } from "../middlewares/adminMiddleware.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/signup", signupUser);
router.post("/logout", logoutUser);

router.get("/check-auth", protectAuth, checkAuth);

router.post("/register-manager/:personId", protectITAdmin, registerManager);
router.post(
  "/register-rescue-coordinator/:personId",
  protectITAdmin,
  registerRescueCoordinator,
);

router.get("/all-users", protectITAdmin, getAllUsers);

export default router;
