// File: routes/reportRoutes.js
// Defines API endpoints for generating reports.
const express = require("express");
const { protect } = require("../middleware/authMiddleware.js");
const { getDashboardSummary } = require("../controllers/reportController.js");

const router = express.Router();

router.use(protect);
router.route("/summary").get(getDashboardSummary);

module.exports = router;
