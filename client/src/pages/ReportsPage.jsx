// File: src/pages/ReportsPage.jsx
// A dedicated page for viewing various reports and insights.
import React from "react";
import { dashboardSummary, members } from "../data/dummyData";
import Card from "../components/ui/Card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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

const MembershipGrowthChart = ({ data }) => (
  <Card>
    <h3 className="text-lg font-semibold mb-4">New Members (Last 12 Months)</h3>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="newMembers"
          stroke="#009146"
          strokeWidth={2}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </Card>
);

const MembershipDemographicsChart = ({ data, title }) => {
  const COLORS = ["#009146", "#80c69b", "#e6f4eb"];
  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
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
          {data.slice(0, 5).map((member) => (
            <tr key={member.id}>
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
  const reports = dashboardSummary;
  const recentMembers = [...members].sort((a, b) => b.joinYear - a.joinYear);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Reports & Insights</h1>

      <MembershipGrowthChart data={reports.membershipGrowth} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MembershipDemographicsChart
          data={reports.employmentStatus}
          title="Employment Status"
        />
        <MembershipDemographicsChart
          data={reports.familyParticipation}
          title="Family Participation"
        />
      </div>

      <RecentMembersTable data={recentMembers} />
    </div>
  );
};
export default ReportsPage;
