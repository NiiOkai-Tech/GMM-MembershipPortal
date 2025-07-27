// File: src/pages/LoginPage.jsx
// A placeholder for the login page component.
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import Button from "../components/ui/Button";
import useToast from "../hooks/useToast";
import gmmLogo from "../../public/gmm-favicon.png";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await login(email, password);
    if (result.success) {
      addToast("Login successful!", "success");
      navigate("/");
    } else {
      addToast(result.error, "error");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-lg w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <img
            src={gmmLogo}
            alt="Ghana Muslim Mission Logo"
            className="h-16 w-auto"
          />
        </div>
        <h1 className="text-2xl font-bold mb-1 text-center text-[#1f8127]">
          Ghana Muslim Mission
        </h1>
        <h1 className="text-xl font-bold mb-1 text-center text-gray-800 pb-6">
          Membership Portal
        </h1>
        <p className="text-center text-gray-500 mb-6">
          Sign in to your account
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email Address
            </label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing In..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
};
export default LoginPage;
