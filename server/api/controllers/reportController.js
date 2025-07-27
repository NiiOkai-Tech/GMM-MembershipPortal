// File: controllers/reportController.js
// Contains logic for generating report data.
const { getDB } = require("../../config/db.js");

const getDashboardSummary = async (req, res) => {
  try {
    const db = getDB();
    const [[memberCount]] = await db.query(
      "SELECT COUNT(*) as count FROM members"
    );
    const [[regionCount]] = await db.query(
      "SELECT COUNT(*) as count FROM regions"
    );
    const [[branchCount]] = await db.query(
      "SELECT COUNT(*) as count FROM branches"
    );
    const [membersByRegion] = await db.query(
      `SELECT r.name, COUNT(m.id) as members FROM members m JOIN regions r ON m.regionId = r.id GROUP BY r.name ORDER BY members DESC`
    );
    res.json({
      totalMembers: memberCount.count,
      totalRegions: regionCount.count,
      totalBranches: branchCount.count,
      membersByRegion,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error fetching report summary." });
  }
};

module.exports = { getDashboardSummary };
