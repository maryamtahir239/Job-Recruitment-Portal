import express from "express";
import multer from "multer";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  getUserProfile,
  updateUserProfile,
  updateProfileImage,
  removeProfileImage,
  resetPassword
} from "../controllers/userProfileController.js";
import path from "path"; // Added missing import

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/temp/'); // Temporary storage
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// All routes require authentication
router.use(verifyToken);

// GET /api/user/profile - Get user profile
router.get("/profile", getUserProfile);

// PUT /api/user/profile - Update user profile (name)
router.put("/profile", updateUserProfile);

// PUT /api/user/profile-image - Update profile image
router.put("/profile-image", upload.single('profile_image'), updateProfileImage);

// DELETE /api/user/profile-image - Remove profile image
router.delete("/profile-image", removeProfileImage);

// PUT /api/user/reset-password - Reset password
router.put("/reset-password", resetPassword);

export default router; 