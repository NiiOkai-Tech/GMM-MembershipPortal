// File: controllers/meetingController.js
// Contains logic for managing meetings and attendance.
const { getDB } = require("../../config/db.js");

const getMeetings = async (req, res) => {
  const { role, regionId, branchId: userBranchId } = req.user;
  const { branchId: queryBranchId } = req.query;
  const db = getDB();

  try {
    let query =
      "SELECT m.id, m.title, m.meetingDate, b.name as branchName FROM meetings m JOIN branches b ON m.branchId = b.id";
    const params = [];

    if (role === "SUPER_ADMIN") {
      if (queryBranchId) {
        query += " WHERE m.branchId = ?";
        params.push(queryBranchId);
      }
    } else if (role === "REGION_ADMIN") {
      query += " WHERE b.regionId = ?";
      params.push(regionId);
      if (queryBranchId) {
        query += " AND m.branchId = ?";
        params.push(queryBranchId);
      }
    } else if (role === "BRANCH_ADMIN") {
      query += " WHERE m.branchId = ?";
      params.push(userBranchId);
    } else {
      return res.json([]);
    }

    query += " ORDER BY m.meetingDate DESC";
    const [meetings] = await db.query(query, params);
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching meetings." });
  }
};

const createMeeting = async (req, res) => {
  const { title, meetingDate } = req.body;
  const { branchId } = req.user;

  if (!title || !meetingDate) {
    return res.status(400).json({ message: "Title and date are required." });
  }
  if (!branchId) {
    return res
      .status(403)
      .json({ message: "Only branch-level users can create meetings." });
  }

  try {
    const db = getDB();
    const [result] = await db.query(
      "INSERT INTO meetings (title, meetingDate, branchId) VALUES (?, ?, ?)",
      [title, meetingDate, branchId]
    );
    res.status(201).json({ id: result.insertId, title, meetingDate, branchId });
  } catch (error) {
    res.status(500).json({ message: "Server error creating meeting." });
  }
};

const updateMeeting = async (req, res) => {
  const { id } = req.params;
  const { title, meetingDate } = req.body;
  const { role, regionId, branchId: userBranchId } = req.user;

  if (!title || !meetingDate) {
    return res.status(400).json({ message: "Title and date are required." });
  }

  const db = getDB();
  try {
    const [meetings] = await db.query(
      "SELECT m.branchId, b.regionId as meetingRegionId FROM meetings m JOIN branches b ON m.branchId = b.id WHERE m.id = ?",
      [id]
    );
    if (meetings.length === 0) {
      return res.status(404).json({ message: "Meeting not found." });
    }
    const meeting = meetings[0];

    let hasAccess = false;
    if (role === "SUPER_ADMIN") hasAccess = true;
    else if (role === "REGION_ADMIN" && meeting.meetingRegionId === regionId)
      hasAccess = true;
    else if (role === "BRANCH_ADMIN" && meeting.branchId === userBranchId)
      hasAccess = true;

    if (!hasAccess) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this meeting." });
    }

    await db.query(
      "UPDATE meetings SET title = ?, meetingDate = ? WHERE id = ?",
      [title, meetingDate, id]
    );
    res.json({ message: "Meeting updated successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error updating meeting." });
  }
};

const getMeetingDetails = async (req, res) => {
  const { id } = req.params;
  const { role, regionId, branchId: userBranchId } = req.user;
  const db = getDB();

  try {
    const [meetings] = await db.query(
      "SELECT m.*, b.regionId as meetingRegionId FROM meetings m JOIN branches b ON m.branchId = b.id WHERE m.id = ?",
      [id]
    );
    if (meetings.length === 0) {
      return res.status(404).json({ message: "Meeting not found." });
    }
    const meeting = meetings[0];

    let hasAccess = false;
    if (role === "SUPER_ADMIN") hasAccess = true;
    else if (role === "REGION_ADMIN" && meeting.meetingRegionId === regionId)
      hasAccess = true;
    else if (role === "BRANCH_ADMIN" && meeting.branchId === userBranchId)
      hasAccess = true;

    if (!hasAccess) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this meeting." });
    }

    const [members] = await db.query(
      "SELECT id, firstName, surname FROM members WHERE branchId = ? ORDER BY surname, firstName",
      [meeting.branchId]
    );
    const [attendance] = await db.query(
      "SELECT memberId FROM attendance WHERE meetingId = ?",
      [id]
    );
    const attendedMemberIds = new Set(attendance.map((a) => a.memberId));
    const memberListWithAttendance = members.map((member) => ({
      ...member,
      attended: attendedMemberIds.has(member.id),
    }));

    res.json({ meeting, members: memberListWithAttendance });
  } catch (error) {
    res.status(500).json({ message: "Server error fetching meeting details." });
  }
};

const saveAttendance = async (req, res) => {
  const { id } = req.params;
  const { attendedMemberIds } = req.body;
  const { role, regionId, branchId: userBranchId } = req.user;

  if (!Array.isArray(attendedMemberIds)) {
    return res.status(400).json({ message: "Invalid data format." });
  }

  const db = getDB();
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();
    const [meetings] = await connection.query(
      "SELECT m.branchId, b.regionId as meetingRegionId FROM meetings m JOIN branches b ON m.branchId = b.id WHERE m.id = ?",
      [id]
    );
    if (meetings.length === 0) throw new Error("Meeting not found.");
    const meeting = meetings[0];

    let hasAccess = false;
    if (role === "SUPER_ADMIN") hasAccess = true;
    else if (role === "REGION_ADMIN" && meeting.meetingRegionId === regionId)
      hasAccess = true;
    else if (role === "BRANCH_ADMIN" && meeting.branchId === userBranchId)
      hasAccess = true;

    if (!hasAccess)
      throw new Error("Not authorized to save attendance for this meeting.");

    await connection.query("DELETE FROM attendance WHERE meetingId = ?", [id]);
    if (attendedMemberIds.length > 0) {
      const values = attendedMemberIds.map((memberId) => [id, memberId]);
      await connection.query(
        "INSERT INTO attendance (meetingId, memberId) VALUES ?",
        [values]
      );
    }
    await connection.commit();
    res.json({ message: "Attendance saved successfully." });
  } catch (error) {
    await connection.rollback();
    res
      .status(500)
      .json({ message: error.message || "Server error saving attendance." });
  } finally {
    connection.release();
  }
};

module.exports = {
  getMeetings,
  createMeeting,
  updateMeeting,
  getMeetingDetails,
  saveAttendance,
};
