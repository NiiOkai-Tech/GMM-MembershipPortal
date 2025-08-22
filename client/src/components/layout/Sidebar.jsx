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
// const Logo = () => (
//   <svg
//     className="h-8 w-auto text-white"
//     viewBox="0 0 24 24"
//     fill="currentColor"
//   >
//     <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
//   </svg>
// );
const DashboardIcon = () => (
  <svg
    xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
    />
  </svg>
);
const MembersIcon = () => (
  <svg
    xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-4.5"
    />
  </svg>
);
const HierarchyIcon = () => (
  <svg
    xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
    />
  </svg>
);
const AttendanceIcon = () => (
  <svg
    xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
    />
  </svg>
);
const ContributionsIcon = () => (
  <svg
    xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);
const ReportsIcon = () => (
  <svg
    xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);
const SettingsIcon = () => (
  <svg
    xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
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
    <div className="w-64 bg-gray-800 text-white flex-shrink-0 flex flex-col">
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
          <DashboardIcon />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/members" className={linkClass}>
          <MembersIcon />
          <span>Members</span>
        </NavLink>
        <NavLink to="/hierarchy" className={linkClass}>
          <HierarchyIcon />
          <span>Hierarchy</span>
        </NavLink>
        <NavLink to="/attendance" className={linkClass}>
          <AttendanceIcon />
          <span>Attendance</span>
        </NavLink>
        <NavLink to="/contributions" className={linkClass}>
          <ContributionsIcon />
          <span>Contributions</span>
        </NavLink>
        <NavLink to="/reports" className={linkClass}>
          <ReportsIcon />
          <span>Reports</span>
        </NavLink>
        <NavLink to="/settings" className={linkClass}>
          <SettingsIcon />
          <span>Settings</span>
        </NavLink>
      </nav>
    </div>
  );
};
export default Sidebar;
