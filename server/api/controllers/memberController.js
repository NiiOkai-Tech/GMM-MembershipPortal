// File: controllers/memberController.js
// Contains logic for member CRUD operations with access control.
const { getDB } = require("../../config/db.js");
const { generateMemberId } = require("../utils/generateUniqueId.js");

const buildAccessControlClause = (user) => {
  const conditions = [];
  const params = [];
  switch (user.role) {
    case "SUPER_ADMIN":
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
      conditions.push("1=0");
      break;
  }
  return {
    clause: conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "",
    params,
  };
};

const createMember = async (req, res) => {
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
    gender,
    nationalIdNumber,
    maritalStatus,
  } = req.body;

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
    const newId = await generateMemberId(
      regionId,
      districtId,
      branchId,
      joinYear
    );
    const sql = `INSERT INTO members (id, firstName, otherNames, surname, dateOfBirth, residentialAddress, contactNumber, regionId, districtId, branchId, joinYear, occupation, isEmployed, hasChildren, numberOfChildren, childrenInGMM, parentMemberId, gender, nationalIdNumber, maritalStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [
      newId,
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
      gender,
      nationalIdNumber,
      maritalStatus,
    ];

    await db.query(sql, params);

    res.status(201).json({ id: newId, ...req.body });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error creating member." });
  }
};

const getMembers = async (req, res) => {
  try {
    const db = getDB();
    const { clause, params } = buildAccessControlClause(req.user);
    const query = `SELECT m.*, r.name as regionName, d.name as districtName, b.name as branchName FROM members m LEFT JOIN regions r ON m.regionId = r.id LEFT JOIN districts d ON m.districtId = d.id LEFT JOIN branches b ON m.branchId = b.id ${clause} ORDER BY m.surname, m.firstName`;
    const [members] = await db.query(query, params);
    res.json(members);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching members." });
  }
};

const getMemberById = async (req, res) => {
  try {
    const db = getDB();
    const memberQuery = `SELECT m.*, r.name as regionName, d.name as districtName, b.name as branchName FROM members m LEFT JOIN regions r ON m.regionId = r.id LEFT JOIN districts d ON m.districtId = d.id LEFT JOIN branches b ON m.branchId = b.id WHERE m.id = ?`;
    const [members] = await db.query(memberQuery, [req.params.id]);
    if (members.length === 0)
      return res.status(404).json({ message: "Member not found" });
    const member = members[0];
    let hasAccess = false;
    switch (req.user.role) {
      case "SUPER_ADMIN":
        hasAccess = true;
        break;
      case "REGION_ADMIN":
        hasAccess = member.regionId === req.user.regionId;
        break;
      case "DISTRICT_ADMIN":
        hasAccess = member.districtId === req.user.districtId;
        break;
      case "BRANCH_ADMIN":
        hasAccess = member.branchId === req.user.branchId;
        break;
    }
    if (!hasAccess)
      return res
        .status(403)
        .json({ message: "Not authorized to view this member" });
    const [children] = await db.query(
      "SELECT * FROM children WHERE memberId = ? ORDER BY age DESC",
      [req.params.id]
    );
    member.children = children;
    res.json(member);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching member details." });
  }
};

const updateMember = async (req, res) => {
  try {
    const db = getDB();
    const [members] = await db.query("SELECT * FROM members WHERE id = ?", [
      req.params.id,
    ]);
    if (members.length === 0)
      return res.status(404).json({ message: "Member not found" });
    const member = members[0];
    let hasAccess = false;
    if (
      req.user.role === "SUPER_ADMIN" ||
      (req.user.role === "REGION_ADMIN" &&
        member.regionId === req.user.regionId) ||
      (req.user.role === "DISTRICT_ADMIN" &&
        member.districtId === req.user.districtId) ||
      (req.user.role === "BRANCH_ADMIN" &&
        member.branchId === req.user.branchId)
    )
      hasAccess = true;
    if (!hasAccess)
      return res
        .status(403)
        .json({ message: "Not authorized to update this member" });

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
      gender,
      nationalIdNumber,
      maritalStatus,
    } = req.body;

    if (!branchId) {
      return res
        .status(400)
        .json({ message: "Branch is a required field and cannot be empty." });
    }

    const sql = `UPDATE members SET 
            firstName = ?, otherNames = ?, surname = ?, dateOfBirth = ?, residentialAddress = ?,
            contactNumber = ?, regionId = ?, districtId = ?, branchId = ?, joinYear = ?, occupation = ?,
            isEmployed = ?, hasChildren = ?, numberOfChildren = ?, childrenInGMM = ?, parentMemberId = ?,
            gender = ?, nationalIdNumber = ?, maritalStatus = ?
            WHERE id = ?`;

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
      numberOfChildren,
      childrenInGMM,
      parentMemberId || null,
      gender,
      nationalIdNumber,
      maritalStatus,
      req.params.id,
    ];

    await db.query(sql, params);
    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error updating member" });
  }
};

const deleteMember = async (req, res) => {
  try {
    const db = getDB();
    const [members] = await db.query("SELECT * FROM members WHERE id = ?", [
      req.params.id,
    ]);
    if (members.length === 0)
      return res.status(404).json({ message: "Member not found" });
    const member = members[0];
    let hasAccess = false;
    if (
      req.user.role === "SUPER_ADMIN" ||
      (req.user.role === "REGION_ADMIN" &&
        member.regionId === req.user.regionId) ||
      (req.user.role === "DISTRICT_ADMIN" &&
        member.districtId === req.user.districtId) ||
      (req.user.role === "BRANCH_ADMIN" &&
        member.branchId === req.user.branchId)
    )
      hasAccess = true;
    if (!hasAccess)
      return res
        .status(403)
        .json({ message: "Not authorized to delete this member" });
    const [result] = await db.query("DELETE FROM members WHERE id = ?", [
      req.params.id,
    ]);
    if (result.affectedRows > 0)
      res.json({ message: "Member removed successfully" });
    else res.status(404).json({ message: "Member not found" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error deleting member" });
  }
};

module.exports = {
  createMember,
  getMembers,
  getMemberById,
  updateMember,
  deleteMember,
};
