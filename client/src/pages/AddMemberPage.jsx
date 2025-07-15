// File: src/pages/AddMemberPage.jsx
// Page to host the member creation form.
import React from "react";
import MemberForm from "../components/members/MemberForm";
import Card from "../components/ui/Card";

const AddMemberPage = () => (
  <div>
    <h1 className="text-3xl font-bold mb-6">Register New Member</h1>
    <Card>
      <MemberForm />
    </Card>
  </div>
);
export default AddMemberPage;
