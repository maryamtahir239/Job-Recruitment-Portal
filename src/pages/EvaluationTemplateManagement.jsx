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
      <div className="space-y-6 p-6">
        {/* Simple test element to see if anything renders */}
        <div className="bg-red-500 text-white p-4 mb-4 rounded">
          <h2 className="text-lg font-bold">DEBUG: Component is rendering!</h2>
          <p>Templates: {templates.length}, Jobs: {jobs.length}</p>
        </div>
        
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Evaluation Form Templates</h1>
          <Button
            text="Create New Template"
            icon="heroicons-outline:plus"
            onClick={openCreateModal}
            className="btn-primary"
          />
        </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Template Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Questions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {templates.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <div className="text-lg mb-2">No evaluation templates found</div>
                      <div className="text-sm">Create your first template to get started</div>
                    </div>
                  </td>
                </tr>
              ) : (
                templates.map((template) => (
                  <tr key={template.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {template.name}
                        </div>
                        {template.description && (
                          <div className="text-sm text-gray-500">
                            {template.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getJobTitle(template.job_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="text-xs text-gray-500">
                          Main: {JSON.parse(template.main_questions || "[]").length}
                        </div>
                        <div className="text-xs text-gray-500">
                          Extra: {JSON.parse(template.extra_questions || "[]").length}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        text={template.is_active ? "Active" : "Inactive"}
                        className={template.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {template.created_by_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(template)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          onClick={() => handleDelete(template.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create/Edit Modal */}
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