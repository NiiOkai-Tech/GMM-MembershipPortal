// File: src/pages/MemberDetailsPage.jsx
// Fetches and displays details for a single member.
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import ChildrenManager from "../components/members/ChildrenManager";
import useToast from "../hooks/useToast";

const DetailItem = ({ label, value }) => (
  <div>
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="mt-1 text-md text-gray-900 capitalize">{value || "N/A"}</p>
  </div>
);

const MemberDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  const fetchMember = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get(`/members/${id}`);
      setMember(data);
    } catch (err) {
      addToast("Failed to fetch member details.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMember();
  }, [id]);

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
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
            <DetailItem label="Gender" value={member.gender} />
            <DetailItem label="Marital Status" value={member.maritalStatus} />
            <DetailItem label="National ID" value={member.nationalIdNumber} />
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
          onChildrenUpdate={fetchMember}
        />
      </div>
    </div>
  );
};
export default MemberDetailsPage;
