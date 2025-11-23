// src/pages/ReportsPage.jsx
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

// ---------- Helpers ----------

const formatEmploymentLabel = (raw) => {
  if (!raw && raw !== 0) return "Unemployed";
  const s = String(raw).toUpperCase();
  if (s === "EMPLOYED") return "Employed";
  if (s === "RETIRED") return "Retired";
  if (s === "STUDENT") return "Student";
  if (s === "UNEMPLOYED") return "Unemployed";
  // fallback: capitalize
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
};

const normalizePieData = (arr) => {
  if (!Array.isArray(arr)) return [];
  const map = new Map();
  arr.forEach((item) => {
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

// Aggregate pledged/paid by a key (regionName, districtName, branchName)
const aggregateByKey = (data, keyField) => {
  if (!Array.isArray(data)) return [];
  const map = new Map();

  data.forEach((row) => {
    const key = row[keyField];
    if (!key) return;
    const existing = map.get(key) || {
      [keyField]: key,
      totalPledged: 0,
      totalPaid: 0,
    };
    existing.totalPledged += Number(row.totalPledged || 0);
    existing.totalPaid += Number(row.totalPaid || 0);
    map.set(key, existing);
  });

  return Array.from(map.values());
};

// ---------- Recharts label for Pie ----------

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

  // Inside numeric value
  const innerR = innerRadius + (outerRadius - innerRadius) / 2;
  const xInner = cx + innerR * Math.cos(-midAngle * RADIAN);
  const yInner = cy + innerR * Math.sin(-midAngle * RADIAN);

  // Outside label
  const outerR = outerRadius + 20;
  const xOuter = cx + outerR * Math.cos(-midAngle * RADIAN);
  const yOuter = cy + outerR * Math.sin(-midAngle * RADIAN);

  const percentageText = `${(percent * 100).toFixed(0)}%`;

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
        {payload.name} ({percentageText})
      </text>
    </g>
  );
};

// ---------- Reusable blocks ----------

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
      <p className="text-gray-500 text-sm">No data available.</p>
    )}
  </div>
);

const ReportStatCard = ({ title, value, subtext, color }) => (
  <div
    className={`bg-white p-6 rounded-lg shadow-md text-center border-t-4 ${
      color || "border-gray-300"
    }`}
  >
    <p className="text-sm font-medium text-gray-500">{title}</p>
    <p className="text-3xl font-bold text-gray-800 my-2">{value}</p>
    {subtext && <p className="text-xs text-gray-400">{subtext}</p>}
  </div>
);

// Simple filter bar for Super Admin
const SuperAdminFilters = ({
  regions,
  districts,
  branches,
  selectedRegion,
  setSelectedRegion,
  selectedDistrict,
  setSelectedDistrict,
  selectedBranch,
  setSelectedBranch,
}) => {
  if (regions.length <= 1 && districts.length <= 1 && branches.length <= 1) {
    return null;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-wrap gap-4 items-center">
      <h3 className="font-semibold text-gray-700">Filter Contributions</h3>

      {regions.length > 1 && (
        <div className="flex flex-col">
          <label className="text-xs text-gray-500 mb-1">Region</label>
          <select
            className="input text-sm"
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
          >
            {regions.map((r) => (
              <option key={r} value={r}>
                {r === "ALL" ? "All Regions" : r}
              </option>
            ))}
          </select>
        </div>
      )}

      {districts.length > 1 && (
        <div className="flex flex-col">
          <label className="text-xs text-gray-500 mb-1">District</label>
          <select
            className="input text-sm"
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
          >
            {districts.map((d) => (
              <option key={d} value={d}>
                {d === "ALL" ? "All Districts" : d}
              </option>
            ))}
          </select>
        </div>
      )}

      {branches.length > 1 && (
        <div className="flex flex-col">
          <label className="text-xs text-gray-500 mb-1">Branch</label>
          <select
            className="input text-sm"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
          >
            {branches.map((b) => (
              <option key={b} value={b}>
                {b === "ALL" ? "All Branches" : b}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

// ---------- Main page ----------

const ReportsPage = () => {
  const { user } = useAuth();
  const role = user?.role;
  const isSuperAdmin = role === "SUPER_ADMIN";

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters for SUPER_ADMIN breakdown charts
  const [selectedRegion, setSelectedRegion] = useState("ALL");
  const [selectedDistrict, setSelectedDistrict] = useState("ALL");
  const [selectedBranch, setSelectedBranch] = useState("ALL");

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const { data } = await api.get("/reports/detailed");
        setReportData(data);
      } catch (error) {
        console.error("Failed to fetch detailed report", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading reports...</div>;
  }

  if (!reportData) {
    return (
      <div className="text-center py-10 text-red-500">
        Failed to load reports.
      </div>
    );
  }

  const {
    membershipGrowth = [],
    employmentStatus = [],
    genderDistribution = [],
    maritalStatusDistribution = [],
    memberStatus = [],
    ageDistribution = [],
    contributionSummary = [],
    attendanceSummary = [],
    regionContributionSummary = [],
    districtContributionSummary = [],
    branchContributionSummary = [],
  } = reportData;

  const employmentPieData = normalizePieData(employmentStatus);

  const latestYearData =
    contributionSummary && contributionSummary.length > 0
      ? contributionSummary[contributionSummary.length - 1]
      : { year: new Date().getFullYear(), totalPledged: 0, totalPaid: 0 };

  const outstanding =
    (latestYearData.totalPledged || 0) - (latestYearData.totalPaid || 0);

  // ---- Aggregated + filtered breakdowns for SUPER_ADMIN ----
  const aggregatedRegionData = aggregateByKey(
    regionContributionSummary,
    "regionName"
  );
  const aggregatedDistrictData = aggregateByKey(
    districtContributionSummary,
    "districtName"
  );
  const aggregatedBranchData = aggregateByKey(
    branchContributionSummary,
    "branchName"
  );

  const regionOptions = [
    "ALL",
    ...Array.from(
      new Set((aggregatedRegionData || []).map((r) => r.regionName))
    ),
  ];
  const districtOptions = [
    "ALL",
    ...Array.from(
      new Set((aggregatedDistrictData || []).map((d) => d.districtName))
    ),
  ];
  const branchOptions = [
    "ALL",
    ...Array.from(
      new Set((aggregatedBranchData || []).map((b) => b.branchName))
    ),
  ];

  const filteredRegionData =
    selectedRegion === "ALL"
      ? aggregatedRegionData
      : aggregatedRegionData.filter((r) => r.regionName === selectedRegion);

  const filteredDistrictData =
    selectedDistrict === "ALL"
      ? aggregatedDistrictData
      : aggregatedDistrictData.filter(
          (d) => d.districtName === selectedDistrict
        );

  const filteredBranchData =
    selectedBranch === "ALL"
      ? aggregatedBranchData
      : aggregatedBranchData.filter((b) => b.branchName === selectedBranch);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Detailed Reports
      </h1>

      {/* Member & Attendance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <CustomPieChart data={memberStatus} title="Member Status" />
        <CustomPieChart data={attendanceSummary} title="Overall Attendance" />
      </div>

      {/* Contributions Overview (scoped by backend to user role) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <ReportStatCard
          title={`Total Pledged (${latestYearData.year})`}
          value={`GH₵ ${formatMoney(latestYearData.totalPledged)}`}
          color="border-yellow-500"
        />
        <ReportStatCard
          title={`Total Paid (${latestYearData.year})`}
          value={`GH₵ ${formatMoney(latestYearData.totalPaid)}`}
          color="border-green-500"
        />
        <ReportStatCard
          title="Outstanding"
          value={`GH₵ ${formatMoney(outstanding)}`}
          color="border-red-500"
        />
      </div>

      {/* Contribution Trends */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Pledges vs Payments (Yearly Trend)
        </h3>
        {contributionSummary && contributionSummary.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={contributionSummary}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={(v) => formatMoney(v)} width={80} />
              <Tooltip formatter={(value) => `GH₵ ${formatMoney(value)}`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="totalPledged"
                stroke="#FFBB28"
                name="Total Pledged"
              />
              <Line
                type="monotone"
                dataKey="totalPaid"
                stroke="#00C49F"
                name="Total Paid"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500">No contribution data available.</p>
        )}
      </div>

      {/* SUPER_ADMIN-only contribution breakdowns with filters */}
      {isSuperAdmin && (
        <>
          <SuperAdminFilters
            regions={regionOptions}
            districts={districtOptions}
            branches={branchOptions}
            selectedRegion={selectedRegion}
            setSelectedRegion={setSelectedRegion}
            selectedDistrict={selectedDistrict}
            setSelectedDistrict={setSelectedDistrict}
            selectedBranch={selectedBranch}
            setSelectedBranch={setSelectedBranch}
          />

          {/* Regional Breakdown */}
          {filteredRegionData && filteredRegionData.length > 0 && (
            <>
              <h2 className="text-xl font-bold mt-4 mb-2">
                Regional Contribution Breakdown
              </h2>
              <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={filteredRegionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="regionName" />
                    <YAxis tickFormatter={(v) => formatMoney(v)} width={80} />
                    <Tooltip formatter={(v) => `GH₵ ${formatMoney(v)}`} />
                    <Legend />
                    <Bar dataKey="totalPledged" fill="#FFBB28" name="Pledged" />
                    <Bar dataKey="totalPaid" fill="#00C49F" name="Paid" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {/* District Breakdown */}
          {filteredDistrictData && filteredDistrictData.length > 0 && (
            <>
              <h2 className="text-xl font-bold mt-4 mb-2">
                District Contribution Breakdown
              </h2>
              <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={filteredDistrictData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="districtName" />
                    <YAxis tickFormatter={(v) => formatMoney(v)} width={80} />
                    <Tooltip formatter={(v) => `GH₵ ${formatMoney(v)}`} />
                    <Legend />
                    <Bar dataKey="totalPledged" fill="#FFBB28" name="Pledged" />
                    <Bar dataKey="totalPaid" fill="#00C49F" name="Paid" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {/* Branch Breakdown */}
          {filteredBranchData && filteredBranchData.length > 0 && (
            <>
              <h2 className="text-xl font-bold mt-4 mb-2">
                Branch Contribution Breakdown
              </h2>
              <div className="bg-white p-4 rounded-lg shadow-md mb-10">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={filteredBranchData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="branchName" />
                    <YAxis tickFormatter={(v) => formatMoney(v)} width={80} />
                    <Tooltip formatter={(v) => `GH₵ ${formatMoney(v)}`} />
                    <Legend />
                    <Bar dataKey="totalPledged" fill="#FFBB28" name="Pledged" />
                    <Bar dataKey="totalPaid" fill="#00C49F" name="Paid" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </>
      )}

      {/* Age Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Age Distribution
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={ageDistribution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#82ca9d" name="Members" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gender & Employment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <CustomPieChart data={genderDistribution} title="Gender Distribution" />
        <CustomPieChart data={employmentPieData} title="Employment Status" />
      </div>

      {/* Membership Growth */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Membership Growth Over Years
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={membershipGrowth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" name="New Members" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Marital Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <CustomPieChart
          data={maritalStatusDistribution}
          title="Marital Status"
        />
      </div>
    </div>
  );
};

export default ReportsPage;
