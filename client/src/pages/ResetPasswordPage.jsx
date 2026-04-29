import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import gmmLogo from "../../public/gmm-favicon.png";
import api from "../services/api";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirm) return setError("Passwords do not match.");
    if (newPassword.length < 8)
      return setError("Password must be at least 8 characters.");
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/users/reset-password", {
        token,
        newPassword,
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
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
        <h2 className="text-xl font-bold mb-6 text-center text-gray-800">
          Reset Password
        </h2>

        {success ? (
          <div className="text-center">
            <p className="text-green-600 bg-green-50 rounded-md p-4 mb-4">
              Password reset successfully! Redirecting to login...
            </p>
            <Link
              to="/login"
              className="text-[#1f8127] font-semibold hover:underline"
            >
              Go to Sign In
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
            )}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  className="input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  className="input"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1f8127] text-white py-2 px-4 rounded-md font-semibold hover:bg-[#196820] disabled:opacity-60 transition"
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
