import express from "express";
import { protectAuth } from "../middlewares/authMiddleware.js";
import {
  deletePet,
  getAllPets,
  registerPet,
  updatePet,
} from "../controllers/petOwnerController.js";

const router = express.Router();

router.use(protectAuth);

router.post("/pets/", registerPet);
router.get("/pets/", getAllPets);
router.delete("/pets/:petId", deletePet);
router.put("/pets/:petId", updatePet);

export default router;
