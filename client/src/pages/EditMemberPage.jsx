// File: src/pages/EditMemberPage.jsx
// NEW FILE: Page to host the member editing form.
import React from "react";
import { useParams } from "react-router-dom";
import { members } from "../data/dummyData";
import MemberForm from "../components/members/MemberForm";
import Card from "../components/ui/Card";

const EditMemberPage = () => {
  const { id } = useParams();
  const memberToEdit = members.find((m) => m.id === id);
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Edit Member</h1>
      <Card>
        {memberToEdit ? (
          <MemberForm memberToEdit={memberToEdit} />
        ) : (
          <p>Member not found.</p>
        )}
      </Card>
    </div>
  );
};
export default EditMemberPage;
