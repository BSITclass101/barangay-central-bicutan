import React, { useState } from "react";
import { FaLock, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { useSearchParams, useNavigate, Link } from "react-router-dom";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      setIsSuccess(false);
      return;
    }

    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters.");
      setIsSuccess(false);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "http://localhost/barangay-api/api/resident_reset_password.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, new_password: newPassword }),
        }
      );
      const result = await res.json();
      setMessage(result.message);
      setIsSuccess(result.success);

      if (result.success) {
        setTimeout(() => navigate("/resident/login"), 2500);
      }
    } catch (err) {
      setMessage("Network error. Please try again.");
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 text-center">
          <FaExclamationTriangle className="text-red-500 text-3xl mx-auto mb-3" />
          <p className="text-red-600 font-medium mb-4">
            Invalid reset link. No token found.
          </p>
          <Link
            to="/resident/forgot-password"
            className="text-emerald-600 hover:underline text-sm"
          >
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <FaLock size={22} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Reset Password</h1>
          <p className="text-sm text-gray-500 mt-1">
            Enter your new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-type your new password"
              className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading || isSuccess}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Resetting..." : isSuccess ? "Success!" : "Reset Password"}
          </button>

          {message && (
            <div
              className={`text-sm p-3 rounded-xl flex items-start gap-2 ${
                isSuccess
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {isSuccess ? (
                <FaCheckCircle className="mt-0.5 shrink-0" />
              ) : (
                <FaExclamationTriangle className="mt-0.5 shrink-0" />
              )}
              <span>{message}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;