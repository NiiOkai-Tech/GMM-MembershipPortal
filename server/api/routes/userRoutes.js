const express = require("express");
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
  forgotPassword,
  resetPassword,
} = require("../controllers/userController.js");
const { protect, admin } = require("../middleware/authMiddleware.js");

const router = express.Router();

// ✅ Public — no auth required
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// ✅ Authenticated user
router.put("/change-password", protect, changePassword);

// ✅ Admin only
router.use(protect, admin);
router.route("/").get(getUsers).post(createUser);
router.route("/:id").put(updateUser).delete(deleteUser);

module.exports = router;
