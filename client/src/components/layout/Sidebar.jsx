// File: src/components/layout/Sidebar.jsx
// The main navigation sidebar for the application.
import React from "react";
import { NavLink } from "react-router-dom";

const Logo = () => (
  <svg
    className="h-8 w-auto text-white"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);
const Sidebar = () => {
  const baseLink =
    "flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors duration-200";
  const activeLink = "bg-primary-700 text-white font-semibold";
  const normalLink = "text-gray-300 hover:bg-gray-700 hover:text-white";
  const linkClass = ({ isActive }) =>
    `${baseLink} ${isActive ? activeLink : normalLink}`;
  return (
    <div className="w-72 bg-gray-800 text-white flex-shrink-0 flex flex-col">
      <div className="h-20 flex items-center justify-center px-6 space-x-3 border-b border-gray-700">
        <Logo />
        <div className="flex flex-col w-full">
          <span className="text-lg font-bold text-[#009146]">
            Ghana Muslim Mission
          </span>
          <span className="text-sm font-bold">Membership Portal</span>
        </div>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        <NavLink to="/" className={linkClass}>
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/members" className={linkClass}>
          <span>Members</span>
        </NavLink>
        <NavLink to="/hierarchy" className={linkClass}>
          <span>Hierarchy</span>
        </NavLink>
        <NavLink to="/reports" className={linkClass}>
          <span>Reports</span>
        </NavLink>
        <NavLink to="/settings" className={linkClass}>
          <span>Settings</span>
        </NavLink>
      </nav>
    </div>
  );
};
export default Sidebar;
