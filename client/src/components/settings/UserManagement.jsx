// File: src/components/settings/UserManagement.jsx
// Component for admins to manage executive users.
import React, { useState } from "react";
import { portalUsers } from "../../data/dummyData";
import Card from "../ui/Card";
import Button from "../ui/Button";

const UserManagement = () => {
  const [users, setUsers] = useState(portalUsers);

  const formatRole = (role) =>
    role
      ? role
          .replace("_", " ")
          .toLowerCase()
          .replace(/\b\w/g, (c) => c.toUpperCase())
      : "";

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Manage Portal Users</h2>
        <Button onClick={() => alert("Add user form not implemented.")}>
          Add New User
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="th">Email</th>
              <th className="th">Role</th>
              <th className="th">Scope</th>
              <th className="th">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="td font-medium">{user.email}</td>
                <td className="td">{formatRole(user.role)}</td>
                <td className="td">{user.scope}</td>
                <td className="td">
                  <div className="flex space-x-2">
                    <Button variant="secondary" className="text-xs !py-1 !px-2">
                      Edit
                    </Button>
                    <Button variant="danger" className="text-xs !py-1 !px-2">
                      Deactivate
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default UserManagement;
