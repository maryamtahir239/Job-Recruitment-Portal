import React, { useEffect, useState } from "react";
import Card from "@/components/ui/card";
import Button from "../components/ui/Button.jsx";
import { useNavigate } from "react-router-dom";

const Evaluations = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        const res = await fetch("/api/evaluation");
        const data = await res.json();
        setEvaluations(data);
      } catch (error) {
        console.error("Error fetching evaluations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluations();
  }, []);

  const handleEvaluate = (candidate) => {
    navigate(`/evaluate/${candidate.id}`, { state: { candidate } });
  };

  const handleViewDetails = (evaluation) => {
    // Navigate to evaluation details or show in modal
    console.log("View details for:", evaluation);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Evaluations</h1>
          <div className="flex gap-4">
            <Button
              text="Pending Evaluations"
              className="btn-outline-primary"
              onClick={() => navigate("/pending-evaluations")}
            />
            <Button
              text="Completed Evaluations"
              className="btn-outline-secondary"
              onClick={() => navigate("/evaluated-candidates")}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-600">Loading evaluations...</p>
          </div>
        ) : evaluations.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No evaluations found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {evaluations.map((evaluation) => (
              <Card
                key={evaluation.id}
                className="border border-gray-200 shadow-sm p-6 bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {evaluation.candidateName || "Unnamed Candidate"}
                  </h2>
                  <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                    evaluation.status === 'completed' 
                      ? 'text-green-700 bg-green-100' 
                      : 'text-yellow-700 bg-yellow-100'
                  }`}>
                    {evaluation.status === 'completed' ? 'Completed' : 'Pending'}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Position:</span>
                    <span className="font-medium">{evaluation.position || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">
                      {evaluation.createdAt ? new Date(evaluation.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  {evaluation.totalScore && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Score:</span>
                      <span className="font-medium text-green-600">{evaluation.totalScore}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {evaluation.status !== 'completed' ? (
                    <Button
                      text="Evaluate"
                      className="btn-primary flex-1"
                      onClick={() => handleEvaluate(evaluation)}
                    />
                  ) : (
                    <Button
                      text="View Details"
                      className="btn-outline-primary flex-1"
                      onClick={() => handleViewDetails(evaluation)}
                    />
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Evaluations; 