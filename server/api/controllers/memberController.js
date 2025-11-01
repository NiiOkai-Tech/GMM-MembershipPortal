// File: controllers/memberController.js
// Handles CRUD for members with correct employment + ID type structure

const { getDB } = require("../../config/db.js");
const { generateMemberId } = require("../utils/generateUniqueId.js");
const path = require("path");

/** ================= Helper: Role-based Access Filter ================= */
const buildAccessControlClause = (user) => {
  const conditions = [];
  const params = [];

  switch (user.role) {
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
    case "SUPER_ADMIN":
      break;
    default:
      conditions.push("1=0");
  }

  return {
    clause: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "",
    params,
  };
};

/** ================= Create Member ================= */
const createMember = async (req, res) => {
  const db = getDB();
  const connection = await db.getConnection();

  try {
    const {
      firstName,
      otherNames,
      surname,
      dateOfBirth, // dd/mm/yyyy from UI
      residentialAddress,
      contactNumber,
      regionId,
      districtId,
      branchId,
      joinYear,
      employmentStatus,
      employedInstitution,
      employedProfession,
      nationalIdType,
      nationalIdNumber,
      parentMemberId,
      gender,
      maritalStatus,
      status,
      monthlyInfaqPledge,
      children,
      wives,
      husband,
    } = req.body;

    if (
      !firstName ||
      !surname ||
      !contactNumber ||
      !residentialAddress ||
      !gender ||
      !maritalStatus ||
      !regionId ||
      !branchId ||
      !joinYear
    ) {
      return res.status(400).json({ message: "Required fields are missing!" });
    }

    await connection.beginTransaction();

    const newId = await generateMemberId(regionId, districtId, branchId);

    const pictureUrl = req.file
      ? path.join("/uploads", req.file.filename).replace(/\\/g, "/")
      : null;

    const mysqlDOB = dateOfBirth
      ? dateOfBirth.split("/").reverse().join("-")
      : null;

    const parsedChildren = children ? JSON.parse(children) : [];
    const parsedWives = wives ? JSON.parse(wives) : [];
    const parsedHusband = husband ? JSON.parse(husband) : null;

    // ✅ Insert Member
    await connection.query(
      `INSERT INTO members (
        id, firstName, otherNames, surname, dateOfBirth, residentialAddress,
        contactNumber, regionId, districtId, branchId, joinYear,
        employmentStatus, employedInstitution, employedProfession,
        parentMemberId,
        gender, nationalIdType, nationalIdNumber,
        maritalStatus, status, pictureUrl
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newId,
        firstName,
        otherNames,
        surname,
        mysqlDOB,
        residentialAddress,
        contactNumber,
        regionId,
        districtId || null,
        branchId,
        joinYear,
        employmentStatus || "UNEMPLOYED",
        employedInstitution || null,
        employedProfession || null,
        parentMemberId || null,
        gender,
        nationalIdType === "" ? null : nationalIdType,
        nationalIdNumber === "" ? null : nationalIdNumber,
        maritalStatus,
        status || "ACTIVE",
        pictureUrl,
      ]
    );

    // ✅ Insert Children Structured
    for (const child of parsedChildren) {
      await connection.query(
        `INSERT INTO children (
          memberId, fullName, age, gender, phone, type,
          studentSchool, studentLevel,
          employedInstitution, employedProfession
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newId,
          child.fullName || null,
          child.age || null,
          child.gender || null,
          child.phone || null,
          child.type || "NONE",
          child.studentSchool || null,
          child.studentLevel || null,
          child.employedInstitution || null,
          child.employedProfession || null,
        ]
      );
    }

    // ✅ Insert Wives - For Male
    if (gender === "MALE" && maritalStatus === "MARRIED") {
      for (const wife of parsedWives) {
        await connection.query(
          `INSERT INTO wives (memberId, fullName, age, occupation, contactNumber)
           VALUES (?, ?, ?, ?, ?)`,
          [
            newId,
            wife.fullName,
            wife.age || null,
            wife.occupation || null,
            wife.contactNumber || null,
          ]
        );
      }
    }

    // ✅ Insert Husband - For Female
    if (gender === "FEMALE" && maritalStatus === "MARRIED" && parsedHusband) {
      await connection.query(
        `INSERT INTO husbands (memberId, fullName, age, occupation, contactNumber)
         VALUES (?, ?, ?, ?, ?)`,
        [
          newId,
          parsedHusband.fullName,
          parsedHusband.age || null,
          parsedHusband.occupation || null,
          parsedHusband.contactNumber || null,
        ]
      );
    }

    // ✅ Insert Pledge
    if (monthlyInfaqPledge && monthlyInfaqPledge > 0) {
      await connection.query(
        `INSERT INTO pledges (memberId, year, amount)
         VALUES (?, YEAR(CURDATE()), ?)
         ON DUPLICATE KEY UPDATE amount = VALUES(amount)`,
        [newId, monthlyInfaqPledge]
      );
    }

    await connection.commit();
    res.status(201).json({ id: newId, ...req.body });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: "Error creating member" });
  } finally {
    connection.release();
  }
};

/** ================= Get All Members ================= */
const getMembers = async (req, res) => {
  try {
    const db = getDB();
    const { clause, params } = buildAccessControlClause(req.user);

    const [members] = await db.query(
      `SELECT m.*, r.name AS regionName, d.name AS districtName, b.name AS branchName
       FROM members m
       LEFT JOIN regions r ON m.regionId = r.id
       LEFT JOIN districts d ON m.districtId = d.id
       LEFT JOIN branches b ON m.branchId = b.id
       ${clause} ORDER BY m.surname, m.firstName`,
      params
    );

    res.json(members);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error loading members" });
  }
};

/** ================= Get Single Member ================= */
const getMemberById = async (req, res) => {
  try {
    const db = getDB();
    const id = req.params.id;

    const [memberData] = await db.query(
      `SELECT m.*, r.name as regionName, d.name as districtName, b.name as branchName FROM members m LEFT JOIN regions r ON m.regionId = r.id LEFT JOIN districts d ON m.districtId = d.id LEFT JOIN branches b ON m.branchId = b.id WHERE m.id = ?`,
      [id]
    );
    if (!memberData.length) {
      return res.status(404).json({ message: "Member not found" });
    }

    const member = memberData[0];

    const [children] = await db.query(
      `SELECT * FROM children WHERE memberId = ? ORDER BY age DESC`,
      [id]
    );
    const [wives] = await db.query(`SELECT * FROM wives WHERE memberId = ?`, [
      id,
    ]);
    const [husband] = await db.query(
      `SELECT * FROM husbands WHERE memberId = ?`,
      [id]
    );
    const [pledge] = await db.query(
      `SELECT amount FROM pledges WHERE memberId = ? AND year = YEAR(CURDATE())`,
      [id]
    );

    member.children = children;
    member.wives = wives;
    member.husband = husband?.[0] || null;
    member.monthlyInfaqPledge = pledge?.[0]?.amount || 0;

    res.json(member);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error loading member" });
  }
};

/** ================= Update Member ================= */
const updateMember = async (req, res) => {
  const db = getDB();
  const connection = await db.getConnection();

  try {
    const id = req.params.id;

    const [exists] = await connection.query(
      "SELECT * FROM members WHERE id = ?",
      [id]
    );
    if (!exists.length)
      return res.status(404).json({ message: "Member not found" });

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
      employmentStatus,
      employedInstitution,
      employedProfession,
      nationalIdType,
      nationalIdNumber,
      parentMemberId,
      gender,
      maritalStatus,
      status,
      monthlyInfaqPledge,
      children,
      wives,
      husband,
    } = req.body;

    const mysqlDOB = dateOfBirth
      ? dateOfBirth.split("/").reverse().join("-")
      : null;
    const pictureUrl = req.file
      ? path.join("/uploads", req.file.filename).replace(/\\/g, "/")
      : req.body.pictureUrl || null;

    const parsedChildren = children ? JSON.parse(children) : [];
    const parsedWives = wives ? JSON.parse(wives) : [];
    const parsedHusband = husband ? JSON.parse(husband) : null;

    await connection.beginTransaction();

    // ✅ Update member record
    await connection.query(
      `UPDATE members SET 
        firstName=?, otherNames=?, surname=?, dateOfBirth=?,
        residentialAddress=?, contactNumber=?, regionId=?, districtId=?, branchId=?, joinYear=?,
        employmentStatus=?, employedInstitution=?, employedProfession=?,
        parentMemberId=?,
        gender=?, nationalIdType=?, nationalIdNumber=?,
        maritalStatus=?, status=?, pictureUrl=?
      WHERE id=?`,
      [
        firstName,
        otherNames,
        surname,
        mysqlDOB,
        residentialAddress,
        contactNumber,
        regionId,
        districtId || null,
        branchId,
        joinYear,
        employmentStatus,
        employedInstitution,
        employedProfession,
        parentMemberId || null,
        gender,
        nationalIdType === "" ? null : nationalIdType,
        nationalIdNumber === "" ? null : nationalIdNumber,
        maritalStatus,
        status,
        pictureUrl,
        id,
      ]
    );

    // ✅ Replace children entries
    await connection.query("DELETE FROM children WHERE memberId = ?", [id]);

    for (const child of parsedChildren) {
      await connection.query(
        `INSERT INTO children (
          memberId, fullName, age, gender, phone, type,
          studentSchool, studentLevel,
          employedInstitution, employedProfession
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          child.fullName,
          child.age || null,
          child.gender || null,
          child.phone || null,
          child.type || "NONE",
          child.studentSchool || null,
          child.studentLevel || null,
          child.employedInstitution || null,
          child.employedProfession || null,
        ]
      );
    }

    // ✅ Replace wives & husband based on gender
    await connection.query("DELETE FROM wives WHERE memberId = ?", [id]);
    await connection.query("DELETE FROM husbands WHERE memberId = ?", [id]);

    if (gender === "MALE" && maritalStatus === "MARRIED") {
      for (const wife of parsedWives) {
        await connection.query(
          `INSERT INTO wives (memberId, fullName, age, occupation, contactNumber)
           VALUES (?, ?, ?, ?, ?)`,
          [id, wife.fullName, wife.age, wife.occupation, wife.contactNumber]
        );
      }
    }

    if (gender === "FEMALE" && maritalStatus === "MARRIED" && parsedHusband) {
      await connection.query(
        `INSERT INTO husbands (memberId, fullName, age, occupation, contactNumber)
         VALUES (?, ?, ?, ?, ?)`,
        [
          id,
          parsedHusband.fullName,
          parsedHusband.age,
          parsedHusband.occupation,
          parsedHusband.contactNumber,
        ]
      );
    }

    // ✅ Upsert pledge
    if (monthlyInfaqPledge && monthlyInfaqPledge > 0) {
      await connection.query(
        `INSERT INTO pledges (memberId, year, amount)
         VALUES (?, YEAR(CURDATE()), ?)
         ON DUPLICATE KEY UPDATE amount=VALUES(amount)`,
        [id, monthlyInfaqPledge]
      );
    }

    await connection.commit();
    res.json({ id, ...req.body });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: "Update failed" });
  } finally {
    connection.release();
  }
};

/** ================= Delete Member ================= */
const deleteMember = async (req, res) => {
  const db = getDB();
  const connection = await db.getConnection();

  try {
    const id = req.params.id;

    const [exists] = await connection.query(
      "SELECT * FROM members WHERE id=?",
      [id]
    );
    if (!exists.length)
      return res.status(404).json({ message: "Member not found" });

    await connection.beginTransaction();

    await connection.query("DELETE FROM children WHERE memberId = ?", [id]);
    await connection.query("DELETE FROM wives WHERE memberId = ?", [id]);
    await connection.query("DELETE FROM husbands WHERE memberId = ?", [id]);
    await connection.query("DELETE FROM pledges WHERE memberId = ?", [id]);
    await connection.query("DELETE FROM contributions WHERE memberId = ?", [
      id,
    ]);
    await connection.query("DELETE FROM members WHERE id = ?", [id]);

    await connection.commit();
    res.json({ message: "Member deleted" });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: "Delete failed" });
  } finally {
    connection.release();
  }
};

module.exports = {
  createMember,
  getMembers,
  getMemberById,
  updateMember,
  deleteMember,
};
