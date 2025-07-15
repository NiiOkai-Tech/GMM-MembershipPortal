// File: src/pages/MemberDetailsPage.jsx
// Fetches and displays details for a single member.
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { members } from "../data/dummyData";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import ChildrenManager from "../components/members/ChildrenManager";

const DetailItem = ({ label, value }) => (
  <div>
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="mt-1 text-md text-gray-900">{value || "N/A"}</p>
  </div>
);

const MemberDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const member = members.find((m) => m.id === id);

  if (!member)
    return <p className="text-center text-red-500">Member not found.</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Member Details</h1>
        <Button onClick={() => navigate(`/members/${id}/edit`)}>
          Edit Member
        </Button>
      </div>
      <div className="space-y-6">
        <Card>
          <h2 className="text-xl font-bold mb-4">{`${member.firstName} ${member.surname}`}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DetailItem label="Member ID" value={member.id} />
            <DetailItem
              label="Full Name"
              value={`${member.firstName} ${member.otherNames || ""} ${
                member.surname
              }`}
            />
            <DetailItem label="Contact Number" value={member.contactNumber} />
            <DetailItem
              label="Date of Birth"
              value={
                member.dateOfBirth
                  ? new Date(member.dateOfBirth).toLocaleDateString()
                  : "N/A"
              }
            />
            <DetailItem label="Join Year" value={member.joinYear} />
            <DetailItem label="Occupation" value={member.occupation} />
            <DetailItem
              label="Employed"
              value={member.isEmployed ? "Yes" : "No"}
            />
            <DetailItem
              label="Parent Member ID"
              value={member.parentMemberId}
            />
          </div>
          <hr className="my-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DetailItem label="Region" value={member.regionName} />
            <DetailItem label="District" value={member.districtName} />
            <DetailItem label="Branch" value={member.branchName} />
          </div>
          <hr className="my-6" />
          <DetailItem
            label="Residential Address"
            value={member.residentialAddress}
          />
        </Card>
        <ChildrenManager
          memberId={member.id}
          initialChildren={member.children}
        />
      </div>
    </div>
  );
};
export default MemberDetailsPage;
