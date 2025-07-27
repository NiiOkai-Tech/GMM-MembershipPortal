// File: routes/memberRoutes.js
// Defines API endpoints for managing members.
const express = require("express");
const { protect } = require("../middleware/authMiddleware.js");
const {
  createMember,
  getMembers,
  getMemberById,
  updateMember,
  deleteMember,
} = require("../controllers/memberController.js");
const {
  addChild,
  getChildrenForMember,
  updateChild,
  deleteChild,
} = require("../controllers/childController.js");

const router = express.Router();

router.use(protect);
router.route("/").post(createMember).get(getMembers);
router.route("/:id").get(getMemberById).put(updateMember).delete(deleteMember);
router.route("/:memberId/children").post(addChild).get(getChildrenForMember);
router.route("/children/:childId").put(updateChild).delete(deleteChild);

module.exports = router;
