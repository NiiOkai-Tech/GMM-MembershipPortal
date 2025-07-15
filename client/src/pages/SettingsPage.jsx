// File: src/pages/SettingsPage.jsx
// A dedicated page for settings, with tabs for different sections.
import React, { useState, useContext } from "react";
import AuthContext from "../context/AuthContext";
import ProfileSettings from "../components/settings/ProfileSettings";
import UserManagement from "../components/settings/UserManagement";
import DataManagement from "../components/settings/DataManagement";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const { isAdmin } = useContext(AuthContext);

  const tabClass = (tabName) =>
    `px-4 py-2 font-semibold border-b-4 rounded-t-lg transition-colors duration-300 focus:outline-none ${
      activeTab === tabName
        ? "border-primary-500 text-primary-600"
        : "border-transparent text-gray-500 hover:text-gray-700"
    }`;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Settings</h1>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("profile")}
            className={tabClass("profile")}
          >
            My Profile
          </button>
          {isAdmin && (
            <>
              <button
                onClick={() => setActiveTab("users")}
                className={tabClass("users")}
              >
                User Management
              </button>
              <button
                onClick={() => setActiveTab("data")}
                className={tabClass("data")}
              >
                Data Management
              </button>
            </>
          )}
        </nav>
      </div>
      <div className="mt-6">
        {activeTab === "profile" && <ProfileSettings />}
        {isAdmin && activeTab === "users" && <UserManagement />}
        {isAdmin && activeTab === "data" && <DataManagement />}
      </div>
    </div>
  );
};

export default SettingsPage;
