// File: routes/userRoutes.js
// Defines API endpoints for managing executive users.
const express = require("express");
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
} = require("../controllers/userController.js");
const { protect, admin } = require("../middleware/authMiddleware.js");

const router = express.Router();

// This route is for the logged-in user to change their own password
router.put("/change-password", protect, changePassword);

// These routes are for admins to manage all users
router.use(protect, admin);
router.route("/").get(getUsers).post(createUser);
router.route("/:id").put(updateUser).delete(deleteUser);

module.exports = router;
