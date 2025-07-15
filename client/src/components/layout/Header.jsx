// File: src/components/layout/Header.jsx
// The top header bar of the application.
import React, { useContext } from "react";
import AuthContext from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const formatRole = (role) =>
    role
      ? role
          .replace("_", " ")
          .toLowerCase()
          .replace(/\b\w/g, (c) => c.toUpperCase())
      : "";
  return (
    <header className="flex items-center justify-end p-4 bg-white border-b">
      <div className="flex items-center">
        {user && (
          <div className="text-right">
            <span className="font-semibold">{user.email}</span>
            <span className="text-sm text-gray-500 block">
              {formatRole(user.role)}
            </span>
          </div>
        )}
        <Button variant="danger" onClick={handleLogout} className="ml-4">
          Logout
        </Button>
      </div>
    </header>
  );
};
export default Header;
