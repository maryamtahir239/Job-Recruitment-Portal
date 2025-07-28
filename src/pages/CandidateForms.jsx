import React, { useState, useEffect } from "react";
import Button from "../components/ui/Button";
import Pagination from "../components/ui/Pagination";
import { useNavigate } from "react-router-dom";

const CandidateForms = () => {
  const [applications, setApplications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const formsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/applications/submitted");
        const data = await res.json();
        setApplications(data);
      } catch (error) {
        console.error("Error fetching applications:", error);
      }
    };

    fetchApplications();
  }, []);

  const indexOfLastForm = currentPage * formsPerPage;
  const indexOfFirstForm = indexOfLastForm - formsPerPage;
  const currentForms = applications.slice(indexOfFirstForm, indexOfLastForm);
  const totalPages = Math.ceil(applications.length / formsPerPage);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleEvaluate = (candidate) => {
    navigate(`/evaluate/${candidate.id}`, { state: { candidate } });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <h1 className="text-3xl font-bold text-center mb-10">Submitted Candidate Applications</h1>
      <div className="space-y-6 max-w-4xl mx-auto">
       {currentForms.map((candidate) => (
  <div key={candidate.id} className="bg-white shadow border rounded p-6 text-left relative">

  {/* Candidate Photo at Top-Right */}
 {candidate.photo && (
  <div className="absolute top-6 right-6 text-center">
    <a
      href={`http://localhost:3001/${candidate.photo}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <img
        src={`http://localhost:3001/${candidate.photo}`}
        alt="Candidate Photo"
        className="w-28 h-28 object-cover rounded-full border cursor-pointer hover:opacity-90"
        title="Click to view full image"
      />
    </a>
    <span className="text-xs text-gray-500">Save Photo</span>
  </div>
)}



  {/* Candidate Details */}
  <h2 className="text-3xl text-left font-semibold mb-4">{candidate.full_name}</h2>
  <p><strong>Email:</strong> {candidate.email}</p>
  <p><strong>Phone:</strong> {candidate.phone}</p>
  <p><strong>CNIC:</strong> {candidate.cnic}</p>
  <p><strong>DOB:</strong> {candidate.dob}</p>
  <p><strong>Address:</strong> {candidate.address}</p>

  <hr className="my-4" />

  <p className="font-semibold">Education:</p>
  <ul className="list-disc ml-6">
    {(Array.isArray(candidate.education) ? candidate.education : []).map((edu, index) => (
      <li key={index}>
        {edu.level} - {edu.course_of_study} at {edu.institution} ({edu.passing_year})
      </li>
    ))}
  </ul>

  <hr className="my-4" />

  <p className="font-semibold">Experience:</p>
  <ul className="list-disc ml-6">
    {(Array.isArray(candidate.experience) ? candidate.experience : []).map((exp, index) => (
      <li key={index}>
        {exp.position_held} at {exp.company_name} ({exp.from} to {exp.to})
      </li>
    ))}
  </ul>

  <hr className="my-4" />

  <p className="font-semibold">References:</p>
  <ul className="list-disc ml-6">
    {(Array.isArray(candidate.references) ? candidate.references : []).map((ref, index) => (
      <li key={index}>
        {ref.ref_name} - {ref.ref_phone}
      </li>
    ))}
  </ul>

  <hr className="my-4" />

  {/* Resume Download Button */}
 {candidate.resume && (
  <div className="mt-4">
    <a
      href={`http://localhost:3001/${candidate.resume}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
    >
      Open Resume
    </a>
  </div>
)}


  {/* Evaluate Button */}
  <div className="mt-6 text-center">
    <Button
      text="Evaluate"
      className="btn-primary h-11 text-base"
      onClick={() => handleEvaluate(candidate)}
    />
  </div>
</div>

))}
        <div className="flex justify-center mt-10">
          <Pagination
            className="bg-gray-100 dark:bg-gray-500 w-fit py-2 px-3 rounded"
            totalPages={totalPages}
            currentPage={currentPage}
            handlePageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default CandidateForms;
