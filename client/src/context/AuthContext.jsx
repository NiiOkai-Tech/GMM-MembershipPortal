// File: src/context/AuthContext.jsx
// Manages global authentication state (user, token, login, logout).
import React, { createContext, useState, useEffect, useMemo } from "react";
import api from "../services/api";
import jwtDecode from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  const isAdmin = useMemo(() => user?.role === "SUPER_ADMIN", [user]);

  useEffect(() => {
    const validateToken = async () => {
      if (token) {
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 > Date.now()) {
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            // Fetch user profile only if it's not already set
            if (!user) {
              const { data } = await api.get("/auth/profile");
              setUser({ ...decoded, ...data });
            }
          } else {
            logout();
          }
        } catch (error) {
          logout();
        }
      }
      setLoading(false);
    };
    validateToken();
  }, [token, user]);

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const newToken = response.data.token;
      localStorage.setItem("token", newToken);

      // Set token and immediately fetch user profile
      api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
      const decoded = jwtDecode(newToken);
      const { data: profileData } = await api.get("/auth/profile");
      setUser({ ...decoded, ...profileData });

      setToken(newToken); // This will now just confirm the state
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || "Failed to log in.",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
export default AuthContext;
