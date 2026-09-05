import path from "path";
import multer from "multer";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter: (req, file, cb) => {
    const allowedExt = [".jpg", ".jpeg", ".png", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();

    const isImage =
      (file.mimetype.startsWith("image/") ||
        file.mimetype === "application/octet-stream") &&
      allowedExt.includes(ext);

    if (!isImage) {
      cb(new Error("Only image uploads are allowed"));
      return;
    }

    cb(null, true);
  },
});
