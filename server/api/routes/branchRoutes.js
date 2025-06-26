// File: routes/branchRoutes.js
// Defines API endpoints for managing branches.

import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  createBranch,
  getBranches,
  getBranchById,
  updateBranch,
  deleteBranch,
} from "../controllers/branchController.js";

const router = express.Router();

// Routes for branches
router
  .route("/")
  .post(protect, admin, createBranch) // Admins can create branches
  .get(protect, getBranches); // Authenticated users can view branches

router
  .route("/:id")
  .get(protect, getBranchById)
  .put(protect, admin, updateBranch) // Admins can update
  .delete(protect, admin, deleteBranch); // Admins can delete

export default router;
