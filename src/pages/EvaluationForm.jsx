import React, { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Icon from "@/components/ui/Icon";
import { useMemo } from "react";
import { getEvaluationTemplateByJobId } from "@/api/evaluationTemplates";
import { safeToastError } from "@/utility/safeToast";
import { toast } from "react-toastify";

const EvaluationForm = ({ candidate, onClose, jobTitle, department }) => {
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState(null);
  const [templateError, setTemplateError] = useState(null);
  const [questions, setQuestions] = useState([
    "Educational Qualifications",
    "Work Experience",
    "Technical/Professional Skills",
    "Communication Skills",
    "Confidence and Clarity",
  ]);

  const [ratings, setRatings] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

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
  });

  // Load evaluation template for the candidate's job
  useEffect(() => {
    const loadTemplate = async () => {
      try {
        setLoading(true);
        setTemplateError(null);
        const token = localStorage.getItem("token");
        if (!token || !candidate.job_id) {
          setTemplateError("No job position assigned to this candidate");
          setQuestions([
            "Educational Qualifications",
            "Work Experience",
            "Technical/Professional Skills",
            "Communication Skills",
            "Confidence and Clarity",
          ]);
          return;
        }

        const templateData = await getEvaluationTemplateByJobId(token, candidate.job_id);
        setTemplate(templateData);

        // Combine main and extra questions
        const mainQuestions = JSON.parse(templateData.main_questions || "[]");
        const extraQuestions = JSON.parse(templateData.extra_questions || "[]");
        setQuestions([...mainQuestions, ...extraQuestions]);
      } catch (error) {
        console.error("Failed to load evaluation template:", error);

        // Check if it's a 404 error (no active template)
        if (error.message && error.message.includes("No active evaluation template found")) {
          setTemplateError("No active evaluation template found for this job position. Please contact the administrator to create an active template.");
        } else {
          setTemplateError("Failed to load evaluation template. Please try again or contact support.");
        }

        // Fallback to default questions
        setQuestions([
          "Educational Qualifications",
          "Work Experience",
          "Technical/Professional Skills",
          "Communication Skills",
          "Confidence and Clarity",
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadTemplate();
  }, [candidate.job_id]);

  const handleRatingChange = (question, value) => {
    setRatings({ ...ratings, [question]: value });
  };

  const handleCommentChange = (e) => {
    const { name, value } = e.target;
    setComments({ ...comments, [name]: value });
  };

  const handleSubmit = async () => {
    // Validation
    const newErrors = {};
    // Check all questions answered
    questions.forEach((q) => {
      if (!ratings[q]) {
        newErrors[q] = 'Please select a rating for this question.';
      }
    });
    // Check required comments
    if (!comments.improvement.trim()) {
      newErrors.improvement = 'Improvement is required.';
    }
    if (!comments.evaluation.trim()) {
      newErrors.evaluation = 'Evaluation is required.';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to submit evaluation.");
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
      toast.success("Evaluation submitted successfully");
      onClose();
    } catch (err) {
      safeToastError(`Failed to submit evaluation: ${err.message}`);
    } finally {
      setSubmitting(false);
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

  const getJobTitle = () => {
    return jobTitle || candidate.job_title || "Unknown Job";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 dark:text-gray-100 p-6 rounded shadow-md w-full max-w-4xl mx-auto mt-10">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading evaluation form...</div>
        </div>
      </div>
    );
  }

  // New conditional rendering for full-screen error message
  if (templateError) {
    return (
      <div className="flex items-center justify-center h-screen w-full p-6 text-center bg-gray-100 dark:bg-gray-900">
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 text-yellow-700 dark:text-yellow-300 p-8 rounded-lg shadow-xl max-w-xl mx-auto">
          <div className="flex items-center justify-center mb-4">
            <Icon icon="heroicons:exclamation-triangle" className="w-12 h-12 text-yellow-500 dark:text-yellow-300 mr-4" />
            <p className="text-2xl font-bold">{templateError}</p>
          </div>
          <p className="mt-4 text-base text-yellow-800">
            You cannot evaluate this candidate until an evaluation form is made available for this position.
          </p>
          <div className="mt-8">
            <Button
              text="Go Back"
              onClick={onClose}
              className="btn-outline-warning"
            />
          </div>
        </div>
      </div>
    );
  }

  // The rest of the component (the form itself) will only render if there is no templateError
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
            <div className="text-2xl font-bold">{totalScore}/{questions.length * 5}</div>
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
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Icon icon="ph:user" className="text-blue-600 dark:text-blue-400 text-lg" />
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Candidate Name</div>
                <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">{candidate.full_name}</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Icon icon="ph:briefcase" className="text-green-600 dark:text-green-400 text-lg" />
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Position</div>
                <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">{getJobTitle()}</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <Icon icon="ph:buildings" className="text-purple-600 dark:text-purple-400 text-lg" />
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Department</div>
                <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">{department || "N/A"}</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <Icon icon="ph:calendar" className="text-orange-600 dark:text-orange-400 text-lg" />
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Applied Date</div>
                <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">{formatDate(candidate.created_at)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Evaluation Criteria */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">Evaluation Criteria</h3>
          </div>
          {errors._questions && (
            <div className="text-red-600 text-sm mb-2">{errors._questions}</div>
          )}
          <div className="space-y-4">
            {questions.map((criteria, index) => (
              <Card key={index} className="p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="mb-3">
                  <h4 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-3">{criteria}</h4>
                  <div className="flex flex-wrap items-center gap-3">
                    {ratingOptions.map((option) => (
                      <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`criteria_${index}`}
                          value={option.value}
                          checked={ratings[criteria] === option.value}
                          onChange={(e) => handleRatingChange(criteria, e.target.value)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors[criteria] && (
                    <div className="text-red-600 text-xs mt-2">{errors[criteria]}</div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Comments Section */}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-4">Evaluation Comments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 text-sm">
                  Strength and Weakness
                </label>
                <textarea
                  name="improvement"
                  value={comments.improvement}
                  onChange={handleCommentChange}
                  className={`w-full border ${errors.improvement ? 'border-red-500' : 'border-gray-300'} rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none`}
                  rows={3}
                  placeholder="Summarize the candidate's strengths and weaknesses"
                />
                {errors.improvement && (
                  <div className="text-red-600 text-xs mt-1">{errors.improvement}</div>
                )}
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 text-sm">
                  Comments
                </label>
                <textarea
                  name="evaluation"
                  value={comments.evaluation}
                  onChange={handleCommentChange}
                  className={`w-full border ${errors.evaluation ? 'border-red-500' : 'border-gray-300'} rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none`}
                  rows={3}
                  placeholder="Any additional comments regarding the interview"
                />
                {errors.evaluation && (
                  <div className="text-red-600 text-xs mt-1">{errors.evaluation}</div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
            <div className="flex justify-end items-center">
              <Button
                text="Submit Evaluation"
                onClick={handleSubmit}
                className="btn-primary"
                disabled={loading || submitting}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationForm;