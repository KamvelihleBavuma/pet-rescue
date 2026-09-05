import pool from "../config/db.js";
import {
  deleteMedia,
  hasImageKitConfig,
  uploadMedia,
} from "../lib/imagekit.js";

export const registerPet = async (req, res) => {
  try {
    const { petName, speciesId, colorId, description } = req.body;
    const ownerPersonId = req.user.PERSON_ID;

    let petImageId = null;

    if (req.file) {
      if (!hasImageKitConfig) {
        return res
          .status(500)
          .json({ message: "Media upload is not configured" });
      }

      const fileData = await uploadMedia(req.file);

      if (req.file.mimetype.startsWith("image/")) {
        // Insert into PET_IMAGES table
        const [imgResult] = await pool.query(
          "INSERT INTO pet_images (URL, FILEID) VALUES (?, ?)",
          [fileData.url, fileData.fileId],
        );
        petImageId = imgResult.insertId;
      }
    }

    // Verify pet owner exists
    const [ownerRows] = await pool.query(
      "SELECT * FROM pet_owners WHERE PERSON_ID = ?",
      [ownerPersonId],
    );
    if (ownerRows.length === 0) {
      return res
        .status(403)
        .json({ success: false, message: "Pet owner record not found" });
    }

    const ownerId = ownerRows[0].OWNER_ID;

    // Insert new pet with PET_IMAGE_ID reference
    const [result] = await pool.query(
      "INSERT INTO pets (PET_NAME, SPECIES_ID, PET_COLOUR_ID, PET_DESCRIPTION, PET_OWNER_ID, PET_STATUS, PET_IMAGE_ID) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        petName,
        speciesId,
        colorId,
        description,
        ownerId,
        "REGISTERED",
        petImageId,
      ],
    );

    return res.status(201).json({
      success: true,
      message: "Pet registered successfully",
      petId: result.insertId,
      petName,
      petImageId,
    });
  } catch (err) {
    console.error("Register pet error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Error registering pet" });
  }
};

export const deletePet = async (req, res) => {
  try {
    const { petId } = req.params;
    const ownerPersonId = req.user.PERSON_ID;

    // Verify ownership
    const [ownerRows] = await pool.query(
      "SELECT * FROM pet_owners WHERE PERSON_ID = ?",
      [ownerPersonId],
    );
    if (ownerRows.length === 0) {
      return res
        .status(403)
        .json({ success: false, message: "Pet owner record not found" });
    }

    const ownerId = ownerRows[0].OWNER_ID;

    // Fetch pet with image reference
    const [petRows] = await pool.query(
      "SELECT PET_IMAGE_ID FROM pets WHERE PET_ID = ? AND PET_OWNER_ID = ?",
      [petId, ownerId],
    );
    if (petRows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Pet not found or not owned by you" });
    }

    const petImageId = petRows[0].PET_IMAGE_ID;

    // Delete pet
    await pool.query("DELETE FROM pets WHERE PET_ID = ?", [petId]);

    // Delete linked image if exists
    if (petImageId) {
      const [imgRows] = await pool.query(
        "SELECT FILEID FROM pet_images WHERE PET_IMAGE_ID = ?",
        [petImageId],
      );
      if (imgRows.length > 0) {
        const fileId = imgRows[0].FILEID;
        await pool.query("DELETE FROM pet_images WHERE PET_IMAGE_ID = ?", [
          petImageId,
        ]);
        if (fileId && hasImageKitConfig) {
          await deleteMedia(fileId); // remove from ImageKit
        }
      }
    }

    return res
      .status(200)
      .json({ success: true, message: "Pet and image deleted successfully" });
  } catch (err) {
    console.error("Delete pet error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Error deleting pet" });
  }
};

export const updatePet = async (req, res) => {
  try {
    const { petId } = req.params;
    const { petName, speciesId, colorId, description, status } = req.body;
    const ownerPersonId = req.user.PERSON_ID;

    // Verify ownership
    const [ownerRows] = await pool.query(
      "SELECT * FROM pet_owners WHERE PERSON_ID = ?",
      [ownerPersonId],
    );
    if (ownerRows.length === 0) {
      return res
        .status(403)
        .json({ success: false, message: "Pet owner record not found" });
    }

    const ownerId = ownerRows[0].OWNER_ID;

    const [petRows] = await pool.query(
      "SELECT PET_IMAGE_ID FROM pets WHERE PET_ID = ? AND PET_OWNER_ID = ?",
      [petId, ownerId],
    );
    if (petRows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Pet not found or not owned by you" });
    }

    let petImageId = petRows[0].PET_IMAGE_ID;

    // Handle new image upload
    if (req.file && hasImageKitConfig) {
      const fileData = await uploadMedia(req.file);

      // If old image exists, delete it
      if (petImageId) {
        const [imgRows] = await pool.query(
          "SELECT FILEID FROM pet_images WHERE PET_IMAGE_ID = ?",
          [petImageId],
        );
        if (imgRows.length > 0) {
          await deleteMedia(imgRows[0].FILEID);
          await pool.query("DELETE FROM pet_images WHERE PET_IMAGE_ID = ?", [
            petImageId,
          ]);
        }
      }

      // Insert new image
      const [imgResult] = await pool.query(
        "INSERT INTO pet_images (URL, FILEID) VALUES (?, ?)",
        [fileData.url, fileData.fileId],
      );
      petImageId = imgResult.insertId;
    }

    // Update pet record
    await pool.query(
      "UPDATE pets SET PET_NAME = ?, SPECIES_ID = ?, PET_COLOUR_ID = ?, PET_DESCRIPTION = ?, PET_STATUS = ?, PET_IMAGE_ID = ? WHERE PET_ID = ?",
      [petName, speciesId, colorId, description, status, petImageId, petId],
    );

    return res
      .status(200)
      .json({ success: true, message: "Pet updated successfully" });
  } catch (err) {
    console.error("Update pet error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Error updating pet" });
  }
};

export const getAllPets = async (req, res) => {
  try {
    const ownerPersonId = req.user.PERSON_ID;

    // Verify ownership
    const [ownerRows] = await pool.query(
      "SELECT * FROM pet_owners WHERE PERSON_ID = ?",
      [ownerPersonId],
    );
    if (ownerRows.length === 0) {
      return res
        .status(403)
        .json({ success: false, message: "Pet owner record not found" });
    }

    const ownerId = ownerRows[0].OWNER_ID;

    // Fetch pets with species, colour, and image
    const [pets] = await pool.query(
      `SELECT 
         p.PET_ID,
         p.PET_NAME,
         p.SPECIES_ID,
         s.SPECIES_NAME,
         p.PET_COLOUR_ID,
         c.COLOUR_NAME,
         p.PET_DESCRIPTION,
         p.PET_STATUS,
         i.URL AS IMAGE_URL
       FROM pets p
       LEFT JOIN pet_species s ON p.SPECIES_ID = s.SPECIES_ID
       LEFT JOIN pet_colours c ON p.PET_COLOUR_ID = c.COLOUR_ID
       LEFT JOIN pet_images i ON p.PET_IMAGE_ID = i.PET_IMAGE_ID
       WHERE p.PET_OWNER_ID = ?`,
      [ownerId],
    );

    return res.status(200).json({ success: true, pets });
  } catch (err) {
    console.error("Get all pets error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Error fetching pets" });
  }
};
