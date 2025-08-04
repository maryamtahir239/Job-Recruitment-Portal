import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faPlus, faEye } from "@fortawesome/free-solid-svg-icons";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Textinput from "@/components/ui/Textinput";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import { safeToastError } from "@/utility/safeToast";
import {
  getEvaluationTemplates,
  createEvaluationTemplate,
  updateEvaluationTemplate,
  deleteEvaluationTemplate,
} from "@/api/evaluationTemplates";
import { listJobs } from "@/api/jobRoutes";
import { Icon } from "@iconify/react";

// EvaluationFormPreview: renders a full evaluation form UI for a template (read-only)
function EvaluationFormPreview({ template, jobs, onEdit, onDelete }) {
  const mainQuestions = JSON.parse(template.main_questions || '[]');
  const extraQuestions = JSON.parse(template.extra_questions || '[]');
  const job = jobs.find(j => j.id === template.job_id);
  const jobTitle = job?.title || 'General Template';

  // Table columns for ratings
  const ratingColumns = [
    { label: 'Exceptional', value: 5 },
    { label: 'Above Average', value: 4 },
    { label: 'Average', value: 3 },
    { label: 'Satisfactory', value: 2 },
    { label: 'Unsatisfactory', value: 1 },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 mb-12 relative border border-blue-100 print:border-black print:shadow-none">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-blue-700 mb-1">Interview Evaluation Form</h2>
          <div className="text-gray-500 mb-1">Template: {template.name}</div>
          <div className="text-sm text-blue-500 font-medium mb-2">{jobTitle}</div>
          <Badge className={template.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}>
            {template.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        <div className="flex space-x-2">
          <Button size="sm" className="btn-secondary" onClick={onEdit}>
            <FontAwesomeIcon icon={faEdit} />
          </Button>
          <Button size="sm" className="btn-danger" onClick={onDelete}>
            <FontAwesomeIcon icon={faTrash} />
          </Button>
        </div>
      </div>
      {/* Header fields */}
      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div>Candidate Name: <span className="font-semibold text-gray-700">__________________</span></div>
        <div>Position Applied For: <span className="font-semibold text-gray-700">{jobTitle}</span></div>
        <div>Department: <span className="font-semibold text-gray-700">__________________</span></div>
        <div>Date of Interview: <span className="font-semibold text-gray-700">____/____/______</span></div>
        <div>Interviewer(s) Name: <span className="font-semibold text-gray-700">__________________</span></div>
        <div>Interviewer Designation: <span className="font-semibold text-gray-700">__________________</span></div>
      </div>
      {/* Rating scale */}
      <div className="mb-4 text-xs text-gray-600">
        <span className="font-semibold">Rating Scale:</span> 5 = Exceptional, 4 = Above Average, 3 = Average, 2 = Satisfactory, 1 = Unsatisfactory
      </div>
      {/* Evaluation Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 print:border-black">
          <thead className="bg-gray-100 print:bg-white">
            <tr>
              <th className="border border-gray-300 print:border-black px-2 py-1 text-xs">Evaluation Criteria</th>
              {ratingColumns.map(col => (
                <th key={col.value} className="border border-gray-300 print:border-black px-2 py-1 text-xs text-center">{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mainQuestions.map((q, i) => (
              <tr key={i}>
                <td className="border border-gray-300 print:border-black px-2 py-1 text-sm">{q}</td>
                {ratingColumns.map(col => (
                  <td key={col.value} className="border border-gray-300 print:border-black px-2 py-1 text-center">
                    {/* Empty for print, or could show a radio/checkbox for preview */}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Areas for comments and summary fields */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-semibold mb-1">Areas of Review / Comments:</label>
          <div className="border border-gray-300 rounded p-2 min-h-[60px] text-gray-500">______________________________</div>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Are there any areas where improvement is required? (Please Specify):</label>
          <div className="border border-gray-300 rounded p-2 min-h-[60px] text-gray-500">______________________________</div>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-semibold mb-1">Interview Evaluation:</label>
          <div className="border border-gray-300 rounded p-2 min-h-[60px] text-gray-500">______________________________</div>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">HR Representative Comments:</label>
          <div className="border border-gray-300 rounded p-2 min-h-[60px] text-gray-500">______________________________</div>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-semibold mb-1">Strengths/Weaknesses:</label>
          <div className="border border-gray-300 rounded p-2 min-h-[60px] text-gray-500">______________________________</div>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Recommendations:</label>
          <div className="border border-gray-300 rounded p-2 min-h-[60px] text-gray-500">______________________________</div>
        </div>
      </div>
      <div className="mt-6">
        <label className="block text-xs font-semibold mb-1">Final Approval:</label>
        <div className="border border-gray-300 rounded p-2 min-h-[60px] text-gray-500">______________________________</div>
      </div>
      <div className="mt-8 text-xs text-gray-400">Created by: {template.created_by_name || 'N/A'}</div>
    </div>
  );
}

const EvaluationTemplateManagement = () => {
  console.log("=== EvaluationTemplateManagement component rendering... ===");
  
  const navigate = useNavigate();
  
  // Check localStorage availability
  if (typeof localStorage === 'undefined') {
    console.error("localStorage not available");
    return <div className="p-6">Error: localStorage not available</div>;
  }
  
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  
  console.log("User:", user);
  console.log("Token:", token ? "Present" : "Missing");
  console.log("User role:", user?.role);

  const [templates, setTemplates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    job_id: "",
    main_questions: [""],
    extra_questions: [""],
    is_active: true,
  });

  useEffect(() => {
    console.log("useEffect triggered");
    if (!token || !user || user.role !== "SuperAdmin") {
      console.log("Access denied - redirecting to login");
      safeToastError("Access denied");
      navigate("/login");
      return;
    }
    console.log("Loading data...");
    loadData();
  }, [token, user?.role]); // Only depend on token and user role

  const loadData = async () => {
    setLoading(true);
    try {
      console.log("Loading evaluation templates and jobs...");
      const [templatesData, jobsData] = await Promise.all([
        getEvaluationTemplates(token),
        listJobs(token),
      ]);
      console.log("Templates data:", templatesData);
      console.log("Jobs data:", jobsData);
      setTemplates(templatesData || []);
      setJobs(jobsData || []);
    } catch (err) {
      console.error("Error loading data:", err);
      // Set empty arrays as fallback
      setTemplates([]);
      setJobs([]);
      if (
        err.response?.status !== 401 &&
        err.response?.status !== 403 &&
        err.message !== "Invalid credentials"
      ) {
        safeToastError("Failed to load data: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      job_id: "",
      main_questions: [""],
      extra_questions: [""],
      is_active: true,
    });
    setEditingTemplate(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuestionChange = (type, index, value) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].map((q, i) => (i === index ? value : q)),
    }));
  };

  const addQuestion = (type) => {
    setFormData((prev) => ({
      ...prev,
      [type]: [...prev[type], ""],
    }));
  };

  const removeQuestion = (type, index) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || "",
      job_id: template.job_id || "",
      main_questions: JSON.parse(template.main_questions || "[]"),
      extra_questions: JSON.parse(template.extra_questions || "[]"),
      is_active: template.is_active,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Filter out empty questions
      const filteredMainQuestions = formData.main_questions.filter((q) => q.trim() !== "");
      const filteredExtraQuestions = formData.extra_questions.filter((q) => q.trim() !== "");

      if (filteredMainQuestions.length === 0) {
        toast.error("At least one main question is required");
        return;
      }

      const payload = {
        ...formData,
        main_questions: filteredMainQuestions,
        extra_questions: filteredExtraQuestions,
        job_id: formData.job_id || null,
      };

      if (editingTemplate) {
        const updated = await updateEvaluationTemplate(token, editingTemplate.id, payload);
        setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        toast.success("Template updated successfully");
      } else {
        const created = await createEvaluationTemplate(token, payload);
        setTemplates((prev) => [created, ...prev]);
        toast.success("Template created successfully");
      }

      setShowModal(false);
      resetForm();
    } catch (err) {
      if (
        err.response?.status !== 401 &&
        err.response?.status !== 403 &&
        err.message !== "Invalid credentials"
      ) {
        safeToastError("Failed to save template");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this template?")) return;

    try {
      await deleteEvaluationTemplate(token, id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      toast.success("Template deleted successfully");
    } catch (err) {
      if (
        err.response?.status !== 401 &&
        err.response?.status !== 403 &&
        err.message !== "Invalid credentials"
      ) {
        safeToastError("Failed to delete template");
      }
    }
  };

  const getJobTitle = (jobId) => {
    if (!jobId) return "General Template";
    const job = jobs.find((j) => j.id === jobId);
    return job ? job.title : "Unknown Job";
  };

  console.log("Component state - loading:", loading, "templates:", templates.length, "jobs:", jobs.length);
  
  if (loading) {
    console.log("Showing loading state...");
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <div className="text-lg text-gray-600">Loading evaluation templates...</div>
        </div>
      </div>
    );
  }

  console.log("Rendering main component...");

  // Simple test to see if component renders at all
  if (!token || !user) {
    console.log("No token or user - showing error");
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600">Authentication Error</h1>
        <p className="text-gray-600">Please log in to access this page.</p>
        <p className="text-sm text-gray-500 mt-2">Token: {token ? "Present" : "Missing"}</p>
        <p className="text-sm text-gray-500">User: {user ? "Present" : "Missing"}</p>
      </div>
    );
  }

  if (user.role !== "SuperAdmin") {
    console.log("User is not SuperAdmin - showing error");
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="text-gray-600">You need SuperAdmin privileges to access this page.</p>
        <p className="text-sm text-gray-500 mt-2">Your role: {user.role}</p>
      </div>
    );
  }

  // Add a simple visible test
  console.log("About to render main UI...");

  try {
    console.log("Inside try block, rendering main UI...");
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Evaluation Form Templates</h1>
          <Button
            onClick={openCreateModal}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg rounded-full px-6 py-2 text-lg font-semibold"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Create Template
          </Button>
        </div>
        {templates.length === 0 ? (
          <div className="bg-white rounded shadow p-8 text-center text-gray-500">
            <div className="text-lg mb-2">No evaluation templates found</div>
            <div className="text-sm">Create your first template to get started</div>
          </div>
        ) : (
          templates.map((template) => (
            <EvaluationFormPreview
              key={template.id}
              template={template}
              jobs={jobs}
              onEdit={() => openEditModal(template)}
              onDelete={() => handleDelete(template.id)}
            />
          ))
        )}
        {/* Modal for create/edit remains unchanged */}
        <Modal
          title={editingTemplate ? "Edit Template" : "Create New Template"}
          label="Evaluation Template"
          open={showModal}
          onClose={() => setShowModal(false)}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Textinput
                label="Template Name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <Select
                label="Job Position (Optional)"
                name="job_id"
                value={formData.job_id}
                onChange={handleInputChange}
              >
                <option value="">General Template</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </Select>
            </div>

            <Textarea
              label="Description (Optional)"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
            />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Main Questions</h3>
                <Button
                  text="Add Question"
                  onClick={() => addQuestion("main_questions")}
                  className="btn-secondary"
                  size="sm"
                />
              </div>
              {formData.main_questions.map((question, index) => (
                <div key={index} className="flex gap-2">
                  <Textinput
                    placeholder="Enter question"
                    value={question}
                    onChange={(e) => handleQuestionChange("main_questions", index, e.target.value)}
                    className="flex-1"
                  />
                  {formData.main_questions.length > 1 && (
                    <Button
                      text="Remove"
                      onClick={() => removeQuestion("main_questions", index)}
                      className="btn-danger"
                      size="sm"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Extra Questions (Optional)</h3>
                <Button
                  text="Add Question"
                  onClick={() => addQuestion("extra_questions")}
                  className="btn-secondary"
                  size="sm"
                />
              </div>
              {formData.extra_questions.map((question, index) => (
                <div key={index} className="flex gap-2">
                  <Textinput
                    placeholder="Enter extra question"
                    value={question}
                    onChange={(e) => handleQuestionChange("extra_questions", index, e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    text="Remove"
                    onClick={() => removeQuestion("extra_questions", index)}
                    className="btn-danger"
                    size="sm"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                className="mr-2"
              />
              <label htmlFor="is_active" className="text-sm text-gray-700">
                Active Template
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                text="Cancel"
                onClick={() => setShowModal(false)}
                className="btn-secondary"
              />
              <Button
                text={editingTemplate ? "Update Template" : "Create Template"}
                type="submit"
                className="btn-primary"
                loading={submitting}
              />
            </div>
          </form>
        </Modal>
      </div>
    );
  } catch (error) {
    console.error("Error rendering EvaluationTemplateManagement:", error);
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600">Component Error</h1>
        <p className="text-gray-600">An error occurred while loading the component.</p>
        <p className="text-sm text-gray-500 mt-2">Error: {error.message}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Reload Page
        </button>
      </div>
    );
  }
};

export default EvaluationTemplateManagement; 