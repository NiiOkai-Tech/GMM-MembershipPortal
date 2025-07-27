// File: routes/regionRoutes.js
// Defines the API endpoints for managing regions.
const express = require("express");
const {
  createRegion,
  getRegions,
  getRegionById,
  updateRegion,
  deleteRegion,
} = require("../controllers/regionController.js");
const { protect, admin } = require("../middleware/authMiddleware.js");

const router = express.Router();

router.route("/").post(protect, admin, createRegion).get(protect, getRegions);
router
  .route("/:id")
  .get(protect, getRegionById)
  .put(protect, admin, updateRegion)
  .delete(protect, admin, deleteRegion);

module.exports = router;
