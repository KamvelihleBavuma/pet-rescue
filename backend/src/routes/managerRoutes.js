import express from "express";
import { protectAuth } from "../middlewares/authMiddleware.js";
import { getManagerProfile } from "../controllers/managerController.js";

const router = express.Router();

router.get("/profile", protectAuth, getManagerProfile);

export default router;
