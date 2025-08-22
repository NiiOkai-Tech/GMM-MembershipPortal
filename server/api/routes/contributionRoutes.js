// File: routes/contributionRoutes.js
// Defines API endpoints for managing contributions.
const express = require("express");
const { protect } = require("../middleware/authMiddleware.js");
const {
  getContributionSheet,
  savePledge,
  saveContribution,
} = require("../controllers/contributionController.js");

const router = express.Router();

router.use(protect);

router.route("/sheet").get(getContributionSheet);
router.route("/pledge").post(savePledge);
router.route("/payment").post(saveContribution);

module.exports = router;
