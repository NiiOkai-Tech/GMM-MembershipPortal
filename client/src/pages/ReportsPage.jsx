// File: src/pages/ReportsPage.jsx
// A dedicated page for viewing various reports and insights.
import React, { useState, useEffect } from "react";
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
import api from "../services/api";

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
  const [reports, setReports] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      // This would fetch from a more detailed reports endpoint
      // For now, we simulate it with dummy data
      const dummyReports = {
        membershipGrowth: [
          { month: "Jul 24", newMembers: 15 },
          { month: "Aug 24", newMembers: 12 },
          { month: "Sep 24", newMembers: 20 },
          { month: "Oct 24", newMembers: 25 },
          { month: "Nov 24", newMembers: 18 },
          { month: "Dec 24", newMembers: 30 },
          { month: "Jan 25", newMembers: 22 },
          { month: "Feb 25", newMembers: 28 },
          { month: "Mar 25", newMembers: 35 },
          { month: "Apr 25", newMembers: 40 },
          { month: "May 25", newMembers: 38 },
          { month: "Jun 25", newMembers: 45 },
        ],
        employmentStatus: [
          { name: "Employed", value: 980 },
          { name: "Unemployed", value: 270 },
        ],
        familyParticipation: [
          { name: "Have Children in GMM", value: 620 },
          { name: "No Children in GMM", value: 630 },
        ],
        recentMembers: (await api.get("/members")).data.sort(
          (a, b) => b.joinYear - a.joinYear
        ),
      };
      setReports(dummyReports);
      setIsLoading(false);
    };
    fetchReports();
  }, []);

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );

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
      <RecentMembersTable data={reports.recentMembers} />
    </div>
  );
};
export default ReportsPage;
