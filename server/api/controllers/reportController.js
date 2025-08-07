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

const getDetailedReport = async (req, res) => {
  try {
    const db = getDB();

    const [membershipGrowth] = await db.query(`
            SELECT joinYear as year, COUNT(id) as count 
            FROM members 
            WHERE joinYear IS NOT NULL
            GROUP BY joinYear 
            ORDER BY year ASC
        `);

    const [employmentStatus] = await db.query(`
            SELECT CASE WHEN isEmployed = 1 THEN 'Employed' ELSE 'Unemployed' END as name, COUNT(id) as value 
            FROM members 
            WHERE isEmployed IS NOT NULL
            GROUP BY isEmployed
        `);

    const [genderDistribution] = await db.query(
      `SELECT gender as name, COUNT(id) as value FROM members WHERE gender IS NOT NULL GROUP BY gender`
    );

    const [maritalStatusDistribution] = await db.query(
      `SELECT maritalStatus as name, COUNT(id) as value FROM members WHERE maritalStatus IS NOT NULL GROUP BY maritalStatus`
    );

    const [childrenStatusDistribution] = await db.query(
      `SELECT status as name, COUNT(id) as value FROM children WHERE status IS NOT NULL GROUP BY status`
    );

    const [recentMembers] = await db.query(
      `SELECT m.firstName, m.surname, b.name as branchName, m.joinYear FROM members m LEFT JOIN branches b ON m.branchId = b.id ORDER BY m.createdAt DESC LIMIT 5`
    );

    res.json({
      membershipGrowth,
      employmentStatus,
      genderDistribution,
      maritalStatusDistribution,
      childrenStatusDistribution,
      recentMembers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching detailed report." });
  }
};

module.exports = { getDashboardSummary, getDetailedReport };
