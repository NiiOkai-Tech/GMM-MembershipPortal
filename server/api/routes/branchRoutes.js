// File: routes/branchRoutes.js
// Defines API endpoints for managing branches.
const express = require("express");
const { protect, admin } = require("../middleware/authMiddleware.js");
const {
  createBranch,
  getBranches,
  getBranchById,
  updateBranch,
  deleteBranch,
} = require("../controllers/branchController.js");

const router = express.Router();

router.route("/").post(protect, admin, createBranch).get(protect, getBranches);
router
  .route("/:id")
  .get(protect, getBranchById)
  .put(protect, admin, updateBranch)
  .delete(protect, admin, deleteBranch);

module.exports = router;
