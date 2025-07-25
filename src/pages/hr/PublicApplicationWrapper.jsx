import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import MultiStepJobApplicationForm from "@/components/MultiStepJobApplicationForm";
import Loading from "@/components/Loading";

const PublicApplicationWrapper = () => {
  const { token } = useParams();
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvite = async () => {
      try {
        const { data } = await axios.get(`/api/invites/${token}/validate`);
        setInvite(data); // includes candidate info
      } catch (err) {
        console.error("Invite validation failed:", err);
        setError(err.response?.data?.error || "Invalid or expired link");
      } finally {
        setLoading(false);
      }
    };

    fetchInvite();
  }, [token]);

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        <h2 className="text-2xl font-bold mb-2">Invalid Link</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">
        Job Application Form
      </h1>
      <MultiStepJobApplicationForm token={token} invite={invite} />
    </div>
  );
};

export default PublicApplicationWrapper;
