// File: routes/memberRoutes.js
// Defines API endpoints for managing members.

import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createMember,
  getMembers,
  getMemberById,
  updateMember,
  deleteMember,
} from "../controllers/memberController.js";
import {
  addChild,
  getChildrenForMember,
  updateChild,
  deleteChild,
} from "../controllers/childController.js";
const router = express.Router();

// All member routes are protected
router.use(protect);

router.route("/").post(createMember).get(getMembers);

router.route("/:id").get(getMemberById).put(updateMember).delete(deleteMember);

// Routes for a member's children
router.route("/:memberId/children").post(addChild).get(getChildrenForMember);

// Routes for a specific child
router.route("/children/:childId").put(updateChild).delete(deleteChild);

export default router;
