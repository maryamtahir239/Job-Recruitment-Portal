import React, { useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Icon from "@/components/ui/Icon";
import { useMemo } from "react";

const EvaluationForm = ({ candidate, onClose }) => {
  const [questions] = useState([
    "Educational Qualifications",
    "Work Experience",
    "Technical/Professional Skills",
    "Communication Skills",
    "Confidence and Clarity",
  ]);

  const [ratings, setRatings] = useState({});
  
  // Simplified rating options
  const ratingOptions = [
    { value: "excellent", label: "Excellent" },
    { value: "good", label: "Good" },
    { value: "average", label: "Average" },
    { value: "satisfactory", label: "Satisfactory" },
    { value: "unsatisfactory", label: "Unsatisfactory" }
  ];
  const [comments, setComments] = useState({
    improvement: "",
    evaluation: "",
    recommendation: "",
    hrComments: "",
  });

  const handleRatingChange = (question, value) => {
    setRatings({ ...ratings, [question]: value });
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
    const option = ratingOptions.find(opt => opt.value === value);
    return option ? option.label : "";
  };

  const totalScore = useMemo(() => {
    return questions.reduce((sum, q) => {
      const rating = ratings[q];
      if (!rating) return sum;
      
      // Convert text ratings to numeric scores for calculation
      const scoreMap = {
        "excellent": 5,
        "good": 4,
        "average": 3,
        "satisfactory": 2,
        "unsatisfactory": 1
      };
      return sum + (scoreMap[rating] || 0);
    }, 0);
  }, [ratings, questions]);

  const getJobTitle = (jobId) => {
    // Use job title from candidate object if available, otherwise fallback
    return candidate.job_title || "Software Engineer";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl relative flex-shrink-0">
        <div className="flex justify-between items-center pr-12">
          <div>
            <h2 className="text-2xl text-white font-semibold">Interview Evaluation Form</h2>
            <p className="text-blue-100 mt-1 text-sm">Comprehensive candidate assessment</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-100">Total Score</div>
            <div className="text-2xl font-bold">{totalScore}/25</div>
          </div>
        </div>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-blue-200 transition-colors duration-200 p-2 rounded-full hover:bg-white/10"
        >
          <Icon icon="ph:x" className="text-xl" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Candidate Information */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Icon icon="ph:user" className="text-blue-600 text-lg" />
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Candidate Name</div>
                <div className="font-medium text-gray-900 text-sm">{candidate.full_name}</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Icon icon="ph:briefcase" className="text-green-600 text-lg" />
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Position</div>
                <div className="font-medium text-gray-900 text-sm">{getJobTitle(candidate.job_id)}</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Icon icon="ph:buildings" className="text-purple-600 text-lg" />
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Department</div>
                <div className="font-medium text-gray-900 text-sm">IT Department</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Icon icon="ph:calendar" className="text-orange-600 text-lg" />
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Applied Date</div>
                <div className="font-medium text-gray-900 text-sm">{formatDate(candidate.created_at)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Evaluation Criteria */}
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Evaluation Criteria</h3>
          
          <div className="space-y-4">
            {questions.map((criteria, index) => (
              <Card key={index} className="p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="mb-3">
                  <h4 className="text-base font-medium text-gray-900 mb-3">{criteria}</h4>
                  <div className="flex flex-wrap items-center gap-3">
                    {ratingOptions.map((option) => (
                      <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`criteria_${index}`}
                          value={option.value}
                          onChange={(e) => handleRatingChange(criteria, e.target.value)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                  {ratings[criteria] && (
                    <div className="mt-2">
                      <Badge className="badge-success text-xs">
                        Selected: {getLabel(ratings[criteria])}
                      </Badge>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Comments Section */}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Additional Comments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(comments).map((key) => (
                <div key={key}>
                  <label className="block text-gray-700 font-medium mb-2 capitalize text-sm">
                    {key.replace(/([A-Z])/g, " $1")}
                  </label>
                  <textarea
                    name={key}
                    value={comments[key]}
                    onChange={handleCommentChange}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
                    rows={3}
                    placeholder={`Enter your ${key.replace(/([A-Z])/g, " $1").toLowerCase()}...`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <Button
              text="Submit Evaluation"
              onClick={handleSubmit}
              className="btn-primary px-6 py-2 text-sm font-medium"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationForm;
