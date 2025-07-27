// File: src/components/settings/ProfileSettings.jsx
// Component for the user to change their password.
import React, { useState } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import useToast from "../../hooks/useToast";
import api from "../../services/api";

const ProfileSettings = () => {
  const { addToast } = useToast();
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      addToast("New passwords do not match.", "error");
      return;
    }
    setIsLoading(true);
    try {
      await api.put("/users/change-password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      addToast("Password changed successfully!", "success");
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      addToast(
        error.response?.data?.message || "Failed to change password.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="text-xl font-bold mb-4">Change Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Current Password
          </label>
          <input
            type="password"
            name="currentPassword"
            value={passwords.currentPassword}
            onChange={handleChange}
            required
            className="input mt-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            New Password
          </label>
          <input
            type="password"
            name="newPassword"
            value={passwords.newPassword}
            onChange={handleChange}
            required
            className="input mt-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Confirm New Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={passwords.confirmPassword}
            onChange={handleChange}
            required
            className="input mt-1"
          />
        </div>
        <div className="pt-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ProfileSettings;
