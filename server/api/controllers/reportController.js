// controllers/reportController.js
const { getDB } = require("../../config/db.js");

const getDetailedReport = async (req, res) => {
  try {
    const db = getDB();
    const { role, regionId, districtId, branchId } = req.user;

    // Helper for dynamic WHERE filters
    const getScopeFilter = (alias = "m") => {
      if (role === "REGION_ADMIN") return [`${alias}.regionId = ?`, [regionId]];
      if (role === "DISTRICT_ADMIN")
        return [`${alias}.districtId = ?`, [districtId]];
      if (role === "BRANCH_ADMIN") return [`${alias}.branchId = ?`, [branchId]];
      return ["1=1", []]; // Super Admin → no restrictions
    };

    // Membership Growth
    {
      const [filter, params] = getScopeFilter("m");
      const [membershipGrowth] = await db.query(
        `
          SELECT m.joinYear AS year, COUNT(m.id) AS count
          FROM members m
          WHERE ${filter} AND m.joinYear IS NOT NULL
          GROUP BY m.joinYear
          ORDER BY year ASC
        `,
        params
      );

      // Employment Status
      const [employmentStatus] = await db.query(
        `
          SELECT 
            CASE 
              WHEN m.employmentStatus = 'EMPLOYED' THEN 'Employed'
              WHEN m.employmentStatus = 'RETIRED' THEN 'Retired'
              WHEN m.employmentStatus = 'STUDENT' THEN 'Student'
              ELSE 'Unemployed'
            END AS name,
            COUNT(m.id) AS value
          FROM members m
          WHERE ${filter}
          GROUP BY name
        `,
        params
      );

      // Gender Distribution
      const [genderDistribution] = await db.query(
        `
          SELECT m.gender AS name, COUNT(m.id) AS value
          FROM members m
          WHERE ${filter} AND m.gender IS NOT NULL
          GROUP BY m.gender
        `,
        params
      );

      // Marital Status
      const [maritalStatusDistribution] = await db.query(
        `
          SELECT m.maritalStatus AS name, COUNT(m.id) AS value
          FROM members m
          WHERE ${filter} AND m.maritalStatus IS NOT NULL
          GROUP BY m.maritalStatus
        `,
        params
      );

      // Member Status
      const [memberStatus] = await db.query(
        `
          SELECT m.status AS name, COUNT(m.id) AS value
          FROM members m
          WHERE ${filter}
          GROUP BY m.status
        `,
        params
      );

      // Age Distribution
      const [ageDistribution] = await db.query(
        `
          SELECT
            CASE
              WHEN TIMESTAMPDIFF(YEAR, m.dateOfBirth, CURDATE()) <= 18 THEN '0-18'
              WHEN TIMESTAMPDIFF(YEAR, m.dateOfBirth, CURDATE()) BETWEEN 19 AND 35 THEN '19-35'
              WHEN TIMESTAMPDIFF(YEAR, m.dateOfBirth, CURDATE()) BETWEEN 36 AND 50 THEN '36-50'
              WHEN TIMESTAMPDIFF(YEAR, m.dateOfBirth, CURDATE()) BETWEEN 51 AND 65 THEN '51-65'
              ELSE '65+'
            END AS name,
            COUNT(m.id) AS value
          FROM members m
          WHERE ${filter} AND m.dateOfBirth IS NOT NULL
          GROUP BY name
          ORDER BY name
        `,
        params
      );

      // Recent Members
      const [recentMembers] = await db.query(
        `
          SELECT m.firstName, m.surname, b.name AS branchName, m.joinYear
          FROM members m
          LEFT JOIN branches b ON m.branchId = b.id
          WHERE ${filter}
          ORDER BY m.createdAt DESC
          LIMIT 5
        `,
        params
      );

      // Contributions + Pledges (multi-year summary)
      let contributionsQuery = `
        SELECT 
          p.year,
          SUM(p.amount) * 12 AS totalPledged,
          (
            SELECT SUM(c.amount)
            FROM contributions c
            JOIN members m_inner ON c.memberId = m_inner.id
            WHERE c.year = p.year
      `;
      const innerParams = [];
      const outerParams = [];

      // inner filter (for subquery)
      if (role === "REGION_ADMIN") {
        contributionsQuery += ` AND m_inner.regionId = ?`;
        innerParams.push(regionId);
      } else if (role === "DISTRICT_ADMIN") {
        contributionsQuery += ` AND m_inner.districtId = ?`;
        innerParams.push(districtId);
      } else if (role === "BRANCH_ADMIN") {
        contributionsQuery += ` AND m_inner.branchId = ?`;
        innerParams.push(branchId);
      }

      contributionsQuery += `
          ) AS totalPaid
        FROM pledges p
        JOIN members m ON p.memberId = m.id
      `;

      // outer filter
      if (role === "REGION_ADMIN") {
        contributionsQuery += ` WHERE m.regionId = ?`;
        outerParams.push(regionId);
      } else if (role === "DISTRICT_ADMIN") {
        contributionsQuery += ` WHERE m.districtId = ?`;
        outerParams.push(districtId);
      } else if (role === "BRANCH_ADMIN") {
        contributionsQuery += ` WHERE m.branchId = ?`;
        outerParams.push(branchId);
      }

      contributionsQuery += `
        GROUP BY p.year
        ORDER BY p.year ASC
      `;

      const [contributionSummary] = await db.query(contributionsQuery, [
        ...innerParams,
        ...outerParams,
      ]);

      // Attendance Summary
      const [attendanceSummary] = await db.query(
        `
          SELECT a.status AS name, COUNT(a.id) AS value
          FROM attendance a
          JOIN members m ON a.memberId = m.id
          WHERE ${filter}
          GROUP BY a.status
        `,
        params
      );

      // ✅ Final JSON output
      return res.json({
        membershipGrowth,
        employmentStatus,
        genderDistribution,
        maritalStatusDistribution,
        memberStatus,
        ageDistribution,
        recentMembers,
        contributionSummary,
        attendanceSummary,
      });
    }
  } catch (error) {
    console.error("❌ Error in getDetailedReport:", error);
    res.status(500).json({
      message: "Server error fetching detailed report.",
      error: error.message,
    });
  }
};

const getDashboardSummary = async (req, res) => {
  try {
    const db = getDB();
    const { role, regionId, districtId, branchId } = req.user;

    // --- Role-based scope helper ---
    const getScopeFilter = (alias = "m") => {
      if (role === "REGION_ADMIN") return [`${alias}.regionId = ?`, [regionId]];
      if (role === "DISTRICT_ADMIN")
        return [`${alias}.districtId = ?`, [districtId]];
      if (role === "BRANCH_ADMIN") return [`${alias}.branchId = ?`, [branchId]];
      return ["1=1", []]; // SUPER_ADMIN
    };

    const [filter, params] = getScopeFilter("m");

    // --- Total members ---
    const [[memberCount]] = await db.query(
      `SELECT COUNT(m.id) AS count FROM members m WHERE ${filter}`,
      params
    );

    // --- Total regions (only visible to Super Admin) ---
    let regionCount = { count: 0 };
    if (role === "SUPER_ADMIN") {
      [[regionCount]] = await db.query(
        "SELECT COUNT(id) AS count FROM regions"
      );
    } else {
      [[regionCount]] = await db.query(
        `SELECT COUNT(DISTINCT r.id) AS count
         FROM regions r
         JOIN members m ON m.regionId = r.id
         WHERE ${filter}`,
        params
      );
    }

    // --- Total branches (scoped to user role) ---
    const [[branchCount]] = await db.query(
      `
        SELECT COUNT(DISTINCT b.id) AS count
        FROM branches b
        JOIN members m ON m.branchId = b.id
        WHERE ${filter}
      `,
      params
    );

    // --- Members by group (dynamic depending on role) ---
    let membersByGroupQuery = "";
    let membersByGroupParams = [];

    if (role === "SUPER_ADMIN") {
      membersByGroupQuery = `
        SELECT r.name AS name, COUNT(m.id) AS members
        FROM members m
        JOIN regions r ON m.regionId = r.id
        GROUP BY r.name
        ORDER BY members DESC
      `;
    } else if (role === "REGION_ADMIN") {
      membersByGroupQuery = `
        SELECT d.name AS name, COUNT(m.id) AS members
        FROM members m
        JOIN districts d ON m.districtId = d.id
        WHERE ${filter}
        GROUP BY d.name
        ORDER BY members DESC
      `;
      membersByGroupParams = params;
    } else {
      // District/Branch Admin → Group by Branch
      membersByGroupQuery = `
        SELECT b.name AS name, COUNT(m.id) AS members
        FROM members m
        JOIN branches b ON m.branchId = b.id
        WHERE ${filter}
        GROUP BY b.name
        ORDER BY members DESC
      `;
      membersByGroupParams = params;
    }

    const [membersByGroup] = await db.query(
      membersByGroupQuery,
      membersByGroupParams
    );

    // --- Return unified dashboard response ---
    res.json({
      totalMembers: memberCount.count,
      totalRegions: regionCount.count,
      totalBranches: branchCount.count,
      membersByGroup,
    });
  } catch (error) {
    console.error("❌ Error in getDashboardSummary:", error);
    res.status(500).json({
      message: "Server error fetching report summary.",
      error: error.message,
    });
  }
};

module.exports = { getDetailedReport, getDashboardSummary };
