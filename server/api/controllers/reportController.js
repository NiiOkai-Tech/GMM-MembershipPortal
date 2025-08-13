// File: controllers/reportController.js
// Contains logic for generating report data.
const { getDB } = require("../../config/db.js");

const buildReportWhereClause = (user, tableAlias = "m") => {
  const conditions = [];
  const params = [];
  const { role, regionId, districtId, branchId } = user;

  switch (role) {
    case "REGION_ADMIN":
      conditions.push(`${tableAlias}.regionId = ?`);
      params.push(regionId);
      break;
    case "DISTRICT_ADMIN":
      conditions.push(`${tableAlias}.districtId = ?`);
      params.push(districtId);
      break;
    case "BRANCH_ADMIN":
      // Use 'id' for branches table, 'branchId' for others
      const idColumn = tableAlias === "b" ? "id" : "branchId";
      conditions.push(`${tableAlias}.${idColumn} = ?`);
      params.push(branchId);
      break;
    case "SUPER_ADMIN":
    default:
      break;
  }

  return {
    clause: conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "",
    params: params,
  };
};

const getDashboardSummary = async (req, res) => {
  try {
    const db = getDB();
    const { clause: memberClause, params: memberParams } =
      buildReportWhereClause(req.user, "m");
    const { clause: branchClause, params: branchParams } =
      buildReportWhereClause(req.user, "b");

    const [[memberCount]] = await db.query(
      `SELECT COUNT(*) as count FROM members m ${memberClause}`,
      memberParams
    );
    const [[regionCount]] = await db.query(
      "SELECT COUNT(*) as count FROM regions"
    );
    const [[branchCount]] = await db.query(
      `SELECT COUNT(*) as count FROM branches b ${branchClause}`,
      branchParams
    );

    let membersByGroupQuery, membersByGroupParams;
    if (req.user.role === "SUPER_ADMIN") {
      membersByGroupQuery = `SELECT r.name, COUNT(m.id) as members FROM members m JOIN regions r ON m.regionId = r.id GROUP BY r.name ORDER BY members DESC`;
      membersByGroupParams = [];
    } else {
      membersByGroupQuery = `SELECT b.name, COUNT(m.id) as members FROM members m JOIN branches b ON m.branchId = b.id ${memberClause} GROUP BY b.name ORDER BY members DESC`;
      membersByGroupParams = memberParams;
    }

    const [membersByGroup] = await db.query(
      membersByGroupQuery,
      membersByGroupParams
    );

    res.json({
      totalMembers: memberCount.count,
      totalRegions: regionCount.count,
      totalBranches: branchCount.count,
      membersByRegion: membersByGroup,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching report summary." });
  }
};

const getDetailedReport = async (req, res) => {
  try {
    const db = getDB();
    const { clause, params } = buildReportWhereClause(req.user, "m");

    const combineClause = (baseQuery, extraCondition) => {
      if (clause) {
        return `${baseQuery} ${clause} AND ${extraCondition}`;
      }
      return `${baseQuery} WHERE ${extraCondition}`;
    };

    const [membershipGrowth] = await db.query(
      combineClause(
        `SELECT joinYear as year, COUNT(id) as count FROM members m`,
        `m.joinYear IS NOT NULL`
      ) + ` GROUP BY joinYear ORDER BY year ASC`,
      params
    );
    const [employmentStatus] = await db.query(
      combineClause(
        `SELECT CASE WHEN isEmployed = 1 THEN 'Employed' ELSE 'Unemployed' END as name, COUNT(id) as value FROM members m`,
        `m.isEmployed IS NOT NULL`
      ) + ` GROUP BY isEmployed`,
      params
    );
    const [genderDistribution] = await db.query(
      combineClause(
        `SELECT gender as name, COUNT(id) as value FROM members m`,
        `m.gender IS NOT NULL`
      ) + ` GROUP BY gender`,
      params
    );
    const [maritalStatusDistribution] = await db.query(
      combineClause(
        `SELECT maritalStatus as name, COUNT(id) as value FROM members m`,
        `m.maritalStatus IS NOT NULL`
      ) + ` GROUP BY maritalStatus`,
      params
    );
    const [childrenStatusDistribution] = await db.query(
      combineClause(
        `SELECT c.status as name, COUNT(c.id) as value FROM children c JOIN members m ON c.memberId = m.id`,
        `c.status IS NOT NULL`
      ) + ` GROUP BY c.status`,
      params
    );
    const [recentMembers] = await db.query(
      `SELECT m.firstName, m.surname, b.name as branchName, m.joinYear FROM members m LEFT JOIN branches b ON m.branchId = b.id ${clause} ORDER BY m.createdAt DESC LIMIT 5`,
      params
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
