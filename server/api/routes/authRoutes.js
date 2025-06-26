// File: routes/authRoutes.js
// Defines the API endpoints for authentication.

import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
} from "../controllers/authController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// @desc    Register a new user (executive)
// @route   POST /api/auth/register
// @access  Public (for initial setup, can be restricted to Admins later)
router.post("/register", registerUser);

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
router.post("/login", loginUser);

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
router.get("/profile", protect, getUserProfile);

export default router;
