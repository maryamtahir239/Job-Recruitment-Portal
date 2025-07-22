import React from "react";

const InterviewerDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800">Welcome, {user?.name || "Interviewer"}!</h1>
      <p className="text-gray-500 mt-2">
        You are logged in as <strong>{user?.role}</strong>.
      </p>
    </div>
  );
};

export default InterviewerDashboard;
