// File: src/components/settings/ProfileSettings.jsx
// Component for the user to change their password.
import React from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";

const ProfileSettings = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Password change functionality is not yet implemented.");
  };

  return (
    <Card>
      <h2 className="text-xl font-bold mb-4">Change Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Current Password
          </label>
          <input type="password" required className="input mt-1" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            New Password
          </label>
          <input type="password" required className="input mt-1" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Confirm New Password
          </label>
          <input type="password" required className="input mt-1" />
        </div>
        <div className="pt-2">
          <Button type="submit">Update Password</Button>
        </div>
      </form>
    </Card>
  );
};

export default ProfileSettings;
