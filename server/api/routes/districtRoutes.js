// File: routes/districtRoutes.js
// Defines API endpoints for managing districts.
const express = require("express");
const { protect, admin } = require("../middleware/authMiddleware.js");
const {
  createDistrict,
  getDistricts,
  getDistrictById,
  updateDistrict,
  deleteDistrict,
} = require("../controllers/districtController.js");

const router = express.Router();

router
  .route("/")
  .post(protect, admin, createDistrict)
  .get(protect, getDistricts);
router
  .route("/:id")
  .get(protect, getDistrictById)
  .put(protect, admin, updateDistrict)
  .delete(protect, admin, deleteDistrict);

module.exports = router;
