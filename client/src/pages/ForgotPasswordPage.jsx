import React, { useState } from "react";
import { Link } from "react-router-dom";
import gmmLogo from "../../public/gmm-favicon.png";
import api from "../services/api";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/users/forgot-password", { email });
      setMessage(data.message);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
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
          Forgot Password
        </h2>

        {message ? (
          <div className="text-center">
            <p className="text-green-600 bg-green-50 rounded-md p-4 mb-4">
              {message}
            </p>
            <Link
              to="/login"
              className="text-[#1f8127] font-semibold hover:underline"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            <p className="text-gray-500 text-sm mb-6 text-center">
              Enter your email and we'll send you a link to reset your password.
            </p>
            {error && (
              <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
            )}
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
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1f8127] text-white py-2 px-4 rounded-md font-semibold hover:bg-[#196820] disabled:opacity-60 transition"
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-4">
              <Link to="/login" className="text-[#1f8127] hover:underline">
                Back to Sign In
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
