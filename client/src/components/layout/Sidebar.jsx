// File: src/components/layout/Sidebar.jsx
// The main navigation sidebar for the application.
import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="h-20 flex items-center justify-center text-2xl font-bold">
        Portal
      </div>
      <nav className="flex-1 px-4 py-6">
        <Link
          to="/"
          className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
        >
          Dashboard
        </Link>
        <Link
          to="/members"
          className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
        >
          Members
        </Link>
        <Link
          to="/hierarchy"
          className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
        >
          Hierarchy
        </Link>
        <Link
          to="/settings"
          className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
        >
          Settings
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
