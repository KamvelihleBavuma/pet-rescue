import express from "express";
import { protectAuth } from "../middlewares/authMiddleware.js";
import {
  getManagerProfile,
  getMyORGRescueCoordinators,
} from "../controllers/managerController.js";

const router = express.Router();

router.get("/profile", protectAuth, getManagerProfile);
router.get("/staff", protectAuth, getMyORGRescueCoordinators);

export default router;
