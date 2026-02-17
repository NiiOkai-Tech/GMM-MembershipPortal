// File: src/components/members/MembersTable.jsx
import React, { useState, useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import Button from "../ui/Button";
import AuthContext from "../../context/AuthContext";

const PAGE_SIZE = 10;

const MembersTable = ({ members, onDelete }) => {
  const { isAdmin } = useContext(AuthContext);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  /**
   * 1️⃣ Filter members (search)
   */
  const filteredMembers = useMemo(() => {
    if (!search.trim()) return members;

    const term = search.toLowerCase();
    return members.filter((m) => {
      return (
        m.id?.toLowerCase().includes(term) ||
        m.firstName?.toLowerCase().includes(term) ||
        m.surname?.toLowerCase().includes(term) ||
        m.contactNumber?.toLowerCase().includes(term) ||
        m.branchName?.toLowerCase().includes(term)
      );
    });
  }, [members, search]);

  /**
   * 2️⃣ Pagination calculations
   */
  const totalPages = Math.ceil(filteredMembers.length / PAGE_SIZE);

  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredMembers.slice(start, end);
  }, [filteredMembers, currentPage]);

  /**
   * Reset to page 1 when search changes
   */
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  if (!members || members.length === 0) {
    return <p className="text-center text-gray-500 py-8">No members found.</p>;
  }

  return (
    <div className="space-y-4">
      {/* 🔍 Search Bar */}
      <input
        type="text"
        placeholder="Search by ID, Name, Contact or Branch..."
        value={search}
        onChange={handleSearchChange}
        className="input w-full md:w-1/3"
      />

      {/* 📋 Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="th">Member ID</th>
              <th className="th">Name</th>
              <th className="th">Branch</th>
              <th className="th">Status</th>
              <th className="th">Contact Number</th>
              <th className="th">Join Year</th>
              <th className="th">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {paginatedMembers.map((member, index) => (
              <tr
                key={member.id}
                className={
                  index % 2 === 0
                    ? "bg-white"
                    : "bg-gray-50 hover:bg-primary-50"
                }
              >
                <td className="td font-mono">{member.id}</td>
                <td className="td font-medium text-gray-900">
                  {member.firstName} {member.surname}
                </td>
                <td className="td">{member.branchName}</td>
                <td className="td">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      member.status === "ACTIVE"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {member.status}
                  </span>
                </td>
                <td className="td">{member.contactNumber}</td>
                <td className="td">{member.joinYear}</td>
                <td className="td">
                  <div className="flex space-x-2">
                    <Link to={`/members/${member.id}`}>
                      <Button
                        variant="secondary"
                        className="text-xs !py-1 !px-2"
                      >
                        View
                      </Button>
                    </Link>

                    <Link to={`/members/${member.id}/edit`}>
                      <Button
                        variant="secondary"
                        className="text-xs !py-1 !px-2"
                      >
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

            {paginatedMembers.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center text-gray-500 py-6">
                  No matching results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 📄 Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-4">
          <Button
            variant="secondary"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Prev
          </Button>

          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>

          <Button
            variant="secondary"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default MembersTable;
