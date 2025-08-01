import React, { useState } from "react";
import Button from "@/components/ui/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useMemo } from "react";


const EvaluationForm = ({ candidate, onClose }) => {
  const [questions, setQuestions] = useState([
    "Educational Qualifications",
    "Work Experience",
    "Technical/Professional Skills",
    "Communication Skills",
    "Confidence and Clarity",
  ]);

  const [ratings, setRatings] = useState({});
  const [newQuestion, setNewQuestion] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [comments, setComments] = useState({
    improvement: "",
    evaluation: "",
    recommendation: "",
    hrComments: "",
  });

  const handleRatingChange = (question, value) => {
    setRatings({ ...ratings, [question]: value });
  };

  const handleAddQuestion = () => {
    if (newQuestion.trim() !== "") {
      if (editingIndex !== null) {
        const updated = [...questions];
        updated[editingIndex] = newQuestion;
        setQuestions(updated);
        setEditingIndex(null);
      } else {
        setQuestions([...questions, newQuestion]);
      }
      setNewQuestion("");
    }
  };

  const handleEditQuestion = (index) => {
    setNewQuestion(questions[index]);
    setEditingIndex(index);
  };

  const handleDeleteQuestion = (index) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
  };

  const handleCommentChange = (e) => {
    const { name, value } = e.target;
    setComments({ ...comments, [name]: value });
  };

 const handleSubmit = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to submit evaluation.");
      return;
    }

    const evaluationPayload = {
      candidate: { id: candidate.id },
      ratings,
      comments,
    };

    const response = await fetch("/api/evaluation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(evaluationPayload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Submission failed");
    }

    alert("Evaluation submitted successfully!");
    onClose(); 
  } catch (err) {
    alert(`Failed to submit evaluation: ${err.message}`);
  }
};


  const getLabel = (value) => {
    switch (value) {
      case "5": return "Exceptional";
      case "4": return "Above Average";
      case "3": return "Average";
      case "2": return "Satisfactory";
      case "1": return "Unsatisfactory";
      default: return "";
    }
  };

  const totalScore = useMemo(() => {
  return questions.reduce((sum, q) => {
    const value = parseInt(ratings[q], 10);
    return sum + (isNaN(value) ? 0 : value);
  }, 0);
}, [ratings, questions]);


  return (
    <div className="bg-white p-6 rounded shadow-md w-full max-w-4xl mx-auto mt-10">
      <h2 className="text-2xl font-semibold mb-6 pt-8 text-center">Interview Evaluation Form</h2>

      <div className="text-sm text-gray-700 mb-6">
        <p><strong>Name:</strong> {candidate.full_name}</p>
        <p><strong>Position:</strong> {candidate.position}</p>
        <p><strong>Department:</strong> {candidate.department}</p>
        <p><strong>Date:</strong> {candidate.date?.slice(0, 10)}</p>

      </div>

      <h3 className="text-lg font-semibold mb-4 text-gray-800">Evaluation</h3>
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full text-sm border text-center">
          <thead>
            <tr className="bg-gray-50">
              <th className="border px-4 py-2 text-center">Criteria</th>
              <th className="border px-4 py-2 text-center">Poor (1)</th>
              <th className="border px-4 py-2 text-center">Fair (2)</th>
              <th className="border px-4 py-2 text-center">Good (3)</th>
              <th className="border px-4 py-2 text-center">Very Good (4)</th>
              <th className="border px-4 py-2 text-center">Excellent (5)</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((criteria, index) => (
              <tr key={index}>
                <td className="border px-4 py-2 text-center font-medium">{criteria}</td>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <td key={rating} className="border px-4 py-2 text-center">
                    <input
                      type="radio"
                      name={`criteria_${index}`}
                      value={rating}
                      onChange={(e) => handleRatingChange(criteria, parseInt(e.target.value))}
                      className="mr-2"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex items-center gap-4 mt-6">
  <input
    type="text"
    placeholder="Add or edit question"
    className="border px-3 py-2 rounded w-full"
    value={newQuestion}
    onChange={(e) => setNewQuestion(e.target.value)}
  />
  <Button text={editingIndex !== null ? "Update" : "Add"} onClick={handleAddQuestion} />
</div>

      </div>

      <div className="space-y-4">
        {Object.keys(comments).map((key) => (
          <div key={key}>
            <label className="block text-gray-700 font-medium mb-1 capitalize">
              {key.replace(/([A-Z])/g, " $1")}
            </label>
            <textarea
              name={key}
              value={comments[key]}
              onChange={handleCommentChange}
              className="w-full border border-gray-300 rounded py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              rows={3}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <Button text="Cancel" onClick={onClose} className="bg-gray-300" />
        <Button text="Submit Evaluation" onClick={handleSubmit} className="btn-primary px-6" />
      </div>
    </div>
  );
};

export default EvaluationForm;
