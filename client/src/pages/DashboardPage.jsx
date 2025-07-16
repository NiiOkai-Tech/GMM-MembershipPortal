// File: src/pages/DashboardPage.jsx
// A placeholder for the main dashboard page.
import React, { useState, useEffect } from "react";
import Card from "../components/ui/Card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import api from "../services/api";

const StatCard = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-lg shadow flex items-center">
    <div className="bg-primary-100 text-primary-600 rounded-full p-3 mr-4">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);
const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-4.5"
    />
  </svg>
);
const GlobeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h1a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.7 9a9 9 0 115.6 0M12 21a9 9 0 01-9-9"
    />
  </svg>
);
const BranchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const MembersByRegionChart = ({ data }) => (
  <Card>
    <h3 className="text-lg font-semibold mb-4">Members by Region</h3>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="members" fill="#009146" />
      </BarChart>
    </ResponsiveContainer>
  </Card>
);

const DashboardPage = () => {
  const [summary, setSummary] = useState({
    totalMembers: 0,
    totalRegions: 0,
    totalBranches: 0,
    membersByRegion: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This is where you would fetch data from `/api/reports/summary`
    // For now, we'll use dummy data to simulate the API call.
    const fetchSummary = () => {
      setIsLoading(true);
      // const { data } = await api.get('/reports/summary');
      const data = {
        totalMembers: 1250,
        totalRegions: 8,
        totalBranches: 112,
        membersByRegion: [
          { name: "Greater Accra", members: 450 },
          { name: "Ashanti", members: 320 },
          { name: "Western", members: 180 },
          { name: "Eastern", members: 150 },
          { name: "Central", members: 95 },
          { name: "Volta", members: 55 },
        ],
      };
      setSummary(data);
      setIsLoading(false);
    };
    fetchSummary();
  }, []);

  if (isLoading) return <p>Loading dashboard...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Members"
          value={summary.totalMembers.toLocaleString()}
          icon={<UserIcon />}
        />
        <StatCard
          title="Total Regions"
          value={summary.totalRegions}
          icon={<GlobeIcon />}
        />
        <StatCard
          title="Total Branches"
          value={summary.totalBranches}
          icon={<BranchIcon />}
        />
      </div>
      <div>
        <MembersByRegionChart data={summary.membersByRegion} />
      </div>
    </div>
  );
};
export default DashboardPage;
