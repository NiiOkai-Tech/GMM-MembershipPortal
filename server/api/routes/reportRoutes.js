// File: routes/reportRoutes.js
// NEW FILE: Defines API endpoints for generating reports.
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getDashboardSummary } from "../controllers/reportController.js";

const router = express.Router();

// All report routes are protected
router.use(protect);

router.route("/summary").get(getDashboardSummary);

export default router;
