import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faPlus, faEye, faArrowLeft, faSearch, faFilter, faSort } from "@fortawesome/free-solid-svg-icons";
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

// Template Form Component for Create/Edit
function TemplateForm({ template, jobs, onSave, onCancel, submitting, mode }) {
  
  // Extract unique departments from jobs
  const departments = Array.from(new Set(jobs.map(job => job.department).filter(Boolean)));

  // Helper to get the department for a given job_id
  const getDepartmentForJob = (jobId) => {
    const job = jobs.find(j => String(j.id) === String(jobId));
    return job ? job.department : '';
  };

  // Default questions for new templates
  const defaultQuestions = [
    "Educational Qualifications",
    "Work Experience", 
    "Technical/Professional Skills",
    "Communication Skills",
    "Confidence and Clarity"
  ];

  const [formData, setFormData] = useState({
    name: template?.name || "",
    description: template?.description || "",
    department: template?.department || getDepartmentForJob(template?.job_id) || "",
    job_id: template?.job_id || "",
    main_questions: mode === 'create' ? defaultQuestions : [],
    is_active: template?.is_active !== undefined ? template.is_active : true,
  });

  useEffect(() => {
    if (template) {
      let mainQuestions = [];
      try {
        if (Array.isArray(template.main_questions)) {
          mainQuestions = template.main_questions;
        } else if (template.main_questions) {
          mainQuestions = JSON.parse(template.main_questions);
        }
      } catch (error) {
        console.error("Error parsing main_questions:", error);
        mainQuestions = [];
      }

      setFormData({
        name: template.name || "",
        description: template.description || "",
        department: template.department || getDepartmentForJob(template.job_id) || "",
        job_id: template.job_id || "",
        main_questions: mainQuestions,
        is_active: template.is_active !== undefined ? template.is_active : true,
      });
    }
  }, [template, jobs]);

  // When department changes, reset job_id
  const handleDepartmentChange = (e) => {
    const department = e.target.value;
    setFormData(prev => ({ ...prev, department, job_id: "" }));
  };

  // Only show jobs for the selected department
  const filteredJobs = formData.department
    ? jobs.filter(job => job.department === formData.department && job.status === "Active")
    : [];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuestionChange = (type, index, value) => {
    setFormData((prev) => ({
      ...prev,
      main_questions: prev.main_questions.map((q, i) => (i === index ? value : q)),
    }));
  };

  const addQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      main_questions: [...prev.main_questions, ""],
    }));
  };

  const removeQuestion = (index) => {
    setFormData((prev) => ({
      ...prev,
      main_questions: prev.main_questions.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const filteredMainQuestions = formData.main_questions.filter((q) => q.trim() !== "");

    if (filteredMainQuestions.length < 5) {
      toast.error("At least 5 main questions are required");
        return;
      }

      const payload = {
      ...formData,
      job_id: formData.job_id || null,
        main_questions: filteredMainQuestions,
      };

        await onSave(payload);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl relative flex-shrink-0">
        <div className="flex justify-between items-center pr-12">
        <div>
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
              {mode === 'create' ? 'Create Evaluation Template' : 'Edit Evaluation Template'}
            </h2>
            <p className="text-blue-100 text-lg font-medium">
              {mode === 'create' ? 'Create a new evaluation template' : 'Update existing template'}
            </p>
        </div>
        </div>
        {/* Back Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-white hover:text-blue-200 transition-colors duration-200 p-2 rounded-full hover:bg-white/10"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="text-xl" />
        </button>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleDepartmentChange}
              required
              placeholder="Select Department"
              options={departments.map(dept => ({ value: dept, label: dept }))}
            />
            <Select
              label="Job Position"
              name="job_id"
              value={formData.job_id}
            onChange={handleInputChange}
              required
              disabled={!formData.department}
              placeholder="Select Job Position"
              options={filteredJobs.map(job => ({ value: job.id, label: job.title }))}
          />
        </div>

          <Textarea
            label="Description (Optional)"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
          />

          {/* Main Questions */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-800">Main Questions</h3>
              <Badge className="badge-info">
                {formData.main_questions.filter(q => q.trim() !== "").length} questions
              </Badge>
        </div>
            {formData.main_questions.map((question, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <Textinput
                      label={`Question ${index + 1}`}
                      type="text"
                      value={question}
                      onChange={(e) => handleQuestionChange("main_questions", index, e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  <div className="flex items-center justify-center mb-1">
                    <button
                      onClick={() => removeQuestion(index)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-200 flex items-center justify-center"
                      title="Delete question"
                    >
                      <FontAwesomeIcon icon={faTrash} className="text-lg" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
            <div className="flex justify-center pt-4">
              <Button 
                text="Add Question" 
                onClick={addQuestion}
                className="btn-secondary" 
                size="sm" 
              />
            </div>
      </div>

          {/* Active Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                Active Template
              </label>
            </div>
            <div className="text-sm text-gray-500">
              {formData.is_active ? (
                <span className="text-green-600">✅ Interviewers can use this template</span>
              ) : (
                <span className="text-red-600">❌ Interviewers cannot use this template</span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button
          text="Cancel"
          onClick={onCancel}
          className="btn-secondary"
          disabled={submitting}
        />
        <Button
              text={mode === 'create' ? "Create Template" : "Update Template"}
          type="submit"
          className="btn-primary"
          loading={submitting}
        />
          </div>
        </form>
      </div>
    </div>
  );
}

// Template Preview Component (Admin View) - matches EvaluationForm.jsx structure
function TemplatePreview({ template, jobs, onBack }) {
  // Get job and department info
  const job = jobs.find(j => String(j.id) === String(template.job_id));
  const department = job?.department || template.department || "-";
  const jobTitle = job?.title || "-";

  // Get questions from template (do not show defaults unless template has none)
  const mainQuestions = Array.isArray(template.main_questions)
    ? template.main_questions
    : JSON.parse(template.main_questions || "[]");
  const questions = mainQuestions.length > 0 ? mainQuestions : [];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl relative flex-shrink-0">
        <div className="flex justify-between items-center pr-12">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Interview Evaluation Form</h2>
            <p className="text-blue-100 text-lg font-medium">Comprehensive candidate assessment</p>
          </div>
        </div>
        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute top-4 right-4 text-white hover:text-blue-200 transition-colors duration-200 p-2 rounded-full hover:bg-white/10"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="text-xl" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Template Information */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Icon icon="ph:file-text" className="text-blue-600 text-lg" />
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Template Name</div>
                <div className="font-medium text-gray-900 text-sm">{template.name}</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Icon icon="ph:briefcase" className="text-green-600 text-lg" />
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Position</div>
                <div className="font-medium text-gray-900 text-sm">{jobTitle}</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Icon icon="ph:buildings" className="text-purple-600 text-lg" />
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Department</div>
                <div className="font-medium text-gray-900 text-sm">{department}</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Icon icon="ph:calendar" className="text-orange-600 text-lg" />
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Template Status</div>
                <div className="font-medium text-gray-900 text-sm">{template.is_active ? "Active" : "Inactive"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Evaluation Criteria */}
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Evaluation Criteria</h3>
          
          <div className="space-y-4">
            {questions.length === 0 ? (
              <div className="text-gray-500 text-center py-8">No evaluation criteria defined for this template.</div>
            ) : (
              questions.map((criteria, index) => (
                <Card key={index} className="p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="mb-3">
                    <h4 className="text-base font-medium text-gray-900 mb-3">{criteria}</h4>
                    <div className="flex flex-wrap items-center gap-3">
                      {["Excellent", "Good", "Average", "Satisfactory", "Unsatisfactory"].map((label, i) => (
                        <span key={i} className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-200">
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const EvaluationTemplateManagement = () => {
  
  const navigate = useNavigate();
  
  // Check localStorage availability
  if (typeof localStorage === 'undefined') {
    console.error("localStorage not available");
    return <div className="p-6">Error: localStorage not available</div>;
  }
  
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  
  // State management
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // View modes: 'list', 'create', 'edit', 'view'
  const [currentView, setCurrentView] = useState('list');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");

  // Load templates and jobs on mount
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [templatesData, jobsData] = await Promise.all([
          getEvaluationTemplates(token),
          listJobs(token),
        ]);
        setTemplates(templatesData || []);
        setFilteredTemplates(templatesData || []);
        setJobs(jobsData || []);
      } catch (err) {
        console.error("Failed to load data:", err);
        setTemplates([]);
        setFilteredTemplates([]);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [token]);

  // Filter and sort templates
  useEffect(() => {
    let filtered = [...templates];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getJobTitle(template.job_id).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(template => 
        statusFilter === "active" ? template.is_active : !template.is_active
      );
    }

    // Department filter
    if (departmentFilter !== "all") {
      filtered = filtered.filter(template => {
        const job = jobs.find(j => j.id === template.job_id);
        return job?.department === departmentFilter;
      });
    }

    // Active filter
    if (activeFilter !== "all") {
      filtered = filtered.filter(template => 
        activeFilter === "active" ? template.is_active : !template.is_active
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "job_title":
          aValue = getJobTitle(a.job_id).toLowerCase();
          bValue = getJobTitle(b.job_id).toLowerCase();
          break;
        default:
          aValue = a[sortBy];
          bValue = b[sortBy];
      }

      // Always sort in ascending order
      return aValue > bValue ? 1 : -1;
    });

    setFilteredTemplates(filtered);
  }, [templates, searchTerm, statusFilter, departmentFilter, activeFilter, sortBy, jobs]);

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setCurrentView('create');
  };

  const handleEditTemplate = (template) => {
    setSelectedTemplate(template);
    setCurrentView('edit');
  };

  const handleViewTemplate = (template) => {
    setSelectedTemplate(template);
    setCurrentView('view');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedTemplate(null);
  };

  const handleSaveTemplate = async (payload) => {
    setSubmitting(true);
    try {
      if (currentView === 'create') {
        await createEvaluationTemplate(token, payload);
        toast.success("Template created successfully");
      } else {
        await updateEvaluationTemplate(token, selectedTemplate.id, payload);
        toast.success("Template updated successfully");
      }
      
      // Reload templates
      const templatesData = await getEvaluationTemplates(token);
      setTemplates(templatesData || []);
      
      handleBackToList();
    } catch (err) {
      let msg = "Failed to save template";
      if (err && err.message) msg = err.message;
      safeToastError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTemplate = async (id) => {
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

  const getDepartments = () => {
    const departments = Array.from(new Set(jobs.map(job => job.department).filter(Boolean)));
    return departments;
  };

  // Authentication checks
  if (!token || !user) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600">Authentication Error</h1>
        <p className="text-gray-600">Please log in to access this page.</p>
      </div>
    );
  }

  if (user.role !== "SuperAdmin") {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="text-gray-600">You need SuperAdmin privileges to access this page.</p>
        <p className="text-sm text-gray-500 mt-2">Your role: {user.role}</p>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <div className="text-lg text-gray-600">Loading evaluation templates...</div>
        </div>
      </div>
    );
  }

  // Render different views
  if (currentView === 'create') {
    return (
      <div className="max-w-4xl mx-auto h-screen">
        <TemplateForm
          template={null}
          jobs={jobs}
          onSave={handleSaveTemplate}
          onCancel={handleBackToList}
          submitting={submitting}
          mode="create"
        />
      </div>
    );
  }

  if (currentView === 'edit') {
    return (
      <div className="max-w-4xl mx-auto h-screen">
        <TemplateForm
          template={selectedTemplate}
          jobs={jobs}
          onSave={handleSaveTemplate}
          onCancel={handleBackToList}
          submitting={submitting}
          mode="edit"
        />
      </div>
    );
  }

  if (currentView === 'view') {
    return (
      <div className="max-w-4xl mx-auto h-screen">
        <TemplatePreview
          template={selectedTemplate}
          jobs={jobs}
          onBack={handleBackToList}
        />
      </div>
    );
  }

  // Main list view
  return (
    <div className="max-w-6xl mx-auto p-4 pt-2">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl mb-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Evaluation Templates</h1>
            <p className="text-blue-100 text-lg font-medium">Manage evaluation templates for different positions</p>
          </div>
          <Button
            text="Create Template"
            onClick={handleCreateTemplate}
            className="btn-white"
            icon={faPlus}
          />
        </div>
      </div>

      {/* Search and Filter Bar */}
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Textinput
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: "all", label: "All Status" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" }
            ]}
          />

          {/* Department Filter */}
          <Select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            options={[
              { value: "all", label: "All Departments" },
              ...getDepartments().map(dept => ({ value: dept, label: dept }))
            ]}
          />

          <Select
            label="Active Status"
            name="activeFilter"
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            options={[
              { value: "all", label: "All Templates" },
              { value: "active", label: "Active Only" },
              { value: "inactive", label: "Inactive Only" }
            ]}
          />

        </div>
      </Card>

      {/* Results Summary */}
      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {filteredTemplates.length} of {templates.length} templates
        </div>
        <div className="text-sm text-gray-600">
          {searchTerm && `Search: "${searchTerm}"`}
        </div>
      </div>

      {/* Templates List */}
          <div className="space-y-4">
        {filteredTemplates.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-gray-500 mb-4">
              <Icon icon="ph:file-text" className="text-6xl mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                {templates.length === 0 ? "No Templates Found" : "No Templates Match Your Search"}
              </h3>
              <p className="text-gray-500">
                {templates.length === 0 
                  ? "Create your first evaluation template to get started."
                  : "Try adjusting your search criteria or filters."
                }
              </p>
            </div>
            {templates.length === 0 && (
              <Button
                text="Create First Template"
                onClick={handleCreateTemplate}
                className="btn-primary"
                icon={faPlus}
              />
            )}
          </Card>
        ) : (
          filteredTemplates.map((template) => (
            <Card key={template.id} className="p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                    <Badge className={template.is_active ? "badge-success" : "badge-danger"}>
                      {template.is_active ? "Active" : "Inactive"}
                    </Badge>
                    {template.is_active && (
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        Available to Interviewers
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-2">{template.description || "No description"}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Icon icon="ph:briefcase" className="text-gray-400" />
                      <span>{getJobTitle(template.job_id)}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Icon icon="ph:user" className="text-gray-400" />
                      <span>{template.created_by_name || 'Unknown'}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Icon icon="ph:calendar" className="text-gray-400" />
                      <span>{new Date(template.created_at).toLocaleDateString()}</span>
                    </span>
          </div>
            </div>
                <div className="flex items-center space-x-2">
                  <Button
                    text="View"
                    onClick={() => handleViewTemplate(template)}
                    className="btn-secondary"
                    size="md"
                  />
                  <Button
                    text="Edit"
                    onClick={() => handleEditTemplate(template)}
                    className="btn-primary"
                    size="md"
                  />
                  <Button
                    text="Delete"
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="btn-danger"
                    size="md"
                  />
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
      </div>
    );
};

export default EvaluationTemplateManagement; 