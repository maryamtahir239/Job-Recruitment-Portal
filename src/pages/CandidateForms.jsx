import React, { useState } from "react";
import Button from "../components/ui/Button";
import Pagination from "../components/ui/Pagination";
import { useNavigate } from "react-router-dom";

const dummyCandidates = Array.from({ length: 25 }).map((_, i) => ({
  id: i + 1,
  name: `Candidate ${i + 1}`,
  email: `candidate${i + 1}@example.com`,
  phone: `0300-000000${i}`,
  education: "BSCS",
  experience: `${i % 5 + 1} years`,
  skills: "React, Node.js",
  coverLetter: "Motivated developer ready to contribute.",
  position: "Frontend Developer",
  department: "Engineering",
  date: new Date().toLocaleDateString(),
}));

const CandidateForms = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const formsPerPage = 10;
  const navigate = useNavigate();

  const indexOfLastForm = currentPage * formsPerPage;
  const indexOfFirstForm = indexOfLastForm - formsPerPage;
  const currentForms = dummyCandidates.slice(indexOfFirstForm, indexOfLastForm);
  const totalPages = Math.ceil(dummyCandidates.length / formsPerPage);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleEvaluate = (candidate) => {
    navigate(`/evaluate/${candidate.id}`, { state: { candidate } });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <h1 className="text-3xl font-bold text-center mb-10">Submitted Candidate Forms</h1>
      <div className="space-y-6 max-w-4xl mx-auto">
        {currentForms.map((candidate) => (
          <div
            key={candidate.id}
            className="bg-white shadow border rounded p-6 text-left"
          >
            <h2 className="text-xl font-semibold mb-2">{candidate.name}</h2>
            <p><strong>Email:</strong> {candidate.email}</p>
            <p><strong>Phone:</strong> {candidate.phone}</p>
            <p><strong>Education:</strong> {candidate.education}</p>
            <p><strong>Experience:</strong> {candidate.experience}</p>
            <p><strong>Skills:</strong> {candidate.skills}</p>
            <p><strong>Cover Letter:</strong> {candidate.coverLetter}</p>

            <div className="mt-4">
              <Button
                text="Evaluate"
                className="btn-primary px-5 py-1"
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
