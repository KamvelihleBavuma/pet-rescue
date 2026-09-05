import ImageKit, { toFile } from "@imagekit/nodejs";
import { ENV } from "../config/env.js";

const imagekit = new ImageKit({
  publicKey: ENV.IMAGEKIT_PUBLIC_KEY,
  privateKey: ENV.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: ENV.IMAGEKIT_URL_ENDPOINT,
});

function hasImageKitConfig() {
  return Boolean(process.env.IMAGEKIT_PRIVATE_KEY);
}

// originalName= "My Photo (1).png"
// result: "chat-1749300000000-My_Photo__1_.png"
// this helper makes a safe, unique filename for uploaded files.
function createFileName(originalName = "upload") {
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `petrescue-${Date.now()}-${safeName}`;
}

/**
 * Upload image or video to ImageKit
 * @see https://imagekit.io/docs/api-reference/upload-file/upload-file
 */
async function uploadMedia(file) {
  const fileName = createFileName(file.originalName);

  const result = await imagekit.files.upload({
    file: await toFile(file.buffer, fileName, { type: file.mimetype }),
    fileName,
    folder: "/petRescue",
  });

  return result;
}

/**
 * Delete media from ImageKit
 * @param {string} fileId - The unique fileId returned by ImageKit on upload
 */
async function deleteMedia(fileId) {
  try {
    const result = await imagekit.files.delete(fileId);
    console.log("Deleted:", result);
    return { success: true, result };
  } catch (error) {
    console.error("Error deleting file:", error);
    return { success: false, error: error.message };
  }
}

export { uploadMedia, hasImageKitConfig, deleteMedia };
