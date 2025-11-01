import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import useToast from "../hooks/useToast";

const DetailItem = ({ label, value }) => (
  <div>
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="mt-1 text-md text-gray-900">
      {value !== undefined && value !== null && value !== "" ? value : "N/A"}
    </p>
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

  const API_URL = "https://api.ghanamuslimmission.net";

  const formatDOB = (dob) => {
    if (!dob) return "N/A";
    const d = new Date(dob);
    return `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1
    ).padStart(2, "0")}/${d.getFullYear()}`;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Member Details</h1>
        <Button onClick={() => navigate(`/members/${id}/edit`)}>
          Edit Member
        </Button>
      </div>

      <div className="space-y-6">
        {/* ---- BASIC DETAILS ---- */}
        <Card>
          <div className="flex items-start space-x-6">
            <img
              src={
                member.pictureUrl
                  ? `${API_URL}${member.pictureUrl}`
                  : `https://ui-avatars.com/api/?name=${member.firstName}+${member.surname}&background=009146&color=fff`
              }
              alt={`${member.firstName} ${member.surname}`}
              className="h-24 w-24 rounded-full object-cover"
            />
            <div>
              <h2 className="text-2xl font-bold">{`${member.firstName} ${member.otherNames} ${member.surname}`}</h2>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  member.status === "ACTIVE"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {member.status}
              </span>
            </div>
          </div>

          <hr className="my-6" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DetailItem label="Member ID" value={member.id} />
            <DetailItem label="Contact Number" value={member.contactNumber} />
            <DetailItem
              label="Date of Birth"
              value={formatDOB(member.dateOfBirth)}
            />
            <DetailItem label="Gender" value={member.gender} />
            <DetailItem label="Marital Status" value={member.maritalStatus} />
            <DetailItem
              label="Employment Status"
              value={member.employmentStatus}
            />
            <DetailItem
              label="National ID Type"
              value={member.nationalIdType}
            />
            <DetailItem
              label="National ID Number"
              value={member.nationalIdNumber}
            />
            <DetailItem label="Join Year" value={member.joinYear} />
            {/* <DetailItem
              label="Parent Member ID"
              value={member.parentMemberId}
            /> */}
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

        {/* ---- HUSBAND for Female Married ---- */}
        {member.maritalStatus === "MARRIED" && member.gender === "FEMALE" && (
          <Card>
            <h3 className="text-xl font-semibold mb-4">Husband Information</h3>
            {member.husband ? (
              <div className="space-y-4">
                <div className="border rounded-md p-3 bg-gray-50">
                  <p className="font-semibold">{member.husband.fullName}</p>
                  <p className="text-sm text-gray-600">
                    Age: {member.husband.age || "N/A"} | Occupation:{" "}
                    {member.husband.occupation || "N/A"} | Contact:{" "}
                    {member.husband.contactNumber || "N/A"}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">No husband records.</p>
            )}
          </Card>
        )}

        {/* ---- WIVES for Male Married ---- */}
        {member.maritalStatus === "MARRIED" && member.gender === "MALE" && (
          <Card>
            <h3 className="text-xl font-semibold mb-4">Wife(s)</h3>
            {member.wives && member.wives.length ? (
              <div className="space-y-4">
                {member.wives.map((wife, idx) => (
                  <div
                    key={wife.id || idx}
                    className="border rounded-md p-3 bg-gray-50"
                  >
                    <p className="font-semibold">{wife.fullName}</p>
                    <p className="text-sm text-gray-600">
                      Age: {wife.age || "N/A"} | Occupation:{" "}
                      {wife.occupation || "N/A"} | Contact:{" "}
                      {wife.contactNumber || "N/A"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No wife records.</p>
            )}
          </Card>
        )}

        {/* ---- CHILDREN DETAILS ---- */}
        {member.children.length ? (
          <Card>
            <h3 className="text-xl font-semibold mb-4">Children</h3>
            {member.children && member.children.length > 0 ? (
              <div className="space-y-4">
                {member.children.map((child, idx) => (
                  <div
                    key={child.id || idx}
                    className="border rounded-md p-3 bg-gray-50"
                  >
                    <p className="font-semibold">{child.fullName}</p>
                    <p className="text-sm text-gray-600">
                      Gender: {child.gender || "N/A"} | Age:{" "}
                      {child.age || "N/A"} | Status: {child.type || "NONE"} |
                      Institution/Work:{" "}
                      {child.studentSchool ||
                        child.employedInstitution ||
                        child.schoolOrProfession ||
                        "N/A"}{" "}
                      | Phone: {child.phone || "N/A"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No children records.</p>
            )}
          </Card>
        ) : null}

        {/* ---- FINANCIAL INFO ---- */}
        <Card>
          <h3 className="text-xl font-semibold mb-4">Financial Commitment</h3>
          <DetailItem
            label="Monthly Infaq Pledge"
            value={
              member.monthlyInfaqPledge
                ? `GHS ${member.monthlyInfaqPledge}`
                : "Not pledged"
            }
          />
        </Card>
      </div>
    </div>
  );
};

export default MemberDetailsPage;
