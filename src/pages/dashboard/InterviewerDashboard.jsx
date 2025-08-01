import React from "react";
import Button from "../../components/ui/Button"; 
import Card from "../../components/ui/Card";
import Icon from "../../components/ui/Icon";
import { useNavigate } from "react-router-dom";

const InterviewerDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const handleViewApplications = () => {
    navigate("/applications");
  };

  const handleEvaluatedCandidates = () => {
    navigate("/evaluated-candidates");
  };

  const handlePendingEvaluations = () => {
    navigate("/pending-evaluations");
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen mt-10 bg-gray-50 px-4">
      <div className="text-center p-6 w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome, {user?.name || "Interviewer"}!
        </h1>
        <p className="text-gray-600 text-lg mb-1">
          You are logged in as{" "}
          <span className="font-semibold text-blue-600">
            {user?.role || "interviewer"}
          </span>.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          Review interview details and provide feedback through the dashboard.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <Button
            text="View Applications"
            className="btn-primary hover:shadow-lg hover:shadow-indigo-500/50 "
            onClick={handleViewApplications}
          />
          <Button
            text="Evaluated Candidates"
            className="btn-secondary hover:shadow-lg hover:shadow-fuchsia-500/50 "
            onClick={handleEvaluatedCandidates}
          />
          <Button
            text="Pending Evaluations"
            className="btn-outline-info"
            onClick={handlePendingEvaluations}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 w-full max-w-6xl px-2">
        <Card>
          <div className="flex items-center">
            <div className="flex-1">
              <h4 className="text-2xl font-bold text-gray-900">12</h4>
              <p className="text-gray-600">Total Applications</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon icon="ph:file-text" className="text-blue-600 text-xl" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-1">
              <h4 className="text-2xl font-bold text-gray-900">5</h4>
              <p className="text-gray-600">Pending Evaluations</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Icon icon="ph:clock" className="text-yellow-600 text-xl" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-1">
              <h4 className="text-2xl font-bold text-gray-900">7</h4>
              <p className="text-gray-600">Completed Evaluations</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon icon="ph:check-circle" className="text-green-600 text-xl" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-1">
              <h4 className="text-2xl font-bold text-gray-900">2</h4>
              <p className="text-gray-600">Upcoming Interviews</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Icon icon="ph:calendar" className="text-purple-600 text-xl" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-1">
              <h4 className="text-xl font-bold text-gray-900">Last updated</h4>
              <p className="text-gray-600">Today at 3:45 PM</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center -mt-6 justify-center">
              <Icon icon="ph:activity" className="text-red-600 text-xl" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default InterviewerDashboard;
