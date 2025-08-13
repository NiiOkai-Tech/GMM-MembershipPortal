// File: src/pages/MembersPage.jsx
// Main page for viewing and managing members.
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import MembersTable from "../components/members/MembersTable";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import useToast from "../hooks/useToast";
import AuthContext from "../context/AuthContext";

const MembersPage = () => {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();
  const { isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get("/members");
      setMembers(data);
    } catch (err) {
      addToast("Failed to fetch members.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleDeleteMember = async (memberId) => {
    if (
      window.confirm(
        "Are you sure you want to permanently delete this member? This action cannot be undone."
      )
    ) {
      try {
        await api.delete(`/members/${memberId}`);
        addToast("Member deleted successfully.", "success");
        fetchMembers(); // Refresh the list
      } catch (error) {
        addToast(
          error.response?.data?.message || "Failed to delete member.",
          "error"
        );
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Members</h1>
        <Button onClick={() => navigate("/members/new")}>Add New Member</Button>
      </div>

      <Card>
        {isLoading && <p className="text-center py-8">Loading members...</p>}
        {!isLoading && (
          <MembersTable
            members={members}
            isAdmin={isAdmin}
            onDelete={handleDeleteMember}
          />
        )}
      </Card>
    </div>
  );
};

export default MembersPage;
