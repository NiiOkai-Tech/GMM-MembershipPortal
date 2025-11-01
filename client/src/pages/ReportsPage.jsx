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

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#AF19FF",
  "#FF4560",
];

const formatEmploymentLabel = (raw) => {
  if (!raw && raw !== 0) return "Unemployed";
  const s = String(raw).toUpperCase();
  if (s === "EMPLOYED" || s === "EMPLOYED".toUpperCase()) return "Employed";
  if (s === "RETIRED") return "Retired";
  if (s === "UNEMPLOYED") return "Unemployed";
  // if backend already returned "Employed", etc.
  if (s === "EMPLOYED".toUpperCase()) return "Employed";
  // fallback: capitalize
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
};

const normalizePieData = (arr) => {
  if (!Array.isArray(arr)) return [];
  // Some endpoints may already return friendly 'name' values;
  // some may return ENUM values. Normalize to friendly labels.
  const map = new Map();
  arr.forEach((item) => {
    const rawName = item.name ?? item.label ?? "";
    const label = formatEmploymentLabel(rawName);
    const value = Number(item.value || 0);
    map.set(label, (map.get(label) || 0) + value);
  });
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
};

// ✅ Custom label renderer for inside value + outside name
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

  // Calculate position for inside value
  const innerR = innerRadius + (outerRadius - innerRadius) / 2;
  const xInner = cx + innerR * Math.cos(-midAngle * RADIAN);
  const yInner = cy + innerR * Math.sin(-midAngle * RADIAN);

  // Calculate position for outside name
  const outerR = outerRadius + 20;
  const xOuter = cx + outerR * Math.cos(-midAngle * RADIAN);
  const yOuter = cy + outerR * Math.sin(-midAngle * RADIAN);

  const percentageText = `${(percent * 100).toFixed(0)}%`;

  return (
    <g>
      {/* Inside Value */}
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

      {/* Outside Name */}
      <text
        x={xOuter}
        y={yOuter}
        fill="#333"
        textAnchor={xOuter > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={11}
      >
        {payload.name} {"(" + percentageText + ")"}
      </text>
    </g>
  );
};

const CustomPieChart = ({ data, title }) => {
  return (
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
};

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

const ReportsPage = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const {
    membershipGrowth,
    employmentStatus,
    genderDistribution,
    maritalStatusDistribution,
    memberStatus,
    ageDistribution,
    contributionSummary,
    attendanceSummary,
  } = reportData || {};

  // Normalize employment data to friendly labels
  const employmentPieData = normalizePieData(employmentStatus);

  // Derive latest year for stat cards
  const latestYearData =
    contributionSummary && contributionSummary.length > 0
      ? contributionSummary[contributionSummary.length - 1]
      : { year: new Date().getFullYear(), totalPledged: 0, totalPaid: 0 };

  const outstanding =
    (latestYearData.totalPledged || 0) - (latestYearData.totalPaid || 0);

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

      {/* Contributions Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <ReportStatCard
          title={`Total Pledged (${latestYearData.year})`}
          value={`GH₵ ${parseFloat(latestYearData.totalPledged || 0).toFixed(
            2
          )}`}
          color="border-yellow-500"
        />
        <ReportStatCard
          title={`Total Paid (${latestYearData.year})`}
          value={`GH₵ ${parseFloat(latestYearData.totalPaid || 0).toFixed(2)}`}
          color="border-green-500"
        />
        <ReportStatCard
          title="Outstanding"
          value={`GH₵ ${parseFloat(outstanding).toFixed(2)}`}
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
              <YAxis />
              <Tooltip />
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
