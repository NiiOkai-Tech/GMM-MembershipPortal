// File: routes/memberRoutes.js
// Defines API endpoints for managing members.
const express = require("express");
const { protect } = require("../middleware/authMiddleware.js");
const upload = require("../middleware/uploadMiddleware.js");
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
router.route("/").post(upload.single("picture"), createMember).get(getMembers);
router
  .route("/:id")
  .get(getMemberById)
  .put(upload.single("picture"), updateMember)
  .delete(deleteMember);
router.route("/:memberId/children").post(addChild).get(getChildrenForMember);
router.route("/children/:childId").put(updateChild).delete(deleteChild);

module.exports = router;
