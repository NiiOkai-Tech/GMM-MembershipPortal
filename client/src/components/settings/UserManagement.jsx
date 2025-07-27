// File: src/components/settings/UserManagement.jsx
// Component for admins to manage executive users.
import React, { useState, useEffect } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import useToast from "../../hooks/useToast";
import api from "../../services/api";
import Modal from "../ui/Modal";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const { addToast } = useToast();

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get("/users");
      setUsers(data);
    } catch (error) {
      addToast("Failed to fetch users.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleModalOpen = (user = null) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setEditingUser(null);
    setIsModalOpen(false);
  };

  const handleUserSave = () => {
    fetchUsers();
    handleModalClose();
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await api.delete(`/users/${userId}`);
        addToast("User deleted successfully", "success");
        fetchUsers();
      } catch (error) {
        addToast(
          error.response?.data?.message || "Failed to delete user.",
          "error"
        );
      }
    }
  };

  const formatRole = (role) =>
    role
      ? role
          .replace("_", " ")
          .toLowerCase()
          .replace(/\b\w/g, (c) => c.toUpperCase())
      : "";

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Manage Portal Users</h2>
        <Button onClick={() => handleModalOpen()}>Add New User</Button>
      </div>
      {isLoading ? (
        <p>Loading users...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="th">Email</th>
                <th className="th">Role</th>
                <th className="th">Scope</th>
                <th className="th">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="td font-medium">{user.email}</td>
                  <td className="td">{formatRole(user.role)}</td>
                  <td className="td">
                    {user.regionId || user.districtId || user.branchId || "All"}
                  </td>
                  <td className="td">
                    <div className="flex space-x-2">
                      <Button
                        variant="secondary"
                        className="text-xs !py-1 !px-2"
                        onClick={() => handleModalOpen(user)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        className="text-xs !py-1 !px-2"
                        onClick={() => handleDelete(user.id)}
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
      )}
      {isModalOpen && (
        <UserFormModal
          user={editingUser}
          onClose={handleModalClose}
          onSave={handleUserSave}
        />
      )}
    </Card>
  );
};

const UserFormModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    email: user?.email || "",
    password: "",
    role: user?.role || "BRANCH_ADMIN",
    regionId: user?.regionId || "",
    districtId: user?.districtId || "",
    branchId: user?.branchId || "",
  });
  const [hierarchy, setHierarchy] = useState({
    regions: [],
    districts: [],
    branches: [],
  });
  const { addToast } = useToast();
  const isEditMode = !!user;

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
    const apiCall = isEditMode
      ? api.put(`/users/${user.id}`, formData)
      : api.post("/users", formData);
    try {
      await apiCall;
      addToast(
        `User ${isEditMode ? "updated" : "created"} successfully!`,
        "success"
      );
      onSave();
    } catch (error) {
      addToast(
        error.response?.data?.message || "Failed to save user.",
        "error"
      );
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEditMode ? "Edit User" : "Add New User"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email Address"
          required
          className="input"
        />
        {!isEditMode && (
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            required
            className="input"
          />
        )}
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="input"
        >
          <option value="BRANCH_ADMIN">Branch Admin</option>
          <option value="DISTRICT_ADMIN">District Admin</option>
          <option value="REGION_ADMIN">Region Admin</option>
          <option value="SUPER_ADMIN">Super Admin</option>
        </select>
        {formData.role === "REGION_ADMIN" && (
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
        {formData.role === "DISTRICT_ADMIN" && (
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
        {formData.role === "BRANCH_ADMIN" && (
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
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Modal>
  );
};

export default UserManagement;
