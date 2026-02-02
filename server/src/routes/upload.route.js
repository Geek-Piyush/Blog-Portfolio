import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  uploadSingle,
  uploadMultiple,
  uploadToCloudinary,
} from "../middlewares/upload.middleware.js";

const router = Router();

// POST /upload - Single image upload
router.post("/", verifyToken, uploadSingle, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const result = await uploadToCloudinary(req.file.buffer);
    
    res.json({
      message: "Image uploaded successfully",
      image: result,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Failed to upload image" });
  }
});

// POST /upload/multiple - Multiple images upload
router.post("/multiple", verifyToken, uploadMultiple, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No image files provided" });
    }

    const uploadPromises = req.files.map((file) =>
      uploadToCloudinary(file.buffer)
    );

    const results = await Promise.all(uploadPromises);

    res.json({
      message: "Images uploaded successfully",
      images: results,
    });
  } catch (error) {
    console.error("Multiple upload error:", error);
    res.status(500).json({ message: "Failed to upload images" });
  }
});

export default router;
