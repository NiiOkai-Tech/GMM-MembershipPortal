// File: src/components/layout/Sidebar.jsx
// The main navigation sidebar for the application.
import React from "react";
import { NavLink } from "react-router-dom";
import gmmLogo from "../../../public/gmm-favicon.png";

const Logo = () => (
  <img
    src={gmmLogo}
    alt="Ghana Muslim Mission Logo"
    className="h-auto w-auto"
  />
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
      <div className="h-20 flex items-center justify-center px-4 space-x-3 border-b border-gray-700">
        <Logo />
        <div className="flex flex-col w-full">
          <span className="text-sm font-bold text-[#009146]">
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
        <NavLink to="/attendance" className={linkClass}>
          <span>Attendance</span>
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
