// File: routes/authRoutes.js
// Defines the API endpoints for authentication.
const express = require("express");
const {
  // registerUser,
  loginUser,
  getUserProfile,
} = require("../controllers/authController.js");
const { protect, admin } = require("../middleware/authMiddleware.js");

const router = express.Router();

// router.post("/register", protect, admin, registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);

module.exports = router;
