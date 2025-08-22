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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Meeting Attendance</h1>
        <Button onClick={() => setIsModalOpen(true)}>Create New Meeting</Button>
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
                      <span className="font-medium text-gray-600 capitalize">
                        {meeting.meetingType?.toLowerCase()} Meeting:{" "}
                        {meeting.scopeName}
                      </span>
                    </p>
                  </div>
                  <span className="text-primary-600 font-semibold">
                    Take Attendance &rarr;
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
  const [formData, setFormData] = useState({
    title: "",
    meetingDate: new Date().toISOString().split("T")[0],
    meetingType: "BRANCH",
    regionId: "",
    districtId: "",
    branchId: "",
  });
  const [hierarchy, setHierarchy] = useState({
    regions: [],
    districts: [],
    branches: [],
  });
  const { addToast } = useToast();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        const [regionsRes, districtsRes, branchesRes] = await Promise.all([
          api.get("/regions"),
          api.get("/districts"),
          api.get("/branches"),
        ]);
        setHierarchy({
          regions: regionsRes.data,
          districts: districtsRes.data,
          branches: branchesRes.data,
        });
      } catch (error) {
        addToast("Failed to load hierarchy data.", "error");
      }
    };
    fetchHierarchy();
  }, [addToast]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/meetings", formData);
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

  const canSelect = (level) => {
    if (user.role === "SUPER_ADMIN") return true;
    if (
      user.role === "REGION_ADMIN" &&
      (level === "REGION" || level === "DISTRICT" || level === "BRANCH")
    )
      return true;
    if (
      user.role === "DISTRICT_ADMIN" &&
      (level === "DISTRICT" || level === "BRANCH")
    )
      return true;
    if (user.role === "BRANCH_ADMIN" && level === "BRANCH") return true;
    return false;
  };

  return (
    <Modal isOpen onClose={onClose} title="Create New Meeting">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Meeting Title"
          required
          className="input"
        />
        <input
          name="meetingDate"
          type="date"
          value={formData.meetingDate}
          onChange={handleChange}
          required
          className="input"
        />
        <select
          name="meetingType"
          value={formData.meetingType}
          onChange={handleChange}
          className="input"
        >
          {canSelect("BRANCH") && (
            <option value="BRANCH">Branch Meeting</option>
          )}
          {canSelect("DISTRICT") && (
            <option value="DISTRICT">District Meeting</option>
          )}
          {canSelect("REGION") && (
            <option value="REGION">Region Meeting</option>
          )}
        </select>
        {formData.meetingType === "REGION" && (
          <select
            name="regionId"
            value={formData.regionId}
            onChange={handleChange}
            className="input"
          >
            <option value="">Select Region</option>
            {hierarchy.regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        )}
        {formData.meetingType === "DISTRICT" && (
          <select
            name="districtId"
            value={formData.districtId}
            onChange={handleChange}
            className="input"
          >
            <option value="">Select District</option>
            {hierarchy.districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        )}
        {formData.meetingType === "BRANCH" && (
          <select
            name="branchId"
            value={formData.branchId}
            onChange={handleChange}
            className="input"
          >
            <option value="">Select Branch</option>
            {hierarchy.branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        )}
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
