// File: src/components/members/ChildrenManager.jsx
// A component to manage a member's children (view, add, edit, delete).
import React, { useState } from "react";
import api from "../../services/api";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Modal from "../ui/Modal";
import useToast from "../../hooks/useToast";

const ChildrenManager = ({
  memberId,
  initialChildren = [],
  onChildrenUpdate,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChild, setEditingChild] = useState(null);
  const { addToast } = useToast();

  const openModalForNew = () => {
    setEditingChild(null);
    setIsModalOpen(true);
  };
  const openModalForEdit = (child) => {
    setEditingChild(child);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (childData) => {
    const apiCall = editingChild
      ? api.put(`/members/children/${editingChild.id}`, childData)
      : api.post(`/members/${memberId}/children`, childData);
    try {
      await apiCall;
      addToast(
        `Child record ${editingChild ? "updated" : "added"} successfully!`,
        "success"
      );
      setIsModalOpen(false);
      onChildrenUpdate();
    } catch (err) {
      addToast(
        err.response?.data?.message || "Failed to save child data.",
        "error"
      );
    }
  };

  const handleDelete = async (childId) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await api.delete(`/members/children/${childId}`);
        addToast("Child record deleted.", "success");
        onChildrenUpdate();
      } catch (err) {
        addToast(
          err.response?.data?.message || "Failed to delete child.",
          "error"
        );
      }
    }
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Children Details</h2>
        <Button onClick={openModalForNew}>Add Child</Button>
      </div>
      {initialChildren.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="th">Full Name</th>
                <th className="th">Age</th>
                <th className="th">Gender</th>
                <th className="th">Status</th>
                <th className="th">Course/Occupation</th>
                <th className="th">Telephone</th>
                <th className="th">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {initialChildren.map((child) => (
                <tr key={child.id}>
                  <td className="td">{child.fullName}</td>
                  <td className="td">{child.age}</td>
                  <td className="td capitalize">
                    {child.gender?.toLowerCase()}
                  </td>
                  <td className="td capitalize">
                    {child.status?.toLowerCase()}
                  </td>
                  <td className="td">{child.courseOrOccupation}</td>
                  <td className="td">{child.telephoneNumber}</td>
                  <td className="td">
                    <div className="flex space-x-2">
                      <Button
                        variant="secondary"
                        className="text-xs"
                        onClick={() => openModalForEdit(child)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        className="text-xs"
                        onClick={() => handleDelete(child.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No children recorded for this member.</p>
      )}
      {isModalOpen && (
        <ChildFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleFormSubmit}
          child={editingChild}
        />
      )}
    </Card>
  );
};

const ChildFormModal = ({ isOpen, onClose, onSubmit, child }) => {
  const [formData, setFormData] = useState({
    fullName: child?.fullName || "",
    age: child?.age || "",
    gender: child?.gender || "",
    status: child?.status || "",
    courseOrOccupation: child?.courseOrOccupation || "",
    telephoneNumber: child?.telephoneNumber || "",
  });
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={child ? "Edit Child" : "Add Child"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Full Name *"
          required
          className="input"
        />
        <input
          name="age"
          type="number"
          value={formData.age}
          onChange={handleChange}
          placeholder="Age"
          className="input"
        />
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="input"
        >
          <option value="">Select Gender</option>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
        </select>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="input"
        >
          <option value="">Select Status</option>
          <option value="STUDENT">Student</option>
          <option value="WORKER">Worker</option>
        </select>
        <input
          name="courseOrOccupation"
          value={formData.courseOrOccupation}
          onChange={handleChange}
          placeholder="Course/Occupation"
          className="input"
        />
        <input
          name="telephoneNumber"
          value={formData.telephoneNumber}
          onChange={handleChange}
          placeholder="Telephone (if applicable)"
          className="input"
        />
        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Modal>
  );
};
export default ChildrenManager;
