import bcrypt from 'bcryptjs';
import knex from '../db/knex.js';
import path from 'path';
import fs from 'fs';

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID not found in token" });
    }
    
    const user = await knex("users")
      .select("id", "name", "email", "role", "profile_image", "created_at")
      .where({ id: userId })
      .first();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("GET /api/user/profile error:", err);
    res.status(500).json({ error: "Failed to fetch user profile. Please try again." });
  }
};

// Update user profile (name)
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;



    if (!name || name.trim() === '') {
      return res.status(400).json({ error: "Name is required" });
    }

    // Update user name
    const affectedRows = await knex("users")
      .where({ id: userId })
      .update({ name: name.trim() });



    if (affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get updated user data
    const updatedUser = await knex("users")
      .select("id", "name", "email", "role", "profile_image", "created_at")
      .where({ id: userId })
      .first();

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found after update" });
    }


    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Update user profile image
export const updateProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID not found in token" });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ error: "Invalid file type. Only JPEG, PNG, and GIF are allowed." });
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (req.file.size > maxSize) {
      return res.status(400).json({ error: "File size too large. Maximum size is 5MB." });
    }

    const filename = `profile_${userId}_${Date.now()}${path.extname(req.file.originalname)}`;
    const uploadPath = path.join(process.cwd(), 'uploads', 'profiles', filename);

    // Create profiles directory if it doesn't exist
    const profilesDir = path.join(process.cwd(), 'uploads', 'profiles');
    if (!fs.existsSync(profilesDir)) {
      fs.mkdirSync(profilesDir, { recursive: true });
    }

    // Move uploaded file to profiles directory
    fs.renameSync(req.file.path, uploadPath);

    // Get current profile image to delete if exists
    const currentUser = await knex("users")
      .select("profile_image")
      .where({ id: userId })
      .first();

    // Delete old profile image if exists
    if (currentUser && currentUser.profile_image) {
      const oldImagePath = path.join(process.cwd(), 'uploads', 'profiles', currentUser.profile_image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update database with new profile image
    await knex("users")
      .where({ id: userId })
      .update({ profile_image: filename });

    res.json({ 
      message: "Profile image updated successfully",
      profile_image: filename
    });
  } catch (err) {
    console.error("PUT /api/user/profile-image error:", err);
    res.status(500).json({ error: "Failed to update profile image. Please try again." });
  }
};

// Remove profile image
export const removeProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get current profile image
    const user = await knex("users")
      .select("profile_image")
      .where({ id: userId })
      .first();

    if (user.profile_image) {
      // Delete file from filesystem
      const imagePath = path.join(process.cwd(), 'uploads', 'profiles', user.profile_image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }

      // Update database to remove profile image
      await knex("users")
        .where({ id: userId })
        .update({ profile_image: null });
    }

    res.json({ message: "Profile image removed successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID not found in token" });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current password and new password are required" });
    }

    // Get current user with password
    const user = await knex("users")
      .select("password")
      .where({ id: userId })
      .first();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await knex("users")
      .where({ id: userId })
      .update({ password: hashedPassword });

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("PUT /api/user/reset-password error:", err);
    res.status(500).json({ error: "Failed to reset password. Please try again." });
  }
}; 