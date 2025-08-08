
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import EvaluationForm from "./EvaluationForm";
import { useEffect, useState } from "react";
import axios from "axios";

const EvaluationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const candidate = location.state?.candidate;
  const [job, setJob] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      if (!candidate?.job_id) return;
      try {
        const response = await axios.get("/api/jobs");
        const jobs = response.data || [];
        const foundJob = jobs.find(j => j.id === candidate.job_id);
        setJob(foundJob || null);
      } catch {
        setJob(null);
      }
    };
    fetchJob();
  }, [candidate]);

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
        jobTitle={job?.title || "Unknown Job"}
        department={job?.department || "N/A"}
        onClose={() => navigate(-1)}
      />
    </div>
  );
};

export default EvaluationPage;
