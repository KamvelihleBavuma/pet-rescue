import express from "express";
import { protectITAdmin } from "../middlewares/adminMiddleware.js";
import {
  getAdminProfile,
  getMyORGManagersNdStaff,
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/profile", protectITAdmin, getAdminProfile);
router.get("/staff", protectITAdmin, getMyORGManagersNdStaff);

export default router;
