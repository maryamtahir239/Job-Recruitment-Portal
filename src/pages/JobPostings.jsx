import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import Textinput from "@/components/ui/Textinput";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Icon from "@/components/ui/Icon";

const JobPostings = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    openings: 1,
    status: "Active",
    deadline: "",
    description: "",
    requirements: "",
    salary_range: "",
    location: "",
    job_type: "Full-time"
  });

  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchJobs();
  }, []);

  // Handle edit parameter from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const editJobId = searchParams.get('edit');
    
    if (editJobId && jobs.length > 0) {
      const jobToEdit = jobs.find(job => job.id == editJobId);
      if (jobToEdit) {
        openModal(jobToEdit);
        // Clear the URL parameter after opening the modal
        navigate('/job-postings', { replace: true });
      }
    }
  }, [jobs, location.search, navigate]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/jobs");
      setJobs(response.data);
    } catch (error) {
      toast.error("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      department: "",
      openings: 1,
      status: "Active",
      deadline: "",
      description: "",
      requirements: "",
      salary_range: "",
      location: "",
      job_type: "Full-time"
    });
    setEditingJob(null);
  };

  const openModal = (job = null) => {
    if (job) {
      setEditingJob(job);
      setFormData({
        title: job.title || "",
        department: job.department || "",
        openings: job.openings || 1,
        status: job.status || "Active",
        deadline: job.deadline ? job.deadline.split('T')[0] : "",
        description: job.description || "",
        requirements: job.requirements || "",
        salary_range: job.salary_range || "",
        location: job.location || "",
        job_type: job.job_type || "Full-time"
      });
    } else {
      resetForm();
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.deadline) {
      toast.error("Title and deadline are required");
      return;
    }

    try {
      if (editingJob) {
        await axios.put(`/api/jobs/${editingJob.id}`, formData);
        toast.success("Job updated successfully");
      } else {
        await axios.post("/api/jobs", formData);
        toast.success("Job created successfully");
      }
      
      closeModal();
      fetchJobs();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to save job");
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) {
      return;
    }

    try {
      await axios.delete(`/api/jobs/${jobId}`);
      toast.success("Job deleted successfully");
      fetchJobs();
    } catch (error) {
      toast.error("Failed to delete job");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      "Active": { color: "success", text: "Active" },
      "Closed": { color: "danger", text: "Closed" },
      "Draft": { color: "warning", text: "Draft" }
    };
    
    const config = statusConfig[status] || { color: "secondary", text: status };
    return <Badge className={`badge-${config.color}`}>{config.text}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Postings</h1>
          <p className="text-gray-600 mt-2">
            {user?.role === 'superadmin' 
              ? 'Monitor and view job postings across the organization' 
              : 'Manage and create job postings for your organization'
            }
          </p>
        </div>
        {user?.role !== 'superadmin' && (
          <Button
            text="Create New Job"
            className="btn-primary"
            onClick={() => openModal()}
          />
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="flex-1">
              <h4 className="text-2xl font-bold text-gray-900">{jobs.length}</h4>
              <p className="text-gray-600">Total Jobs</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon icon="ph:briefcase" className="text-blue-600 text-xl" />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="flex-1">
              <h4 className="text-2xl font-bold text-gray-900">
                {jobs.filter(job => job.status === "Active").length}
              </h4>
              <p className="text-gray-600">Active Jobs</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon icon="ph:check-circle" className="text-green-600 text-xl" />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="flex-1">
              <h4 className="text-2xl font-bold text-gray-900">
                {jobs.filter(job => job.status === "Closed").length}
              </h4>
              <p className="text-gray-600">Closed Jobs</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Icon icon="ph:x-circle" className="text-red-600 text-xl" />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="flex-1">
              <h4 className="text-2xl font-bold text-gray-900">
                {jobs.reduce((sum, job) => sum + (job.openings || 0), 0)}
              </h4>
              <p className="text-gray-600">Total Openings</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Icon icon="ph:users" className="text-purple-600 text-xl" />
            </div>
          </div>
        </Card>
      </div>

      {/* Jobs Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Title
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Openings
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deadline
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No jobs found. Create your first job posting!
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-medium text-gray-900">{job.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {job.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {job.openings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {getStatusBadge(job.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {job.deadline ? formatDate(job.deadline) : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {formatDate(job.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex justify-center space-x-2">
                        <Button
                          text="View Details"
                          className="btn-outline-primary btn-sm"
                          onClick={() => navigate(`/job-postings/${job.id}`)}
                        />
                        {user?.role !== 'superadmin' && (
                          <>
                            <Button
                              text="Edit"
                              className="btn-outline-primary btn-sm"
                              onClick={() => openModal(job)}
                            />
                            <Button
                              text="Delete"
                              className="btn-outline-danger btn-sm"
                              onClick={() => handleDelete(job.id)}
                            />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create/Edit Job Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingJob ? "Edit Job" : "Create New Job"}
        label="Job Form"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Textinput
              label="Job Title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter job title"
              required
            />
            
            <Textinput
              label="Department"
              type="text"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              placeholder="Enter department"
            />
            
            <Textinput
              label="Number of Openings"
              type="number"
              name="openings"
              value={formData.openings}
              onChange={handleInputChange}
              min="1"
              required
            />
            
            <Select
              label="Job Type"
              name="job_type"
              value={formData.job_type}
              onChange={handleInputChange}
              options={[
                { value: "Full-time", label: "Full-time" },
                { value: "Part-time", label: "Part-time" },
                { value: "Contract", label: "Contract" },
                { value: "Internship", label: "Internship" }
              ]}
            />
            
            <Textinput
              label="Location"
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Enter job location"
            />
            
            <Textinput
              label="Salary Range"
              type="text"
              name="salary_range"
              value={formData.salary_range}
              onChange={handleInputChange}
              placeholder="e.g., $50,000 - $70,000"
            />
            
            <Textinput
              label="Application Deadline"
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleInputChange}
              required
            />
            
            <Select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              options={[
                { value: "Active", label: "Active" },
                { value: "Draft", label: "Draft" },
                { value: "Closed", label: "Closed" }
              ]}
            />
          </div>
          
          <Textarea
            label="Job Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter detailed job description"
            rows="4"
          />
          
          <Textarea
            label="Requirements"
            name="requirements"
            value={formData.requirements}
            onChange={handleInputChange}
            placeholder="Enter job requirements and qualifications"
            rows="4"
          />
          
          <div className="flex justify-end space-x-3">
            <Button
              text="Cancel"
              className="btn-outline-secondary"
              onClick={closeModal}
              type="button"
            />
            <Button
              text={editingJob ? "Update Job" : "Create Job"}
              className="btn-primary"
              type="submit"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default JobPostings; 