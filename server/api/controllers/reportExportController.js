const PDFDocument = require("pdfkit");
const { getDB } = require("../../config/db.js");

const buildScopeFilter = (req) => {
  const { role, regionId, districtId, branchId } = req.user;
  const { region, district, branch } = req.query;

  if (role === "REGION_ADMIN") return ["m.regionId = ?", [regionId]];
  if (role === "DISTRICT_ADMIN") return ["m.districtId = ?", [districtId]];
  if (role === "BRANCH_ADMIN") return ["m.branchId = ?", [branchId]];

  if (branch) return ["m.branchId = ?", [branch]];
  if (district) return ["m.districtId = ?", [district]];
  if (region) return ["m.regionId = ?", [region]];

  return ["1=1", []];
};

const exportReportPDF = async (req, res) => {
  try {
    const db = getDB();
    const { year } = req.query;

    const [scopeFilter, scopeParams] = buildScopeFilter(req);

    const [[totals]] = await db.query(
      `
      SELECT 
        SUM(p.amount) * 12 AS totalPledged,
        COALESCE(SUM(c.amount),0) AS totalPaid
      FROM pledges p
      JOIN members m ON p.memberId = m.id
      LEFT JOIN contributions c 
        ON c.memberId = m.id AND c.year = p.year
      WHERE ${scopeFilter}
    `,
      scopeParams,
    );

    const outstanding =
      Number(totals.totalPledged || 0) - Number(totals.totalPaid || 0);

    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=report_${year || "all"}.pdf`,
    );

    doc.pipe(res);

    doc.fontSize(20).text("Membership Financial Report", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Year: ${year || "All Time"}`);
    doc.moveDown();

    doc.text(
      `Total Pledged: GHS ${Number(totals.totalPledged || 0).toFixed(2)}`,
    );
    doc.text(`Total Paid: GHS ${Number(totals.totalPaid || 0).toFixed(2)}`);
    doc.text(`Outstanding: GHS ${outstanding.toFixed(2)}`);

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "PDF export failed" });
  }
};

const exportFinanceCSV = async (req, res) => {
  try {
    const db = getDB();
    const { year } = req.query;

    const [scopeFilter, scopeParams] = buildScopeFilter(req);

    const [rows] = await db.query(
      `
        SELECT 
          m.id AS memberId,
          CONCAT(m.firstName,' ',m.surname) AS name,
          r.name AS region,
          d.name AS district,
          b.name AS branch,
          p.year,
          p.amount * 12 AS pledged,
          COALESCE(SUM(c.amount),0) AS paid
        FROM pledges p
        JOIN members m ON p.memberId = m.id
        JOIN regions r ON m.regionId = r.id
        LEFT JOIN districts d ON m.districtId = d.id
        JOIN branches b ON m.branchId = b.id
        LEFT JOIN contributions c 
          ON c.memberId = m.id AND c.year = p.year
        WHERE ${scopeFilter} ${year ? "AND p.year = ?" : ""}
        GROUP BY m.id, p.year
      `,
      year ? [...scopeParams, year] : scopeParams,
    );

    const header =
      "MemberID,Name,Region,District,Branch,Year,Pledged,Paid,Outstanding\n";

    const csvRows = rows.map((r) =>
      [
        r.memberId,
        `"${r.name}"`,
        `"${r.region}"`,
        `"${r.district || ""}"`,
        `"${r.branch}"`,
        r.year,
        r.pledged,
        r.paid,
        r.pledged - r.paid,
      ].join(","),
    );

    const csv = header + csvRows.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=finance_${year || "all"}.csv`,
    );

    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "CSV export failed" });
  }
};

module.exports = { exportReportPDF, exportFinanceCSV };
