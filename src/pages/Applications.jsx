import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Icon from "@/components/ui/Icon";
import Textinput from "@/components/ui/Textinput";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { safeToastError } from "@/utility/safeToast";

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    jobId: "",
    status: "",
    dateRange: ""
  });

  useEffect(() => {
    fetchApplications();
    fetchJobs();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("/api/applications");
      setApplications(response.data || []);
    } catch (error) {
      // Only show toast for non-authentication errors
      if (
        error.response?.status !== 401 &&
        error.response?.status !== 403 &&
        error.response?.data?.error !== "Invalid credentials"
      ) {
        safeToastError("Failed to fetch applications");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await axios.get("/api/jobs");
      setJobs(response.data || []);
    } catch (error) {
      setJobs([]);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredApplications = applications.filter(application => {
    const matchesSearch = application.full_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
                         application.email?.toLowerCase().includes(filters.search.toLowerCase());
    const matchesJob = !filters.jobId || application.job_id === parseInt(filters.jobId);
    const matchesStatus = !filters.status || application.status === filters.status;
    
    return matchesSearch && matchesJob && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      "Applied": { color: "success", text: "Applied" },
      "Under Review": { color: "warning", text: "Under Review" },
      "Shortlisted": { color: "info", text: "Shortlisted" },
      "Rejected": { color: "danger", text: "Rejected" },
      "Hired": { color: "success", text: "Hired" }
    };
    
    const config = statusConfig[status] || { color: "secondary", text: status };
    return <Badge className={`badge-${config.color}`}>{config.text}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getJobTitle = (jobId) => {
    const job = jobs.find(j => j.id === jobId);
    return job ? job.title : "Unknown Job";
  };

  const viewApplicationDetails = (application) => {
    setSelectedApplication(application);
    setModalOpen(true);
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      await axios.put(`/api/applications/${applicationId}`, { status: newStatus });
      toast.success("Application status updated successfully");
      fetchApplications();
          } catch (error) {
        safeToastError("Failed to update application status");
      }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Applications</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button
            text="Retry"
            className="btn-primary"
            onClick={() => {
              setError(null);
              fetchApplications();
              fetchJobs();
            }}
          />
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
          <p className="text-gray-600 mt-2">Review and manage all job applications</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="flex-1">
              <h4 className="text-2xl font-bold text-gray-900">{applications.length}</h4>
              <p className="text-gray-600">Total Applications</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon icon="ph:file-text" className="text-blue-600 text-xl" />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="flex-1">
              <h4 className="text-2xl font-bold text-gray-900">
                {applications.filter(a => a.status === "Applied").length}
              </h4>
              <p className="text-gray-600">New Applications</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon icon="ph:plus-circle" className="text-green-600 text-xl" />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="flex-1">
              <h4 className="text-2xl font-bold text-gray-900">
                {applications.filter(a => a.status === "Shortlisted").length}
              </h4>
              <p className="text-gray-600">Shortlisted</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Icon icon="ph:star" className="text-yellow-600 text-xl" />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="flex-1">
              <h4 className="text-2xl font-bold text-gray-900">
                {applications.filter(a => a.status === "Hired").length}
              </h4>
              <p className="text-gray-600">Hired</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Icon icon="ph:check-circle" className="text-purple-600 text-xl" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Textinput
            label="Search Applications"
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search by name or email"
          />
          
          <Select
            label="Filter by Job"
            name="jobId"
            value={filters.jobId}
            onChange={handleFilterChange}
            options={[
              { value: "", label: "All Jobs" },
              ...jobs.map(job => ({ value: job.id, label: job.title }))
            ]}
          />
          
          <Select
            label="Filter by Status"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            options={[
              { value: "", label: "All Statuses" },
              { value: "Applied", label: "Applied" },
              { value: "Under Review", label: "Under Review" },
              { value: "Shortlisted", label: "Shortlisted" },
              { value: "Rejected", label: "Rejected" },
              { value: "Hired", label: "Hired" }
            ]}
          />
          
          <div className="flex items-end">
            <Button
              text="Clear Filters"
              className="btn-outline-secondary w-full"
              onClick={() => setFilters({ search: "", jobId: "", status: "", dateRange: "" })}
            />
          </div>
        </div>
      </Card>

      {/* Applications Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidate
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Applied
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applied Date
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    {applications.length === 0 ? "No applications found." : "No applications match your filters."}
                  </td>
                </tr>
              ) : (
                filteredApplications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {application.photo_url ? (
                            <img 
                              className="h-10 w-10 rounded-full object-cover" 
                              src={`/api/uploads/applications/${application.photo_url}`} 
                              alt="Profile" 
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className={`h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center ${application.photo_url ? 'hidden' : ''}`}>
                            <span className="text-white text-sm font-medium">
                              {application.full_name ? application.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'NA'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                            {application.full_name}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-[150px]">
                            {application.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      <div className="truncate max-w-[200px] text-center" title={getJobTitle(application.job_id)}>
                        {getJobTitle(application.job_id)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {getStatusBadge(application.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {formatDate(application.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      <div className="text-center">
                        <div className="truncate max-w-[120px] text-center" title={application.phone || "No phone"}>
                          {application.phone || "No phone"}
                        </div>
                        <div className="text-gray-500 truncate max-w-[120px] text-center" title={application.email}>
                          {application.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex justify-center space-x-2 items-center">
                        <Button
                          text="View"
                          className="btn-outline-primary btn-sm h-8"
                          onClick={() => viewApplicationDetails(application)}
                        />
                        <div className="relative">
                          <select
                            value={application.status}
                            onChange={(e) => updateApplicationStatus(application.id, e.target.value)}
                            className="appearance-none bg-white border border-blue-500 text-blue-600 rounded-md px-3 h-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer hover:bg-blue-50 transition-colors duration-200 min-w-[120px]"
                          >
                            <option value="Applied">Applied</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Shortlisted">Shortlisted</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Hired">Hired</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-blue-600">
                            <Icon icon="ph:caret-down" className="text-xs" />
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Application Details Modal */}
      <Modal
        title="Application Details"
        label="Application Details"
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        {selectedApplication && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Personal Information</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Name:</strong> {selectedApplication.full_name}</div>
                  <div><strong>Email:</strong> {selectedApplication.email}</div>
                  <div><strong>Phone:</strong> {selectedApplication.phone || "Not provided"}</div>
                  <div><strong>Date of Birth:</strong> {selectedApplication.date_of_birth || "Not provided"}</div>
                  <div><strong>Gender:</strong> {selectedApplication.gender || "Not provided"}</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Application Details</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Job Applied:</strong> {getJobTitle(selectedApplication.job_id)}</div>
                  <div><strong>Status:</strong> {getStatusBadge(selectedApplication.status)}</div>
                  <div><strong>Applied Date:</strong> {formatDate(selectedApplication.created_at)}</div>
                  <div><strong>Current Status:</strong> {selectedApplication.current_status || "Not provided"}</div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Education</h4>
              <div className="text-sm text-gray-600">
                {selectedApplication.education || "No education details provided"}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Experience</h4>
              <div className="text-sm text-gray-600">
                {selectedApplication.experience || "No experience details provided"}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                text="Close"
                className="btn-outline-secondary"
                onClick={() => setModalOpen(false)}
              />
              <Button
                text="Download Resume"
                className="btn-primary"
                onClick={() => {
                  if (selectedApplication.resume_url) {
                    window.open(`/uploads/applications/${selectedApplication.resume_url}`, '_blank');
                  } else {
                    if (!application.resume_path) {
                      safeToastError("No resume available");
                      return;
                    }
                    safeToastError("No resume available");
                  }
                }}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Applications; 