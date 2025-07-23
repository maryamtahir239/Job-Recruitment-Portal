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
    <div className="flex items-start justify-center min-h-screen bg-gray-50">
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
           text="View Interview"
           className="btn-primary px-6 py-2"
           onClick={handleViewInterview}
          />
        </div>

        <hr className="border-t border-gray-200 " />

        
        <div className="text-left pt-10">
          <h2 className="text-xl font-semibold mb-3 text-center">Pending Candidate</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Candidate</th>
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Time</th>
                </tr>
              </thead>
              <tbody>
                {/* Replace this with real data */}
                <tr>
                  <td colSpan="3" className="p-4 text-center text-gray-500">
                    No interviews pending feedback
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewerDashboard;
