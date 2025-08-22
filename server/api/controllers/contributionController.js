// File: controllers/contributionController.js
// Contains logic for managing pledges and contributions.
const { getDB } = require("../../config/db.js");

const getContributionSheet = async (req, res) => {
  const { year } = req.query;
  const { role, branchId, regionId } = req.user;

  if (!year) {
    return res.status(400).json({ message: "Year is required." });
  }

  try {
    const db = getDB();
    let membersQuery = `
            SELECT m.id, m.firstName, m.surname, m.contactNumber, p.amount as pledgedAmount
            FROM members m
            LEFT JOIN pledges p ON m.id = p.memberId AND p.year = ?
        `;
    const params = [year];

    if (role === "BRANCH_ADMIN") {
      membersQuery += " WHERE m.branchId = ?";
      params.push(branchId);
    } else if (role === "REGION_ADMIN") {
      membersQuery += " WHERE m.regionId = ?";
      params.push(regionId);
    }
    // SUPER_ADMIN has no WHERE clause, gets all members

    membersQuery += " ORDER BY m.surname, m.firstName";

    const [members] = await db.query(membersQuery, params);

    const memberIds = members.map((m) => m.id);
    let contributions = [];
    if (memberIds.length > 0) {
      const [contribs] = await db.query(
        "SELECT memberId, month, amount FROM contributions WHERE year = ? AND memberId IN (?)",
        [year, memberIds]
      );
      contributions = contribs;
    }

    const contributionsByMember = contributions.reduce((acc, curr) => {
      if (!acc[curr.memberId]) {
        acc[curr.memberId] = {};
      }
      acc[curr.memberId][curr.month] = curr.amount;
      return acc;
    }, {});

    const sheetData = members.map((member) => ({
      ...member,
      contributions: contributionsByMember[member.id] || {},
    }));

    res.json(sheetData);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error fetching contribution sheet." });
  }
};

const savePledge = async (req, res) => {
  const { memberId, year, amount } = req.body;

  try {
    const db = getDB();
    // Use INSERT ... ON DUPLICATE KEY UPDATE to handle both new and existing pledges
    const sql = `
            INSERT INTO pledges (memberId, year, amount)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE amount = VALUES(amount)
        `;
    await db.query(sql, [memberId, year, amount]);
    res.status(200).json({ message: "Pledge saved successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error saving pledge." });
  }
};

const saveContribution = async (req, res) => {
  const { memberId, year, month, amount } = req.body;

  if (!memberId || !year || !month) {
    return res
      .status(400)
      .json({ message: "Member, year, and month are required." });
  }

  try {
    const db = getDB();
    // If amount is null or 0, delete the record. Otherwise, insert/update.
    if (amount === null || amount === "" || Number(amount) === 0) {
      await db.query(
        "DELETE FROM contributions WHERE memberId = ? AND year = ? AND month = ?",
        [memberId, year, month]
      );
    } else {
      const sql = `
                INSERT INTO contributions (memberId, year, month, amount)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE amount = VALUES(amount)
            `;
      await db.query(sql, [memberId, year, month, amount]);
    }
    res.status(200).json({ message: "Contribution saved successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error saving contribution." });
  }
};

module.exports = { getContributionSheet, savePledge, saveContribution };
