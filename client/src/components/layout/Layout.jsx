// File: src/components/layout/Layout.jsx
// Defines the main application layout with a sidebar and main content area.
import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Layout = ({ children }) => (
  <div className="flex h-screen bg-gray-50 font-sans">
    <Sidebar />
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
        {children}
      </main>
    </div>
  </div>
);
export default Layout;
