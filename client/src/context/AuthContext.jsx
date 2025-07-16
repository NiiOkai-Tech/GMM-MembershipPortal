// File: src/context/AuthContext.jsx
// Manages global authentication state (user, token, login, logout).
import React, { createContext, useState, useEffect, useMemo } from "react";
import api from "../services/api";
import jwtDecode from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  const isAdmin = useMemo(() => user?.role === "SUPER_ADMIN", [user]);

  const fetchUserProfile = async () => {
    try {
      const { data } = await api.get("/auth/profile");
      const decoded = jwtDecode(token);
      setUser({ ...decoded, ...data });
    } catch (error) {
      console.error("Failed to fetch user profile", error);
      logout();
    }
  };

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          fetchUserProfile();
        }
      } catch (error) {
        console.error("Invalid token:", error);
        logout();
      }
    }
    setLoading(false);
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, loading, isAdmin }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
export default AuthContext;
