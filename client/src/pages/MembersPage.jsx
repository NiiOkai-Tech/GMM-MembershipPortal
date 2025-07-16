// File: src/pages/MembersPage.jsx
// Main page for viewing and managing members.
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import MembersTable from "../components/members/MembersTable";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

const MembersPage = () => {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setIsLoading(true);
        const { data } = await api.get("/members");
        setMembers(data);
      } catch (err) {
        setError("Failed to fetch members. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMembers();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Members</h1>
        <Button onClick={() => navigate("/members/new")}>Add New Member</Button>
      </div>
      <Card>
        {isLoading && <p className="text-center py-8">Loading members...</p>}
        {error && <p className="text-center py-8 text-red-500">{error}</p>}
        {!isLoading && !error && <MembersTable members={members} />}
      </Card>
    </div>
  );
};
export default MembersPage;
