import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#AF19FF",
  "#FF4560",
];

// ---------- Helpers (Restored your original logic) ----------

const formatEmploymentLabel = (raw) => {
  if (!raw && raw !== 0) return "Unemployed";
  const s = String(raw).toUpperCase();
  if (s === "EMPLOYED") return "Employed";
  if (s === "RETIRED") return "Retired";
  if (s === "STUDENT") return "Student";
  if (s === "UNEMPLOYED") return "Unemployed";
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
};

const normalizePieData = (arr, targetYear = null) => {
  if (!Array.isArray(arr)) return [];
  const map = new Map();
  arr.forEach((item) => {
    if (targetYear && item.year && String(item.year) !== String(targetYear))
      return;
    const rawName = item.name ?? item.label ?? "";
    const label = formatEmploymentLabel(rawName);
    const value = Number(item.value || 0);
    map.set(label, (map.get(label) || 0) + value);
  });
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
};

const formatMoney = (num) => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(num) || 0);
};

// ---------- Recharts Components (Restored your styling) ----------

const CustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  payload,
  value,
  percent,
}) => {
  const RADIAN = Math.PI / 180;
  const innerR = innerRadius + (outerRadius - innerRadius) / 2;
  const xInner = cx + innerR * Math.cos(-midAngle * RADIAN);
  const yInner = cy + innerR * Math.sin(-midAngle * RADIAN);
  const outerR = outerRadius + 20;
  const xOuter = cx + outerR * Math.cos(-midAngle * RADIAN);
  const yOuter = cy + outerR * Math.sin(-midAngle * RADIAN);

  return (
    <g>
      <text
        x={xInner}
        y={yInner}
        fill="#fff"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
      >
        {value}
      </text>
      <text
        x={xOuter}
        y={yOuter}
        fill="#333"
        textAnchor={xOuter > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={11}
      >
        {payload.name} ({`${(percent * 100).toFixed(0)}%`})
      </text>
    </g>
  );
};

const CustomPieChart = ({ data, title }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
    {data && data.length > 0 ? (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            dataKey="value"
            nameKey="name"
            labelLine={true}
            label={CustomizedLabel}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip formatter={(val) => `${val}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    ) : (
      <p className="text-gray-500 text-sm">No data available for this year.</p>
    )}
  </div>
);

const ReportStatCard = ({ title, value, color }) => (
  <div
    className={`bg-white p-6 rounded-lg shadow-md text-center border-t-4 ${color || "border-gray-300"}`}
  >
    <p className="text-sm font-medium text-gray-500">{title}</p>
    <p className="text-3xl font-bold text-gray-800 my-2">{value}</p>
  </div>
);

const SuperAdminFilters = ({
  regionsData,
  districtsData,
  branchesData,
  years,
  selectedRegion,
  setSelectedRegion,
  selectedDistrict,
  setSelectedDistrict,
  selectedBranch,
  setSelectedBranch,
  selectedYear,
  setSelectedYear,
}) => (
  <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-wrap gap-4 items-center border border-gray-100">
    <h3 className="font-bold text-gray-700 mr-2">Filters</h3>

    <div className="flex flex-col">
      <label className="text-xs text-gray-400 mb-1 font-semibold uppercase">
        Year
      </label>
      <select
        className="border rounded p-1.5 text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
        value={selectedYear}
        onChange={(e) => setSelectedYear(e.target.value)}
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>

    <div className="flex flex-col">
      <label className="text-xs text-gray-400 mb-1 font-semibold uppercase">
        Region
      </label>
      <select
        className="border rounded p-1.5 text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
        value={selectedRegion}
        onChange={(e) => {
          setSelectedRegion(e.target.value);
          setSelectedDistrict("ALL");
          setSelectedBranch("ALL");
        }}
      >
        <option value="ALL">All Regions</option>
        {regionsData.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </select>
    </div>

    <div className="flex flex-col">
      <label className="text-xs text-gray-400 mb-1 font-semibold uppercase">
        District
      </label>
      <select
        className="border rounded p-1.5 text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
        value={selectedDistrict}
        onChange={(e) => {
          setSelectedDistrict(e.target.value);
          setSelectedBranch("ALL");
        }}
      >
        <option value="ALL">All Districts</option>
        {districtsData
          .filter(
            (d) => selectedRegion === "ALL" || d.regionId === selectedRegion,
          )
          .map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
      </select>
    </div>

    <div className="flex flex-col">
      <label className="text-xs text-gray-400 mb-1 font-semibold uppercase">
        Branch
      </label>
      <select
        className="border rounded p-1.5 text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
        value={selectedBranch}
        onChange={(e) => setSelectedBranch(e.target.value)}
      >
        <option value="ALL">All Branches</option>
        {branchesData
          .filter((b) =>
            selectedDistrict === "ALL"
              ? selectedRegion === "ALL" || b.regionId === selectedRegion
              : b.districtId === selectedDistrict,
          )
          .map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
      </select>
    </div>
  </div>
);

// ---------- Reports Page Component ----------

const ReportsPage = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Lists for IDs and Names
  const [regions, setRegions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [branches, setBranches] = useState([]);

  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString(),
  );
  const [selectedRegion, setSelectedRegion] = useState("ALL");
  const [selectedDistrict, setSelectedDistrict] = useState("ALL");
  const [selectedBranch, setSelectedBranch] = useState("ALL");

  // Load filter options
  useEffect(() => {
    if (isSuperAdmin) {
      api.get("/regions").then((res) => setRegions(res.data || []));
      api.get("/districts").then((res) => setDistricts(res.data || []));
      api.get("/branches").then((res) => setBranches(res.data || []));
    }
  }, [isSuperAdmin]);

  const handleExportPDF = async () => {
    try {
      const res = await api.get("/reports/export/pdf", {
        params: {
          year: selectedYear,
          region: selectedRegion !== "ALL" ? selectedRegion : undefined,
          district: selectedDistrict !== "ALL" ? selectedDistrict : undefined,
        },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `report_${selectedYear}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error("PDF export failed", err);
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await api.get("/reports/export/csv", {
        params: {
          year: selectedYear,
          region: selectedRegion !== "ALL" ? selectedRegion : undefined,
          district: selectedDistrict !== "ALL" ? selectedDistrict : undefined,
        },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `finance_${selectedYear}.csv`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error("CSV export failed", err);
    }
  };

  useEffect(() => {
    setLoading(true);
    api
      .get("/reports/detailed", {
        params: {
          year: selectedYear,
          region:
            isSuperAdmin && selectedRegion !== "ALL"
              ? selectedRegion
              : undefined,
          district:
            isSuperAdmin && selectedDistrict !== "ALL"
              ? selectedDistrict
              : undefined,
          branch:
            isSuperAdmin && selectedBranch !== "ALL"
              ? selectedBranch
              : undefined,
        },
      })
      .then((res) => {
        setReportData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedYear, selectedRegion, selectedDistrict, isSuperAdmin]);

  if (loading)
    return (
      <div className="text-center py-10 font-medium">Loading reports...</div>
    );
  if (!reportData)
    return (
      <div className="text-center py-10 text-red-500 font-medium">
        Failed to load reports.
      </div>
    );

  const { timeBased = {}, stateBased = {} } = reportData;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Detailed Reports
      </h1>

      <div className="flex gap-3 mb-6">
        <button
          onClick={handleExportPDF}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow"
        >
          Export PDF
        </button>

        <button
          onClick={handleExportCSV}
          className="bg-green-600 text-white px-4 py-2 rounded shadow"
        >
          Download Finance CSV
        </button>
      </div>

      {isSuperAdmin && (
        <SuperAdminFilters
          regionsData={regions}
          districtsData={districts}
          branchesData={branches}
          years={["2024", "2025", "2026"]}
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
          selectedDistrict={selectedDistrict}
          setSelectedDistrict={setSelectedDistrict}
          selectedBranch={selectedBranch}
          setSelectedBranch={setSelectedBranch}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
        />
      )}

      {/* Pledges Overview */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-6">
          Pledges Overview
        </h3>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <ReportStatCard
            title="Total Pledged"
            value={formatMoney(
              timeBased.contributionSummary?.reduce(
                (a, b) => a + Number(b.totalPledged || 0),
                0,
              ),
            )}
            color="border-yellow-500"
          />

          <ReportStatCard
            title="Total Paid"
            value={formatMoney(
              timeBased.contributionSummary?.reduce(
                (a, b) => a + Number(b.totalPaid || 0),
                0,
              ),
            )}
            color="border-green-500"
          />

          <ReportStatCard
            title="Outstanding"
            value={formatMoney(
              timeBased.contributionSummary?.reduce(
                (a, b) =>
                  a + Number(b.totalPledged || 0) - Number(b.totalPaid || 0),
                0,
              ),
            )}
            color="border-red-500"
          />
        </div>

        {/* All-Time Trend */}
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timeBased.contributionSummary}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={(v) => `GHS ${v}`} />
            <Tooltip formatter={(v) => `GHS ${formatMoney(v)}`} />
            <Legend />
            <Line type="monotone" dataKey="totalPledged" name="Pledged" />
            <Line type="monotone" dataKey="totalPaid" name="Paid" />
          </LineChart>
        </ResponsiveContainer>

        {/* Hierarchical Breakdown */}
        {selectedRegion === "ALL" &&
          timeBased.regionContributionSummary?.length > 0 && (
            <div className="mt-8">
              <h4 className="font-semibold mb-2 text-gray-600">
                Contribution by Region
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={timeBased.regionContributionSummary}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="regionName" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalPledged" name="Pledged" />
                  <Bar dataKey="totalPaid" name="Paid" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

        {selectedRegion !== "ALL" &&
          selectedDistrict === "ALL" &&
          timeBased.districtContributionSummary?.length > 0 && (
            <div className="mt-8">
              <h4 className="font-semibold mb-2 text-gray-600">
                Contribution by District
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={timeBased.districtContributionSummary}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="districtName" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalPledged" name="Pledged" />
                  <Bar dataKey="totalPaid" name="Paid" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

        {selectedDistrict !== "ALL" &&
          timeBased.branchContributionSummary?.length > 0 && (
            <div className="mt-8">
              <h4 className="font-semibold mb-2 text-gray-600">
                Contribution by Branch
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={timeBased.branchContributionSummary}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="branchName" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalPledged" name="Pledged" />
                  <Bar dataKey="totalPaid" name="Paid" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
      </div>

      {/* Contribution Summary (Scoped Year-Based) */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Contribution Summary ({selectedYear})
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={timeBased.contributionSummary?.filter(
              (d) => String(d.year) === selectedYear,
            )}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={(val) => `GHS ${val}`} />
            <Tooltip formatter={(val) => `GHS ${formatMoney(val)}`} />
            <Legend />
            <Bar dataKey="totalPledged" fill="#8884d8" name="Pledged" />
            <Bar dataKey="totalPaid" fill="#82ca9d" name="Paid" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Membership Growth Over Years
        </h3>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timeBased.membershipGrowth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" name="Members" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Charts Grid - Restored your layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CustomPieChart
          title="Member Status"
          data={normalizePieData(stateBased.memberStatus)}
        />
        <CustomPieChart
          title="Attendance Overview"
          data={normalizePieData(
            timeBased.attendanceSummaryByYear,
            selectedYear,
          )}
        />
        <CustomPieChart
          title="Employment Status"
          data={normalizePieData(stateBased.employmentStatus)}
        />
        <CustomPieChart
          title="Gender Distribution"
          data={normalizePieData(stateBased.genderDistribution)}
        />
        <CustomPieChart
          title="Marital Status"
          data={normalizePieData(stateBased.maritalStatusDistribution)}
        />
        <CustomPieChart
          title="Age Groups"
          data={normalizePieData(stateBased.ageDistribution)}
        />
      </div>
    </div>
  );
};

export default ReportsPage;
