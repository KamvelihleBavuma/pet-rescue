import express from "express";
import { protectAuth } from "../middlewares/authMiddleware.js";
import {
  deletePet,
  getAllPets,
  registerPet,
  updatePet,
} from "../controllers/petOwnerController.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.use(protectAuth);

router.post("/pets/", upload.single("image"), registerPet);
router.get("/pets/", getAllPets);
router.delete("/pets/:petId", deletePet);
router.put("/pets/:petId", upload.single("image"), updatePet);

export default router;
