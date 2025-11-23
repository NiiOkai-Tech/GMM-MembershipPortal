import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  useContext,
} from "react";
import api from "../services/api";
import jwtDecode from "jwt-decode";

const AuthContext = createContext();

// ✔ Add this custom hook
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  const role = user?.role;
  const isSuperAdmin = role === "SUPER_ADMIN";
  const isRegionAdmin = role === "REGION_ADMIN";
  const isDistrictAdmin = role === "DISTRICT_ADMIN";
  const isBranchAdmin = role === "BRANCH_ADMIN";

  useEffect(() => {
    const validateToken = async () => {
      if (token) {
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 > Date.now()) {
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
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

      api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
      const decoded = jwtDecode(newToken);
      const { data: profileData } = await api.get("/auth/profile");
      setUser({ ...decoded, ...profileData });

      setToken(newToken);
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
    <AuthContext.Provider
      value={{
        user,
        role,
        isSuperAdmin,
        isRegionAdmin,
        isDistrictAdmin,
        isBranchAdmin,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
