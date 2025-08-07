// File: src/pages/ReportsPage.jsx
// A dedicated page for viewing various reports and insights.
import React, { useState, useEffect } from "react";
import Card from "../components/ui/Card";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import api from "../services/api";
import useToast from "../hooks/useToast";

const MembershipGrowthChart = ({ data }) => (
  <Card>
    <h3 className="text-lg font-semibold mb-4">Members By Year</h3>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="count"
          name="Members"
          stroke="#009146"
          strokeWidth={2}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </Card>
);

const MembershipDemographicsChart = ({ data, title }) => {
  const COLORS = ["#009146", "#80c69b", "#e6f4eb", "#007a3b", "#99d2af"];
  if (!data || data.length === 0) {
    return (
      <Card>
        <h3 className="text-lg font-semibold mb-4 capitalize">{title}</h3>
        <p className="text-gray-500">No data available for this chart.</p>
      </Card>
    );
  }
  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4 capitalize">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name}: ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
};

const RecentMembersTable = ({ data }) => (
  <Card>
    <h3 className="text-lg font-semibold mb-4">Recently Joined Members</h3>
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="th">Name</th>
            <th className="th">Branch</th>
            <th className="th">Join Year</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((member, index) => (
            <tr key={`recent-${index}`}>
              <td className="td font-medium">{`${member.firstName} ${member.surname}`}</td>
              <td className="td">{member.branchName}</td>
              <td className="td">{member.joinYear}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);

const ReportsPage = () => {
  const [reports, setReports] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data } = await api.get("/reports/detailed");
        setReports(data);
      } catch (error) {
        addToast("Failed to load report data.", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchReports();
  }, [addToast]);

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Reports & Insights</h1>
      {reports && (
        <>
          <MembershipGrowthChart data={reports.membershipGrowth} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MembershipDemographicsChart
              data={reports.genderDistribution}
              title="Gender Distribution"
            />
            <MembershipDemographicsChart
              data={reports.maritalStatusDistribution}
              title="Marital Status"
            />
            <MembershipDemographicsChart
              data={reports.employmentStatus}
              title="Employment Status"
            />
            <MembershipDemographicsChart
              data={reports.childrenStatusDistribution}
              title="Children's Status (Student/Worker)"
            />
          </div>
          <RecentMembersTable data={reports.recentMembers} />
        </>
      )}
    </div>
  );
};
export default ReportsPage;
