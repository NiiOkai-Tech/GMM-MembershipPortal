// File: controllers/meetingController.js
// Contains logic for managing meetings and attendance.
const { getDB } = require("../../config/db.js");

const getMeetings = async (req, res) => {
  const { role, regionId, districtId, branchId: userBranchId } = req.user;
  const db = getDB();

  try {
    let query = `
            SELECT m.id, m.title, m.meetingDate, m.meetingType, 
                   COALESCE(b.name, d.name, r.name) as scopeName
            FROM meetings m
            LEFT JOIN branches b ON m.branchId = b.id
            LEFT JOIN districts d ON m.districtId = d.id
            LEFT JOIN regions r ON m.regionId = r.id
        `;
    const params = [];

    if (role === "REGION_ADMIN") {
      query += " WHERE m.regionId = ?";
      params.push(regionId);
    } else if (role === "DISTRICT_ADMIN") {
      query += " WHERE m.districtId = ?";
      params.push(districtId);
    } else if (role === "BRANCH_ADMIN") {
      query += " WHERE m.branchId = ?";
      params.push(userBranchId);
    }

    query += " ORDER BY m.meetingDate DESC";
    const [meetings] = await db.query(query, params);
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching meetings." });
  }
};

const createMeeting = async (req, res) => {
  const { title, meetingDate, meetingType, regionId, districtId, branchId } =
    req.body;

  if (!title || !meetingDate || !meetingType) {
    return res
      .status(400)
      .json({ message: "Title, date, and meeting type are required." });
  }

  try {
    const db = getDB();
    const [result] = await db.query(
      "INSERT INTO meetings (title, meetingDate, meetingType, regionId, districtId, branchId) VALUES (?, ?, ?, ?, ?, ?)",
      [
        title,
        meetingDate,
        meetingType,
        regionId || null,
        districtId || null,
        branchId || null,
      ]
    );
    res.status(201).json({ id: result.insertId, title, meetingDate });
  } catch (error) {
    res.status(500).json({ message: "Server error creating meeting." });
  }
};

const getMeetingDetails = async (req, res) => {
  const { id } = req.params;
  const {
    role,
    regionId: userRegionId,
    districtId: userDistrictId,
    branchId: userBranchId,
  } = req.user;
  const db = getDB();

  try {
    const [meetings] = await db.query("SELECT * FROM meetings WHERE id = ?", [
      id,
    ]);
    if (meetings.length === 0) {
      return res.status(404).json({ message: "Meeting not found." });
    }
    const meeting = meetings[0];

    let hasAccess = false;
    if (role === "SUPER_ADMIN") hasAccess = true;
    else if (role === "REGION_ADMIN" && meeting.regionId === userRegionId)
      hasAccess = true;
    else if (role === "DISTRICT_ADMIN" && meeting.districtId === userDistrictId)
      hasAccess = true;
    else if (role === "BRANCH_ADMIN" && meeting.branchId === userBranchId)
      hasAccess = true;

    if (!hasAccess) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this meeting." });
    }

    let membersQuery = "SELECT id, firstName, surname FROM members";
    const params = [];
    if (meeting.branchId) {
      membersQuery += " WHERE branchId = ?";
      params.push(meeting.branchId);
    } else if (meeting.districtId) {
      membersQuery += " WHERE districtId = ?";
      params.push(meeting.districtId);
    } else if (meeting.regionId) {
      membersQuery += " WHERE regionId = ?";
      params.push(meeting.regionId);
    }
    membersQuery += " ORDER BY surname, firstName";

    const [members] = await db.query(membersQuery, params);
    const [attendance] = await db.query(
      "SELECT memberId, status FROM attendance WHERE meetingId = ?",
      [id]
    );
    const attendanceMap = new Map(
      attendance.map((a) => [a.memberId, a.status])
    );

    const memberListWithAttendance = members.map((member) => ({
      ...member,
      status: attendanceMap.get(member.id) || "ABSENT",
    }));

    res.json({ meeting, members: memberListWithAttendance });
  } catch (error) {
    res.status(500).json({ message: "Server error fetching meeting details." });
  }
};

const saveAttendance = async (req, res) => {
  const { id } = req.params;
  const { attendanceData } = req.body;

  if (!Array.isArray(attendanceData)) {
    return res.status(400).json({ message: "Invalid data format." });
  }

  const db = getDB();
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query("SET SQL_SAFE_UPDATES = 0;");

    const [meetings] = await connection.query(
      "SELECT id FROM meetings WHERE id = ?",
      [id]
    );
    if (meetings.length === 0) throw new Error("Meeting not found.");

    await connection.query("DELETE FROM attendance WHERE meetingId = ?", [id]);

    if (attendanceData.length > 0) {
      const values = attendanceData.map((item) => [
        id,
        item.memberId,
        item.status,
      ]);
      await connection.query(
        "INSERT INTO attendance (meetingId, memberId, status) VALUES ?",
        [values]
      );
    }

    await connection.query("SET SQL_SAFE_UPDATES = 1;");

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

const updateMeeting = async (req, res) => {
  const { id } = req.params;
  const { title, meetingDate } = req.body;
  const {
    role,
    regionId: userRegionId,
    districtId: userDistrictId,
    branchId: userBranchId,
  } = req.user;

  if (!title || !meetingDate) {
    return res.status(400).json({ message: "Title and date are required." });
  }

  const db = getDB();
  try {
    const [meetings] = await db.query("SELECT * FROM meetings WHERE id = ?", [
      id,
    ]);
    if (meetings.length === 0) {
      return res.status(404).json({ message: "Meeting not found." });
    }
    const meeting = meetings[0];

    let hasAccess = false;
    if (role === "SUPER_ADMIN") hasAccess = true;
    else if (role === "REGION_ADMIN" && meeting.regionId === userRegionId)
      hasAccess = true;
    else if (role === "DISTRICT_ADMIN" && meeting.districtId === userDistrictId)
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

module.exports = {
  getMeetings,
  createMeeting,
  getMeetingDetails,
  saveAttendance,
  updateMeeting,
};
