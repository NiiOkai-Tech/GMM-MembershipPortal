// File: src/components/layout/Header.jsx
// The top header bar of the application.
import React, { useContext, useState, useEffect } from "react";
import AuthContext from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import api from "../../services/api";

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [scopeName, setScopeName] = useState("");
  const [hierarchy, setHierarchy] = useState({
    regions: [],
    districts: [],
    branches: [],
  });

  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        const [regionsRes, districtsRes, branchesRes] = await Promise.all([
          api.get("/regions"),
          api.get("/districts"),
          api.get("/branches"),
        ]);
        setHierarchy({
          regions: regionsRes.data,
          districts: districtsRes.data,
          branches: branchesRes.data,
        });
      } catch (error) {
        console.error("Failed to fetch hierarchy for header:", error);
      }
    };
    if (user && user.role !== "SUPER_ADMIN") {
      fetchHierarchy();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      let name = "";
      switch (user.role) {
        case "REGION_ADMIN":
          name =
            hierarchy.regions.find((r) => r.id === user.regionId)?.name || "";
          break;
        case "DISTRICT_ADMIN":
          name =
            hierarchy.districts.find((d) => d.id === user.districtId)?.name ||
            "";
          break;
        case "BRANCH_ADMIN":
          name =
            hierarchy.branches.find((b) => b.id === user.branchId)?.name || "";
          break;
        default:
          break;
      }
      setScopeName(name);
    }
  }, [user, hierarchy]);

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
              {formatRole(user.role)} {scopeName && `- ${scopeName}`}
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
