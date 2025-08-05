import React, { useEffect, useState } from "react";
import Card from "@/components/ui/card";
import Button from "../components/ui/Button.jsx";
import { useNavigate } from "react-router-dom";

const PendingEvaluations = () => {
  const [pendingEvaluations, setPendingEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPendingEvaluations = async () => {
      try {
        const res = await fetch("/api/evaluation/pending");
        const data = await res.json();
        
        // Ensure data is an array
        if (Array.isArray(data)) {
          setPendingEvaluations(data);
        } else if (data && Array.isArray(data.pendingEvaluations)) {
          setPendingEvaluations(data.pendingEvaluations);
        } else if (data && Array.isArray(data.data)) {
          setPendingEvaluations(data.data);
        } else {
          console.warn("API returned unexpected data format:", data);
          setPendingEvaluations([]);
        }
      } catch (error) {
        console.error("Error fetching pending evaluations:", error);
        // For now, show empty state if API doesn't exist
        setPendingEvaluations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingEvaluations();
  }, []);

  const handleEvaluate = (candidate) => {
    navigate(`/evaluate/${candidate.id}`, { state: { candidate } });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Pending Evaluations</h1>
          <Button
            text="Back to Evaluations"
            className="btn-outline-primary"
            onClick={() => navigate("/evaluations")}
          />
        </div>

        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-600">Loading pending evaluations...</p>
          </div>
        ) : pendingEvaluations.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No pending evaluations found.</p>
            <p className="text-gray-400 text-sm mt-2">All evaluations have been completed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(pendingEvaluations) && pendingEvaluations.map((evaluation) => (
              <Card
                key={evaluation.id}
                className="border border-yellow-200 shadow border p-6 bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {evaluation.candidateName || "Unnamed Candidate"}
                  </h2>
                  <span className="text-sm font-medium text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full">
                    Pending
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Position:</span>
                    <span className="font-medium">{evaluation.position || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Application Date:</span>
                    <span className="font-medium">
                      {evaluation.createdAt ? new Date(evaluation.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Days Pending:</span>
                    <span className="font-medium text-yellow-600">
                      {evaluation.createdAt ? 
                        Math.floor((new Date() - new Date(evaluation.createdAt)) / (1000 * 60 * 60 * 24)) : 
                        'N/A'
                      } days
                    </span>
                  </div>
                </div>

                <Button
                  text="Start Evaluation"
                  className="btn-primary w-full"
                  onClick={() => handleEvaluate(evaluation)}
                />
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingEvaluations; 