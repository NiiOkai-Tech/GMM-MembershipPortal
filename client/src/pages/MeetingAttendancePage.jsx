// File: src/pages/MeetingAttendancePage.jsx
// Page for taking attendance for a specific meeting.
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import useToast from "../hooks/useToast";
import Modal from "../components/ui/Modal";

const MeetingAttendancePage = () => {
  const { id } = useParams();
  const [meeting, setMeeting] = useState(null);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToast } = useToast();

  const fetchMeetingDetails = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get(`/meetings/${id}`);
      setMeeting(data.meeting);
      setMembers(data.members);
    } catch (error) {
      addToast("Failed to fetch meeting details.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetingDetails();
  }, [id]);

  const handleToggleAttendance = (memberId) => {
    setMembers((prevMembers) =>
      prevMembers.map((member) =>
        member.id === memberId
          ? { ...member, attended: !member.attended }
          : member
      )
    );
  };

  const handleSaveAttendance = async () => {
    setIsSaving(true);
    try {
      const attendedMemberIds = members
        .filter((m) => m.attended)
        .map((m) => m.id);
      await api.post(`/meetings/${id}/attendance`, { attendedMemberIds });
      addToast("Attendance saved successfully!", "success");
    } catch (error) {
      addToast("Failed to save attendance.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  if (!meeting)
    return <p className="text-center text-red-500">Meeting not found.</p>;

  const attendedCount = members.filter((m) => m.attended).length;

  return (
    <div>
      <div className="mb-6">
        <Link to="/attendance" className="text-primary-600 hover:underline">
          &larr; Back to Meetings
        </Link>
        <div className="flex justify-between items-start mt-2">
          <div>
            <h1 className="text-3xl font-bold">{meeting.title}</h1>
            <p className="text-gray-500">
              {new Date(meeting.meetingDate).toLocaleDateString()}
            </p>
          </div>
          <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
            Edit Meeting
          </Button>
        </div>
      </div>
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            Branch Members ({attendedCount} / {members.length} Present)
          </h2>
          <Button onClick={handleSaveAttendance} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Attendance"}
          </Button>
        </div>
        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member.id}
              className={`p-3 rounded-md flex items-center justify-between transition-colors ${
                member.attended ? "bg-primary-50" : "bg-gray-50"
              }`}
            >
              <span className="font-medium">{`${member.firstName} ${member.surname}`}</span>
              <input
                type="checkbox"
                checked={member.attended}
                onChange={() => handleToggleAttendance(member.id)}
                className="h-5 w-5 rounded text-primary-600 focus:ring-primary-500 border-gray-300"
              />
            </div>
          ))}
        </div>
      </Card>
      {isModalOpen && (
        <EditMeetingModal
          meeting={meeting}
          onClose={() => setIsModalOpen(false)}
          onSave={fetchMeetingDetails}
        />
      )}
    </div>
  );
};

const EditMeetingModal = ({ meeting, onClose, onSave }) => {
  const [title, setTitle] = useState(meeting.title);
  const [meetingDate, setMeetingDate] = useState(
    new Date(meeting.meetingDate).toISOString().split("T")[0]
  );
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/meetings/${meeting.id}`, { title, meetingDate });
      addToast("Meeting updated successfully!", "success");
      onSave();
      onClose();
    } catch (error) {
      addToast(
        error.response?.data?.message || "Failed to update meeting.",
        "error"
      );
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Edit Meeting">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Meeting Title"
          required
          className="input"
        />
        <input
          name="meetingDate"
          type="date"
          value={meetingDate}
          onChange={(e) => setMeetingDate(e.target.value)}
          required
          className="input"
        />
        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Modal>
  );
};

export default MeetingAttendancePage;
