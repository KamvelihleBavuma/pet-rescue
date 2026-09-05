import multer from "multer";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB is plenty for a thumbnail image

export const uploadThumbnail = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter: (req, file, cb) => {
    const isImage = file.mimetype.startsWith("image/");

    if (!isImage) {
      cb(new Error("Only image uploads are allowed for thumbnails"));
      return;
    }

    cb(null, true);
  },
});
