// src/pages/hr/PublicApplicationWrapper.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const PublicApplicationWrapper = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [candidate, setCandidate] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    designation: "",
    location: "",
  });

  // Fetch candidate details from backend
  useEffect(() => {
    const fetchInvite = async () => {
      try {
        const { data } = await axios.get(`/api/invites/${token}/validate`);
        if (data && data.candidate) {
          setCandidate(data.candidate);
          setFormData({
            fullName: data.candidate.name || "",
            email: data.candidate.email || "",
            phone: data.candidate.phone || "",
            designation: data.candidate.designation || "",
            location: data.candidate.location || "",
          });
        }
      } catch (err) {
        console.error("Invite validation failed:", err);
        setError(
          err.response?.data?.error || "This application link is invalid or expired."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchInvite();
  }, [token]);

  // Handle form input changes
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Submit the completed application
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/invites/${token}/submit`, formData);
      alert("Your application has been submitted successfully!");
    } catch (err) {
      console.error("Submit failed:", err);
      alert("Failed to submit application. Please try again later.");
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  if (error)
    return (
      <div className="p-6 text-center text-red-600 font-semibold">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Job Application Form
        </h2>
        <p className="mb-4 text-gray-600 text-center">
          Hello <strong>{candidate?.name}</strong>, please complete your
          application below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full border rounded p-2 mt-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              className="w-full border rounded p-2 mt-1 bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border rounded p-2 mt-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Designation
            </label>
            <input
              type="text"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              className="w-full border rounded p-2 mt-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full border rounded p-2 mt-1"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Submit Application
          </button>
        </form>
      </div>
    </div>
  );
};

export default PublicApplicationWrapper;
