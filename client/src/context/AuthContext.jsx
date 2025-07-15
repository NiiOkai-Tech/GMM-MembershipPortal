// File: src/context/AuthContext.jsx
// Manages global authentication state (user, token, login, logout).
import React, { createContext, useState, useMemo } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulate checking for a user session on load
  React.useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    }
    setLoading(false);
  }, []);

  const isAdmin = useMemo(() => user?.role === "SUPER_ADMIN", [user]);

  const login = (email) => {
    // In a real app, you'd get user data from an API.
    // Here, we'll create a dummy user.
    const dummyUser = {
      email: email,
      role: email.includes("admin") ? "SUPER_ADMIN" : "BRANCH_ADMIN", // Simple logic for testing
    };
    localStorage.setItem("user", JSON.stringify(dummyUser));
    setUser(dummyUser);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
