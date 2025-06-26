// File: controllers/childController.js
// Contains logic for managing a member's children.

import { getDB } from "../../config/db.js";

// Helper function to check if a user can access a specific member
const canAccessMember = async (user, memberId) => {
  const db = getDB();
  const [members] = await db.query(
    "SELECT regionId, districtId, branchId FROM members WHERE id = ?",
    [memberId]
  );
  if (members.length === 0) {
    return false; // Member doesn't exist
  }
  const member = members[0];

  switch (user.role) {
    case "SUPER_ADMIN":
      return true;
    case "REGION_ADMIN":
      return member.regionId === user.regionId;
    case "DISTRICT_ADMIN":
      return member.districtId === user.districtId;
    case "BRANCH_ADMIN":
      return member.branchId === user.branchId;
    default:
      return false;
  }
};

// @desc    Add a child to a member
// @route   POST /api/members/:memberId/children
// @access  Private
export const addChild = async (req, res) => {
  const { memberId } = req.params;
  const { fullName, age, schoolOrProfession, telephoneNumber } = req.body;

  if (!fullName) {
    return res.status(400).json({ message: "Child full name is required." });
  }

  try {
    if (!(await canAccessMember(req.user, memberId))) {
      return res
        .status(403)
        .json({ message: "Not authorized to modify this member" });
    }

    const db = getDB();
    const sql =
      "INSERT INTO children (memberId, fullName, age, schoolOrProfession, telephoneNumber) VALUES (?, ?, ?, ?, ?)";
    const params = [
      memberId,
      fullName,
      age || null,
      schoolOrProfession,
      telephoneNumber,
    ];

    const [result] = await db.query(sql, params);
    res.status(201).json({ id: result.insertId, memberId, ...req.body });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error adding child." });
  }
};

// @desc    Get all children for a specific member
// @route   GET /api/members/:memberId/children
// @access  Private
export const getChildrenForMember = async (req, res) => {
  const { memberId } = req.params;

  try {
    if (!(await canAccessMember(req.user, memberId))) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this member's children" });
    }

    const db = getDB();
    const [children] = await db.query(
      "SELECT * FROM children WHERE memberId = ?",
      [memberId]
    );
    res.json(children);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching children." });
  }
};

// @desc    Update a child's details
// @route   PUT /api/members/children/:childId
// @access  Private
export const updateChild = async (req, res) => {
  const { childId } = req.params;
  const { fullName, age, schoolOrProfession, telephoneNumber } = req.body;

  if (!fullName) {
    return res.status(400).json({ message: "Child full name is required." });
  }

  try {
    const db = getDB();
    // First, get the memberId from the child record to check for access
    const [children] = await db.query(
      "SELECT memberId FROM children WHERE id = ?",
      [childId]
    );
    if (children.length === 0) {
      return res.status(404).json({ message: "Child not found" });
    }

    if (!(await canAccessMember(req.user, children[0].memberId))) {
      return res
        .status(403)
        .json({ message: "Not authorized to modify this member's children" });
    }

    const sql =
      "UPDATE children SET fullName = ?, age = ?, schoolOrProfession = ?, telephoneNumber = ? WHERE id = ?";
    const params = [
      fullName,
      age || null,
      schoolOrProfession,
      telephoneNumber,
      childId,
    ];

    await db.query(sql, params);
    res.json({ id: childId, ...req.body });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error updating child." });
  }
};

// @desc    Delete a child
// @route   DELETE /api/members/children/:childId
// @access  Private
export const deleteChild = async (req, res) => {
  const { childId } = req.params;

  try {
    const db = getDB();
    // First, get the memberId from the child record to check for access
    const [children] = await db.query(
      "SELECT memberId FROM children WHERE id = ?",
      [childId]
    );
    if (children.length === 0) {
      return res.status(404).json({ message: "Child not found" });
    }

    if (!(await canAccessMember(req.user, children[0].memberId))) {
      return res
        .status(403)
        .json({ message: "Not authorized to modify this member's children" });
    }

    await db.query("DELETE FROM children WHERE id = ?", [childId]);
    res.json({ message: "Child record removed successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error deleting child." });
  }
};
