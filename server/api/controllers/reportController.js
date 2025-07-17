// File: controllers/reportController.js
// Contains logic for generating report data.
import { getDB } from "../../config/db.js";

// @desc    Get dashboard summary statistics
// @route   GET /api/reports/summary
// @access  Private
export const getDashboardSummary = async (req, res) => {
  try {
    const db = getDB();

    // 1. Get total counts
    const [[memberCount]] = await db.query(
      "SELECT COUNT(*) as count FROM members"
    );
    const [[regionCount]] = await db.query(
      "SELECT COUNT(*) as count FROM regions"
    );
    const [[branchCount]] = await db.query(
      "SELECT COUNT(*) as count FROM branches"
    );

    // 2. Get members by region for the chart
    const [membersByRegion] = await db.query(`
            SELECT r.name, COUNT(m.id) as members
            FROM members m
            JOIN regions r ON m.regionId = r.id
            GROUP BY r.name
            ORDER BY members DESC
        `);

    // In a real application, you would add more complex queries here for:
    // - Membership growth over time
    // - Employment status breakdown
    // - Family participation breakdown

    res.json({
      totalMembers: memberCount.count,
      totalRegions: regionCount.count,
      totalBranches: branchCount.count,
      membersByRegion,
      // Add other report data here
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching report summary." });
  }
};
