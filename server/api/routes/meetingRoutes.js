// File: routes/meetingRoutes.js
// Defines API endpoints for meetings and attendance.
const express = require("express");
const { protect } = require("../middleware/authMiddleware.js");
const {
  getMeetings,
  createMeeting,
  getMeetingDetails,
  saveAttendance,
  updateMeeting,
} = require("../controllers/meetingController.js");

const router = express.Router();

router.use(protect);

router.route("/").get(getMeetings).post(createMeeting);
router.route("/:id").get(getMeetingDetails).put(updateMeeting);
router.route("/:id/attendance").post(saveAttendance);

module.exports = router;
