// Frontend/src/pages/dashboard/SuperAdminDashboard.jsx
import React from "react";
import { Link } from "react-router-dom";

const SuperAdminDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Super Admin Dashboard</h1>

      {user && (
        <div className="mb-6 text-sm text-gray-600">
          Signed in as <strong>{user.name}</strong> ({user.email})
        </div>
      )}

      {/* Card → HR / Interviewer Management */}
      <div className="grid gap-4 max-w-sm">
        <Link
          to="/superadmin-dashboard/hr-interview"
          className="block p-4 border rounded bg-white shadow hover:shadow-md transition"
        >
          <h2 className="text-lg font-semibold mb-1">
            Manage HR / Interviewers
          </h2>
          <p className="text-xs text-gray-500">
            Add, edit, and delete HR & Interviewer accounts.
          </p>
        </Link>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
