const { getDB } = require("../../config/db.js");

const getDetailedReport = async (req, res) => {
  try {
    const db = getDB();
    const { role, regionId, districtId, branchId } = req.user;

    // Super Admin optional scope override
    const {
      year,
      region: qRegion,
      district: qDistrict,
      branch: qBranch,
    } = req.query;

    // --------------------------------------------------
    // Effective Scope Resolver (RBAC + optional override)
    // --------------------------------------------------
    const resolveScope = (alias = "m") => {
      const regionCol = `${alias}.regionId`;
      const districtCol = `${alias}.districtId`;
      const branchCol = `${alias}.branchId`;

      if (role !== "SUPER_ADMIN") {
        if (role === "REGION_ADMIN") return [`${regionCol} = ?`, [regionId]];
        if (role === "DISTRICT_ADMIN")
          return [`${districtCol} = ?`, [districtId]];
        if (role === "BRANCH_ADMIN") return [`${branchCol} = ?`, [branchId]];
      }

      if (qBranch) return [`${branchCol} = ?`, [qBranch]];
      if (qDistrict) return [`${districtCol} = ?`, [qDistrict]];
      if (qRegion) return [`${regionCol} = ?`, [qRegion]];

      return ["1=1", []];
    };

    const [scopeFilter, scopeParams] = resolveScope("m");

    /* ======================================================
       TIME-BASED DATA
    ====================================================== */

    const [membershipGrowth] = await db.query(
      `
      SELECT m.joinYear AS year, COUNT(*) AS count
      FROM members m
      WHERE ${scopeFilter} AND m.joinYear IS NOT NULL
      GROUP BY m.joinYear
      ORDER BY m.joinYear
    `,
      scopeParams,
    );

    const [contributionSummary] = await db.query(
      `
      SELECT 
        p.year,
        SUM(p.amount) * 12 AS totalPledged,
        COALESCE(SUM(c.amount), 0) AS totalPaid
      FROM pledges p
      JOIN members m ON p.memberId = m.id
      LEFT JOIN contributions c
        ON c.memberId = m.id AND c.year = p.year
      WHERE ${scopeFilter}
      GROUP BY p.year
      ORDER BY p.year
    `,
      scopeParams,
    );

    let regionContributionSummary = [];

    if (role === "SUPER_ADMIN" && !qDistrict && !qBranch) {
      const [rows] = await db.query(
        `
    SELECT
      p.year,
      r.name AS regionName,
      SUM(p.amount) * 12 AS totalPledged,
      COALESCE(SUM(c.amount), 0) AS totalPaid
    FROM pledges p
    JOIN members m ON p.memberId = m.id
    JOIN regions r ON m.regionId = r.id
    LEFT JOIN contributions c
      ON c.memberId = m.id AND c.year = p.year
    ${qRegion ? "WHERE m.regionId = ?" : ""}
    GROUP BY p.year, r.name
    ORDER BY p.year
    `,
        qRegion ? [qRegion] : [],
      );

      regionContributionSummary = rows;
    }

    let districtContributionSummary = [];

    if (role === "SUPER_ADMIN" && qRegion && !qBranch) {
      const [rows] = await db.query(
        `
    SELECT
      p.year,
      d.name AS districtName,
      SUM(p.amount) * 12 AS totalPledged,
      COALESCE(SUM(c.amount), 0) AS totalPaid
    FROM pledges p
    JOIN members m ON p.memberId = m.id
    JOIN districts d ON m.districtId = d.id
    LEFT JOIN contributions c
      ON c.memberId = m.id AND c.year = p.year
    WHERE m.regionId = ?
    GROUP BY p.year, d.name
    ORDER BY p.year
    `,
        [qRegion],
      );

      districtContributionSummary = rows;
    }

    let branchContributionSummary = [];

    if (role === "SUPER_ADMIN" && qDistrict) {
      const [rows] = await db.query(
        `
    SELECT
      p.year,
      b.name AS branchName,
      SUM(p.amount) * 12 AS totalPledged,
      COALESCE(SUM(c.amount), 0) AS totalPaid
    FROM pledges p
    JOIN members m ON p.memberId = m.id
    JOIN branches b ON m.branchId = b.id
    LEFT JOIN contributions c
      ON c.memberId = m.id AND c.year = p.year
    WHERE m.districtId = ?
    GROUP BY p.year, b.name
    ORDER BY p.year
    `,
        [qDistrict],
      );

      branchContributionSummary = rows;
    }

    // Attendance (YEAR-SCOPED)
    const [attendanceScopeFilter, attendanceScopeParams] = resolveScope("me");

    const attendanceParams = [...attendanceScopeParams];
    let attendanceYearFilter = "";

    if (year) {
      attendanceYearFilter = "AND YEAR(me.meetingDate) = ?";
      attendanceParams.push(year);
    }

    const [attendanceSummaryByYear] = await db.query(
      `
  SELECT 
    YEAR(me.meetingDate) AS year,
    a.status AS name,
    COUNT(*) AS value
  FROM attendance a
  JOIN meetings me ON a.meetingId = me.id
  JOIN members m ON a.memberId = m.id
  WHERE ${attendanceScopeFilter} ${attendanceYearFilter}
  GROUP BY year, a.status
  ORDER BY year
`,
      attendanceParams,
    );

    /* ======================================================
       STATE-BASED DATA (NON-TEMPORAL)
    ====================================================== */

    const [employmentStatus] = await db.query(
      `
      SELECT m.employmentStatus AS name, COUNT(*) AS value
      FROM members m
      WHERE ${scopeFilter}
      GROUP BY m.employmentStatus
    `,
      scopeParams,
    );

    const [genderDistribution] = await db.query(
      `
      SELECT m.gender AS name, COUNT(*) AS value
      FROM members m
      WHERE ${scopeFilter} AND m.gender IS NOT NULL
      GROUP BY m.gender
    `,
      scopeParams,
    );

    const [maritalStatusDistribution] = await db.query(
      `
      SELECT m.maritalStatus AS name, COUNT(*) AS value
      FROM members m
      WHERE ${scopeFilter} AND m.maritalStatus IS NOT NULL
      GROUP BY m.maritalStatus
    `,
      scopeParams,
    );

    const [memberStatus] = await db.query(
      `
      SELECT m.status AS name, COUNT(*) AS value
      FROM members m
      WHERE ${scopeFilter}
      GROUP BY m.status
    `,
      scopeParams,
    );

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
        COUNT(*) AS value
      FROM members m
      WHERE ${scopeFilter} AND m.dateOfBirth IS NOT NULL
      GROUP BY name
      ORDER BY name
    `,
      scopeParams,
    );

    return res.json({
      timeBased: {
        membershipGrowth,
        contributionSummary,
        attendanceSummaryByYear,
        regionContributionSummary,
        districtContributionSummary,
        branchContributionSummary,
      },

      stateBased: {
        employmentStatus,
        genderDistribution,
        maritalStatusDistribution,
        memberStatus,
        ageDistribution,
      },
    });
  } catch (err) {
    console.error("❌ getDetailedReport error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
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
      params,
    );

    // --- Total regions (only visible to Super Admin) ---
    let regionCount = { count: 0 };
    if (role === "SUPER_ADMIN") {
      [[regionCount]] = await db.query(
        "SELECT COUNT(id) AS count FROM regions",
      );
    } else {
      [[regionCount]] = await db.query(
        `SELECT COUNT(DISTINCT r.id) AS count
         FROM regions r
         JOIN members m ON m.regionId = r.id
         WHERE ${filter}`,
        params,
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
      params,
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
      membersByGroupParams,
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
