// File: src/pages/MembersPage.jsx
// Main page for viewing and managing members.
import React from "react";
import { useNavigate } from "react-router-dom";
import { members } from "../data/dummyData";
import MembersTable from "../components/members/MembersTable";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

const MembersPage = () => {
  const navigate = useNavigate();
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Members</h1>
        <Button onClick={() => navigate("/members/new")}>Add New Member</Button>
      </div>
      <Card>
        <MembersTable members={members} />
      </Card>
    </div>
  );
};
export default MembersPage;
