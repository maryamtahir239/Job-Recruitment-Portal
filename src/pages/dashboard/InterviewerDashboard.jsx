import React from "react";
import Button from "../../components/ui/Button"; 
import { useNavigate } from "react-router-dom";


const InterviewerDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const navigate = useNavigate();

const handleViewInterview = () => {
  navigate("/candidate-forms");
};


  return (
    <div className="flex items-start justify-center min-h-screen mt-20 bg-gray-50">
      <div className="text-center p-6 w-full max-w-4xl">
       
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome, {user?.name || "Interviewer"}!
        </h1>
        <p className="text-gray-600 text-lg mb-2">
          You are logged in as{" "}
          <span className="font-semibold text-blue-600">
            {user?.role || "interviewer"}
          </span>.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          Review interview details and provide feedback through the dashboard.
        </p>

        <div className="mb-10">
          <Button
           text="View Applications"
           className="btn-primary px-6 py-2"
           onClick={handleViewInterview}
          />
        </div>

      </div>
    </div>
  );
};

export default InterviewerDashboard;
