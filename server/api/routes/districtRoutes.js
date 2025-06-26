// File: routes/districtRoutes.js
// NEW FILE: Defines API endpoints for managing districts.

import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  createDistrict,
  getDistricts,
  getDistrictById,
  updateDistrict,
  deleteDistrict,
} from "../controllers/districtController.js";

const router = express.Router();

// Routes for districts
router
  .route("/")
  .post(protect, admin, createDistrict) // Admins can create districts
  .get(protect, getDistricts); // Authenticated users can view districts

router
  .route("/:id")
  .get(protect, getDistrictById)
  .put(protect, admin, updateDistrict) // Admins can update
  .delete(protect, admin, deleteDistrict); // Admins can delete

export default router;
