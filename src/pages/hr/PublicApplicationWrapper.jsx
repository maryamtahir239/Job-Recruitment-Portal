// src/pages/hr/PublicApplicationWrapper.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import MultiStepJobApplicationForm from "@/components/forms/job-application/MultiStepJobApplicationForm";

const PublicApplicationWrapper = () => {
  const { token } = useParams();
  const [invite, setInvite] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvite = async () => {
      try {
        const { data } = await axios.get(`/api/invites/${token}/validate`);
        setInvite(data);
      } catch (err) {
        setError(err.response?.data?.error || "Invalid or expired link.");
      }
    };
    fetchInvite();
  }, [token]);

  if (error) {
    return (
      <div className="max-w-xl mx-auto mt-10 text-center text-red-600">
        <p className="text-lg font-semibold">{error}</p>
      </div>
    );
  }

  if (!invite) {
    return <div className="text-center mt-10">Validating invite...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold text-center mb-6">Job Application Form</h1>
      <MultiStepJobApplicationForm token={token} invite={invite} />
    </div>
  );
};

export default PublicApplicationWrapper;
