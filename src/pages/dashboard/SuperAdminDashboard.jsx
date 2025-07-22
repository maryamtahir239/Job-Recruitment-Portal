import React from "react";
import { useNavigate } from "react-router-dom"; // Import the useNavigate hook
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons"; // Arrow icon for back button
import Card from "@/components/ui/Card"; // Assuming you have a Card component like in Dashboard
import Button from "@/components/ui/Button"; // Assuming you have a Button component

const SuperAdminDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const navigate = useNavigate(); // Initialize the navigate function

  const handleGoToManagement = () => {
    // Navigate to the HR/Interviewer Management page
    navigate("/superadmin-dashboard/hr-interview");
  };

  return (
    <div className="p-6">
      {/* Heading and description section */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">Welcome, Super Admin!</h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          You can manage access by assigning login credentials to HR and Interviewer roles. Click on a role below to proceed.
        </p>
      </div>

      {user && (
        <div className="mb-6 text-sm text-gray-600 text-center">
          Signed in as <strong>{user.name}</strong> ({user.email})
        </div>
      )}

      {/* Single Card UI for HR / Interviewer Management */}
      <div className="grid gap-4 max-w-sm mx-auto">
        <Card className="h-64 flex flex-col justify-between p-6 shadow-md hover:shadow-lg transition">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Manage HR / Interviewers</h2>
            <p className="text-gray-600">Add, edit, and delete HR & Interviewer accounts.</p>
          </div>
          <div className="flex justify-center mt-4">
            <Button text="Go to Management" onClick={handleGoToManagement} />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
