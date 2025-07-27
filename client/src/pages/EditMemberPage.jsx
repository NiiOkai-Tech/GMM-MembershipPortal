// File: src/pages/EditMemberPage.jsx
// Page to host the member editing form.
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import MemberForm from "../components/members/MemberForm";
import Card from "../components/ui/Card";
import api from "../services/api";
import { useToast } from "../context/ToastContext";

const EditMemberPage = () => {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const { data } = await api.get(`/members/${id}`);
        setMember(data);
      } catch (err) {
        addToast("Failed to load member data.", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMember();
  }, [id, addToast]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Edit Member</h1>
      <Card>
        {isLoading && <p>Loading member data...</p>}
        {!isLoading && member && <MemberForm memberToEdit={member} />}
      </Card>
    </div>
  );
};
export default EditMemberPage;
