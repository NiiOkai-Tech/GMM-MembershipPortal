// File: src/pages/DashboardPage.jsx
import React, { useState, useEffect } from "react";
import Card from "../components/ui/Card";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

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

const CTAButton = ({ title, description, icon, onClick, color }) => (
  <button
    onClick={onClick}
    className={`group bg-white border border-gray-100 rounded-xl p-6 flex flex-col items-start shadow hover:shadow-lg transition duration-200 text-left hover:bg-${color}-50`}
  >
    <div
      className={`p-3 rounded-full bg-${color}-100 text-${color}-600 mb-3 group-hover:scale-110 transition`}
    >
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    <p className="text-sm text-gray-500 mt-1">{description}</p>
  </button>
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

const DashboardPage = () => {
  const [summary, setSummary] = useState({
    totalMembers: 0,
    totalRegions: 0,
    totalBranches: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setIsLoading(true);
        const { data } = await api.get("/reports/summary");
        setSummary(data);
      } catch (error) {
        console.error("Failed to fetch dashboard summary:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      {/* CTA Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <CTAButton
          title="View Members"
          description="Browse and manage all registered members"
          // icon={<UserIcon />}
          icon={
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
          }
          onClick={() => navigate("/members")}
          color="primary"
        />
        <CTAButton
          title="Add New Member"
          description="Register a new member into the system"
          icon={
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
                d="M12 4v16m8-8H4"
              />
            </svg>
          }
          onClick={() => navigate("/members/new")}
          color="green"
        />
        <CTAButton
          title="Meeting Attendance"
          description="Manage meeting attendance"
          icon={<BranchIcon />}
          onClick={() => navigate("/attendance")}
          color="blue"
        />
        <CTAButton
          title="Reports"
          description="Access statistical summaries and reports"
          icon={<GlobeIcon />}
          onClick={() => navigate("/reports")}
          color="amber"
        />
      </div>
    </div>
  );
};

export default DashboardPage;
