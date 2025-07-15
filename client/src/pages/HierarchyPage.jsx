// File: src/pages/HierarchyPage.jsx
// Manages the display of Regions, Districts, and Branches via tabs.
import React, { useState } from "react";
import RegionManager from "../components/hierarchy/RegionManager";
import DistrictManager from "../components/hierarchy/DistrictManager";
import BranchManager from "../components/hierarchy/BranchManager";

const HierarchyPage = () => {
  const [activeTab, setActiveTab] = useState("regions");
  const tabClass = (tabName) =>
    `px-4 py-2 font-semibold border-b-4 rounded-t-lg transition-colors duration-300 focus:outline-none ${
      activeTab === tabName
        ? "border-primary-500 text-primary-600"
        : "border-transparent text-gray-500 hover:text-gray-700"
    }`;
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Organizational Hierarchy
      </h1>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("regions")}
            className={tabClass("regions")}
          >
            Regions
          </button>
          <button
            onClick={() => setActiveTab("districts")}
            className={tabClass("districts")}
          >
            Districts
          </button>
          <button
            onClick={() => setActiveTab("branches")}
            className={tabClass("branches")}
          >
            Branches
          </button>
        </nav>
      </div>
      <div className="mt-6">
        {activeTab === "regions" && <RegionManager />}
        {activeTab === "districts" && <DistrictManager />}
        {activeTab === "branches" && <BranchManager />}
      </div>
    </div>
  );
};
export default HierarchyPage;
