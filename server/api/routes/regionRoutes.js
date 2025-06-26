// File: routes/regionRoutes.js
// Defines the API endpoints for managing regions.

import express from "express";
import {
  createRegion,
  getRegions,
  getRegionById,
  updateRegion,
  deleteRegion,
} from "../controllers/regionController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Route for getting all regions and creating a new one
router
  .route("/")
  .post(protect, admin, createRegion) // Only admins can create
  .get(protect, getRegions); // Any authenticated user can see regions

// Route for getting, updating, and deleting a single region by ID
router
  .route("/:id")
  .get(protect, getRegionById)
  .put(protect, admin, updateRegion) // Only admins can update
  .delete(protect, admin, deleteRegion); // Only admins can delete

export default router;
