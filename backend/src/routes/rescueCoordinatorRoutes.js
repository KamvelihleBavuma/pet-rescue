import express from "express";
import { protectAuth } from "../middlewares/authMiddleware.js";
import { getRescueCoordinatorProfile } from "../controllers/rescueCoordinatorController.js";

const router = express.Router();

router.get("/profile", protectAuth, getRescueCoordinatorProfile);

export default router;
