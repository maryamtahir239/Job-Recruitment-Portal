import React, { useEffect, useState } from "react";
import Card from "@/components/ui/card";
import Button from "../components/ui/Button.jsx";

const EvaluatedCandidates = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        const res = await fetch("/api/evaluation");
        const data = await res.json();
        setEvaluations(data);
      } catch (error) {
        // console.error("Error fetching evaluations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluations();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Evaluated Candidates</h1>

      {loading ? (
        <p className="text-center text-gray-600">Loading evaluations...</p>
      ) : evaluations.length === 0 ? (
        <p className="text-center text-gray-500">No evaluations found.</p>
      ) : (
        <div className="flex flex-wrap justify-center gap-6">
          {evaluations.map((evalItem) => (
            <Card
              key={evalItem.id}
              className="w-full sm:w-2/3 md:w-1/2 lg:w-1/3 border border-gray-200 shadow-sm p-6 bg-white"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {evalItem.candidateName || "Unnamed Candidate"}
                </h2>
                <span className="text-sm font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">
                  Score: {evalItem.totalScore}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Question-wise Ratings</h3>
                <ul className="list-disc ml-6 text-sm text-gray-700 space-y-1">
                  {evalItem.scores?.map((q, i) => (
                    <li key={i}>
                      <strong>{q.question}:</strong> {q.rating}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Evaluator Comments</h3>
                <ul className="text-sm text-gray-600 ml-4 list-disc space-y-1">
                  <li><strong>Improvement:</strong> {evalItem.comments?.improvement || "N/A"}</li>
                  <li><strong>Evaluation:</strong> {evalItem.comments?.evaluation || "N/A"}</li>
                  <li><strong>Recommendation:</strong> {evalItem.comments?.recommendation || "N/A"}</li>
                  <li><strong>HR Comments:</strong> {evalItem.comments?.hrComments || "N/A"}</li>
                </ul>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EvaluatedCandidates;
