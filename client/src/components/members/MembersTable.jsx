// File: src/components/members/MembersTable.jsx
// NEW FILE: A table to display a list of members.
import React from "react";
import { Link } from "react-router-dom";
import Button from "../ui/Button";

const MembersTable = ({ members, isAdmin, onDelete }) => {
  if (!members || members.length === 0) {
    return <p className="text-center text-gray-500 py-8">No members found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="th">Member ID</th>
            <th className="th">Name</th>
            <th className="th">Branch</th>
            <th className="th">Contact Number</th>
            <th className="th">Join Year</th>
            <th className="th">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {members.map((member, index) => (
            <tr
              key={member.id}
              className={
                index % 2 === 0 ? "bg-white" : "bg-gray-50 hover:bg-primary-50"
              }
            >
              <td className="td font-mono">{member.id}</td>
              <td className="td font-medium text-gray-900">{`${member.firstName} ${member.surname}`}</td>
              <td className="td">{member.branchName}</td>
              <td className="td">{member.contactNumber}</td>
              <td className="td">{member.joinYear}</td>
              <td className="td">
                <div className="flex space-x-2">
                  <Link to={`/members/${member.id}`}>
                    <Button variant="secondary" className="text-xs !py-1 !px-2">
                      View
                    </Button>
                  </Link>
                  <Link to={`/members/${member.id}/edit`}>
                    <Button variant="secondary" className="text-xs !py-1 !px-2">
                      Edit
                    </Button>
                  </Link>
                  {isAdmin && (
                    <Button
                      variant="danger"
                      className="text-xs !py-1 !px-2"
                      onClick={() => onDelete(member.id)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MembersTable;
