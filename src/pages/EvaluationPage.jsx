
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import EvaluationForm from "./EvaluationForm";

const EvaluationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const candidate = location.state?.candidate;

  if (!candidate) {
    return (
      <div className="text-center p-10 text-red-600">
        <p>No candidate data provided.</p>
        <button onClick={() => navigate(-1)} className="text-blue-600 underline mt-2">Go Back</button>
      </div>
    );
  }

  return (
    <div className="py-10 px-6">
      <EvaluationForm
        candidate={candidate}
        onClose={() => navigate(-1)}
      />
    </div>
  );
};

export default EvaluationPage;
