// File: controllers/memberController.js
// Contains logic for member CRUD operations with access control.

import { getDB } from "../../config/db.js";

// Helper function to build the WHERE clause for access control
const buildAccessControlClause = (user) => {
  const conditions = [];
  const params = [];

  switch (user.role) {
    case "SUPER_ADMIN":
      // No restrictions
      break;
    case "REGION_ADMIN":
      conditions.push("m.regionId = ?");
      params.push(user.regionId);
      break;
    case "DISTRICT_ADMIN":
      conditions.push("m.districtId = ?");
      params.push(user.districtId);
      break;
    case "BRANCH_ADMIN":
      conditions.push("m.branchId = ?");
      params.push(user.branchId);
      break;
    default:
      // For safety, default to no access
      conditions.push("1=0");
      break;
  }

  return {
    clause: conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "",
    params: params,
  };
};

// @desc    Create a new member
// @route   POST /api/members
// @access  Private
export const createMember = async (req, res) => {
  const {
    firstName,
    otherNames,
    surname,
    dateOfBirth,
    residentialAddress,
    contactNumber,
    regionId,
    districtId,
    branchId,
    joinYear,
    occupation,
    isEmployed,
    hasChildren,
    numberOfChildren,
    childrenInGMM,
    parentMemberId,
  } = req.body;

  // Basic validation
  if (
    !firstName ||
    !surname ||
    !contactNumber ||
    !regionId ||
    !branchId ||
    !joinYear
  ) {
    return res
      .status(400)
      .json({ message: "Please fill all required fields." });
  }

  const db = getDB();
  try {
    const sql = `INSERT INTO members (firstName, otherNames, surname, dateOfBirth, residentialAddress, contactNumber, regionId, districtId, branchId, joinYear, occupation, isEmployed, hasChildren, numberOfChildren, childrenInGMM, parentMemberId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [
      firstName,
      otherNames,
      surname,
      dateOfBirth,
      residentialAddress,
      contactNumber,
      regionId,
      districtId || null,
      branchId,
      joinYear,
      occupation,
      isEmployed,
      hasChildren,
      numberOfChildren || 0,
      childrenInGMM,
      parentMemberId || null,
    ];

    const [result] = await db.query(sql, params);

    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error creating member." });
  }
};

// @desc    Get members with access control
// @route   GET /api/members
// @access  Private
export const getMembers = async (req, res) => {
  try {
    const db = getDB();
    const user = req.user;

    const { clause, params } = buildAccessControlClause(user);

    const memberQuery = `
            SELECT m.*, r.name as regionName, d.name as districtName, b.name as branchName 
            FROM members m
            LEFT JOIN regions r ON m.regionId = r.id
            LEFT JOIN districts d ON m.districtId = d.id
            LEFT JOIN branches b ON m.branchId = b.id
            ${clause}
            ORDER BY m.surname, m.firstName
        `;

    const [members] = await db.query(memberQuery, params);
    res.json(members);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching members." });
  }
};

// @desc    Get single member by ID with access control
// @route   GET /api/members/:id
// @access  Private
export const getMemberById = async (req, res) => {
  try {
    const db = getDB();
    const user = req.user;
    const memberId = req.params.id;

    const query = `
            SELECT m.*, r.name as regionName, d.name as districtName, b.name as branchName 
            FROM members m
            LEFT JOIN regions r ON m.regionId = r.id
            LEFT JOIN districts d ON m.districtId = d.id
            LEFT JOIN branches b ON m.branchId = b.id
            WHERE m.id = ?
        `;

    const [members] = await db.query(query, [memberId]);

    if (members.length === 0) {
      return res.status(404).json({ message: "Member not found" });
    }

    const member = members[0];

    // Access Control Check
    let hasAccess = false;
    switch (user.role) {
      case "SUPER_ADMIN":
        hasAccess = true;
        break;
      case "REGION_ADMIN":
        hasAccess = member.regionId === user.regionId;
        break;
      case "DISTRICT_ADMIN":
        hasAccess = member.districtId === user.districtId;
        break;
      case "BRANCH_ADMIN":
        hasAccess = member.branchId === user.branchId;
        break;
    }

    if (!hasAccess) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this member" });
    }

    // Fetch children for this member
    const childrenQuery =
      "SELECT * FROM children WHERE memberId = ? ORDER BY age DESC";
    const [children] = await db.query(childrenQuery, [memberId]);

    member.children = children;

    res.json(member);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching member details." });
  }
};

// @desc    Update a member
// @route   PUT /api/members/:id
// @access  Private
export const updateMember = async (req, res) => {
  // First, get the member to ensure the user has access
  try {
    const db = getDB();
    const memberId = req.params.id;
    const [members] = await db.query("SELECT * FROM members WHERE id = ?", [
      memberId,
    ]);

    if (members.length === 0)
      return res.status(404).json({ message: "Member not found" });

    const member = members[0];
    const user = req.user;

    // Access Control Check
    let hasAccess = false;
    if (
      user.role === "SUPER_ADMIN" ||
      (user.role === "REGION_ADMIN" && member.regionId === user.regionId) ||
      (user.role === "DISTRICT_ADMIN" &&
        member.districtId === user.districtId) ||
      (user.role === "BRANCH_ADMIN" && member.branchId === user.branchId)
    ) {
      hasAccess = true;
    }

    if (!hasAccess)
      return res
        .status(403)
        .json({ message: "Not authorized to update this member" });

    // If user has access, proceed with update
    const {
      firstName,
      otherNames,
      surname,
      dateOfBirth,
      residentialAddress,
      contactNumber,
      regionId,
      districtId,
      branchId,
      joinYear,
      occupation,
      isEmployed,
      hasChildren,
      numberOfChildren,
      childrenInGMM,
      parentMemberId,
    } = req.body;

    const sql = `UPDATE members SET 
            firstName = ?, otherNames = ?, surname = ?, dateOfBirth = ?, residentialAddress = ?,
            contactNumber = ?, regionId = ?, districtId = ?, branchId = ?, joinYear = ?, occupation = ?,
            isEmployed = ?, hasChildren = ?, numberOfChildren = ?, childrenInGMM = ?, parentMemberId = ?
            WHERE id = ?`;

    const params = [
      firstName,
      otherNames,
      surname,
      dateOfBirth,
      residentialAddress,
      contactNumber,
      regionId,
      districtId,
      branchId,
      joinYear,
      occupation,
      isEmployed,
      hasChildren,
      numberOfChildren,
      childrenInGMM,
      parentMemberId,
      memberId,
    ];

    await db.query(sql, params);
    res.json({ id: memberId, ...req.body });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error updating member" });
  }
};

// @desc    Delete a member
// @route   DELETE /api/members/:id
// @access  Private
export const deleteMember = async (req, res) => {
  try {
    const db = getDB();
    const memberId = req.params.id;
    const [members] = await db.query("SELECT * FROM members WHERE id = ?", [
      memberId,
    ]);

    if (members.length === 0)
      return res.status(404).json({ message: "Member not found" });

    const member = members[0];
    const user = req.user;

    // Access Control Check
    let hasAccess = false;
    if (
      user.role === "SUPER_ADMIN" ||
      (user.role === "REGION_ADMIN" && member.regionId === user.regionId) ||
      (user.role === "DISTRICT_ADMIN" &&
        member.districtId === user.districtId) ||
      (user.role === "BRANCH_ADMIN" && member.branchId === user.branchId)
    ) {
      hasAccess = true;
    }

    if (!hasAccess)
      return res
        .status(403)
        .json({ message: "Not authorized to delete this member" });

    // Note: Deleting a member will also delete their children due to `ON DELETE CASCADE`
    const [result] = await db.query("DELETE FROM members WHERE id = ?", [
      memberId,
    ]);

    if (result.affectedRows > 0) {
      res.json({ message: "Member removed successfully" });
    } else {
      res.status(404).json({ message: "Member not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error deleting member" });
  }
};
