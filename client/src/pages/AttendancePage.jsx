// File: src/pages/AttendancePage.jsx
// Main page for viewing and managing meetings.
import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import useToast from "../hooks/useToast";
import AuthContext from "../context/AuthContext";

const AttendancePage = () => {
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToast } = useToast();
  const { user } = useContext(AuthContext);

  const fetchMeetings = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const { data } = await api.get("/meetings");
      setMeetings(data);
    } catch (error) {
      addToast("Failed to fetch meetings.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [user]);

  const canCreateMeeting = user && user.role === "BRANCH_ADMIN";

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Meeting Attendance</h1>
        {canCreateMeeting && (
          <Button onClick={() => setIsModalOpen(true)}>
            Create New Meeting
          </Button>
        )}
      </div>
      <Card>
        {isLoading ? (
          <p className="text-center text-gray-500 py-8">Loading meetings...</p>
        ) : meetings.length > 0 ? (
          <ul className="space-y-3">
            {meetings.map((meeting) => (
              <li
                key={meeting.id}
                className="p-4 bg-gray-50 rounded-md hover:bg-primary-50 transition-colors"
              >
                <Link
                  to={`/attendance/${meeting.id}`}
                  className="flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold text-lg text-gray-800">
                      {meeting.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(meeting.meetingDate).toLocaleDateString()} -{" "}
                      <span className="font-medium text-gray-600">
                        {meeting.branchName}
                      </span>
                    </p>
                  </div>
                  <span className="text-primary-600 font-semibold">
                    View Attendance &rarr;
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500 py-8">
            No meetings have been created yet.
          </p>
        )}
      </Card>
      {isModalOpen && (
        <CreateMeetingModal
          onClose={() => setIsModalOpen(false)}
          onSave={fetchMeetings}
        />
      )}
    </div>
  );
};

const CreateMeetingModal = ({ onClose, onSave }) => {
  const [title, setTitle] = useState("");
  const [meetingDate, setMeetingDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/meetings", { title, meetingDate });
      addToast("Meeting created successfully!", "success");
      onSave();
      onClose();
    } catch (error) {
      addToast(
        error.response?.data?.message || "Failed to create meeting.",
        "error"
      );
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Create New Meeting">
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
          <Button type="submit">Create Meeting</Button>
        </div>
      </form>
    </Modal>
  );
};

export default AttendancePage;
