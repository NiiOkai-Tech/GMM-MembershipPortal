// File: routes/reportRoutes.js
// Defines API endpoints for generating reports.
const express = require("express");
const { protect } = require("../middleware/authMiddleware.js");
const {
  getDashboardSummary,
  getDetailedReport,
} = require("../controllers/reportController.js");

const {
  exportReportPDF,
  exportFinanceCSV,
} = require("../controllers/reportExportController");

const router = express.Router();

router.use(protect);
router.route("/summary").get(getDashboardSummary);
router.route("/detailed").get(getDetailedReport);
router.route("/export/pdf").get(exportReportPDF);
router.route("/export/csv").get(exportFinanceCSV);

module.exports = router;
