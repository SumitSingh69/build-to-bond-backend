import express from "express";
import {
  loginUser,
  registerUser,
  updateProfile,
  changePassword,
  updateLocation,
  getUserProfile,
  getPublicProfile,
  deactivateAccount,
  refreshProfile,
  fetchAllUsers,
  findUserById,
  refreshToken,
  logoutUser,
  getPendingFeedbacks,
  submitPendingFeedbacks,
  updatePersonalityScore,
} from "../controllers/user.controller.js";

import { IsAuthenticated } from "../middlewares/Auth.middleware.js";

const router = express.Router();

// Public routes (no authentication required)
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshToken); // Refresh access token

// Protected routes (authentication required)
router.use(IsAuthenticated); // Apply authentication middleware to all routes below

router.get("/profile/:userId", getPublicProfile); // profile view

// Profile management
router.get("/profile", getUserProfile); // Get own profile
router.put("/profile", updateProfile); // Update profile
router.get("/refresh", refreshProfile); // Refresh profile data
router.get("/all", fetchAllUsers); // Fetch all users
router.get("/:id", findUserById); // Find user by ID

// Location management
router.put("/location", updateLocation); // Update location only

// getting personality score
router.post("/personality-score", updatePersonalityScore); // Update profile with personality score

//feedback management
router.get("/feedback/pending", getPendingFeedbacks); // Fetch users with pending feedback (example route)
router.post("/feedback/pending", submitPendingFeedbacks); // Fetch users with pending feedback (example route)

// Account management
router.put("/change-password", changePassword); // Change password
router.put("/deactivate", deactivateAccount); // Deactivate account
router.post("/logout", logoutUser); // Logout user

export default router;
