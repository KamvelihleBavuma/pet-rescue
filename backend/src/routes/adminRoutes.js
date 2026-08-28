import express from "express";
import { protectITAdmin } from "../middlewares/adminMiddleware.js";
import { getAdminProfile } from "../controllers/adminController.js";

const router = express.Router();

router.get("/profile", protectITAdmin, getAdminProfile);

export default router;
