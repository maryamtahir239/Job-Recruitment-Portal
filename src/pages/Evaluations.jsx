import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Icon from "@/components/ui/Icon";
import Textinput from "@/components/ui/Textinput";
import Select from "@/components/ui/Select";
import EvaluationForm from "./EvaluationForm";

const Evaluations = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    jobId: "",
    evaluationStatus: ""
  });

  useEffect(() => {
    fetchApplications();
    fetchJobs();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/applications", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setApplications(response.data || []);
    } catch (error) {
      if (
        error.response?.status !== 401 &&
        error.response?.status !== 403 &&
        error.response?.data?.error !== "Invalid credentials"
      ) {
        toast.error("Failed to fetch applications");
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
    const matchesEvaluationStatus = !filters.evaluationStatus ||
      (filters.evaluationStatus === 'pending' && (application.evaluation_status === 'pending' || !application.evaluation_status)) ||
      (filters.evaluationStatus === 'completed' && application.evaluation_status === 'completed');

    return matchesSearch && matchesJob && matchesEvaluationStatus;
  });

  const getCheckinStatusBadge = (checkinStatus) => {
    if (checkinStatus === "arrived") {
      return (
        <Badge className="badge-success bg-green-100 text-green-700 text-sm border-green-200 flex items-center">
          <Icon icon="ph:check-circle" className="w-4 h-4 mr-1 text-green-600" />
          Present
        </Badge>
      );
    }
    return (
      <span className="text-sm text-gray-600">Pending</span>
    );
  };
  

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getJobTitle = (jobId) => {
    const job = jobs.find(j => j.id === jobId);
    return job ? job.title : "Unknown Job";
  };

  const handleEvaluate = (application) => {
    // Navigate to dedicated evaluation page like PendingEvaluations
    navigate(`/evaluate/${application.id}`, { state: { candidate: application } });
  };

  const handleEvaluationClose = () => {
    setShowEvaluationForm(false);
    setSelectedCandidate(null);
    fetchApplications(); // Refresh applications after evaluation
  };

  // This function is no longer needed as the dropdown button is removed
  // const updateEvaluationStatus = async (applicationId, newStatus) => {
  //   try {
  //     const token = localStorage.getItem("token");
  //     const response = await axios.put(`/api/applications/${applicationId}/evaluation-status`,
  //       { evaluation_status: newStatus },
  //       {
  //         headers: {
  //           'Authorization': `Bearer ${token}`,
  //           'Content-Type': 'application/json'
  //         }
  //       }
  //     );
  //     toast.success("Evaluation status updated successfully");
  //     fetchApplications();
  //   } catch (error) {
  //     console.error("Error updating evaluation status:", error);
  //     safeToastError("Failed to update evaluation status");
  //   }
  // };

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
      <Card className="shadow border dark:bg-gray-800 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Candidates Evaluations</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Evaluate and manage candidate assessments</p>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow border">
          <div className="flex flex-row-reverse items-center justify-between">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Icon icon="ph:file-text" className="text-blue-600 dark:text-blue-400 text-2xl" />
            </div>
            <div className="flex flex-col items-start">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{applications.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Total Applications</div>
            </div>
          </div>
        </Card>
        <Card className="shadow border">
          <div className="flex flex-row-reverse items-center justify-between">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <Icon icon="ph:clock" className="text-yellow-600 dark:text-yellow-400 text-2xl" />
            </div>
            <div className="flex flex-col items-start">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{applications.filter(a => a.evaluation_status === 'pending' || !a.evaluation_status).length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Pending Evaluations</div>
            </div>
          </div>
        </Card>
        <Card className="shadow border">
          <div className="flex flex-row-reverse items-center justify-between">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Icon icon="ph:check-circle" className="text-green-600 dark:text-green-400 text-2xl" />
            </div>
            <div className="flex flex-col items-start">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{applications.filter(a => a.evaluation_status === 'completed').length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Completed Evaluations</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Textinput
            label="Search Candidates"
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
            label="Filter by Evaluation Status"
            name="evaluationStatus"
            value={filters.evaluationStatus}
            onChange={handleFilterChange}
            options={[
              { value: "", label: "All Evaluations" },
              { value: "pending", label: "Pending" },
              { value: "completed", label: "Completed" }
            ]}
          />

          <div className="flex items-end">
            <Button
              text="Clear Filters"
              className="btn-outline-secondary w-full"
              onClick={() => setFilters({ search: "", jobId: "", evaluationStatus: "" })}
            />
          </div>
        </div>
      </Card>

      {/* Applications Table */}
      <Card className="shadow border">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Candidates</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Showing {filteredApplications.length} of {applications.length} candidates</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/30">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Candidate
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Job Applied
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Check-in Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Application
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500 dark:text-gray-300">
                    {applications.length === 0 ? "No applications found." : "No applications match your filters."}
                  </td>
                </tr>
              ) : (
                filteredApplications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {application.photo_url ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={`${application.photo_url.startsWith('http') ? application.photo_url : '/' + application.photo_url}`}
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
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[150px]">
                            {application.full_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-center">
                      <div className="truncate max-w-[200px] text-center" title={getJobTitle(application.job_id)}>
                        {getJobTitle(application.job_id)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-center">
                      {(() => {
                        const job = jobs.find(j => j.id === application.job_id);
                        return job && job.department ? job.department : 'N/A';
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                 {getCheckinStatusBadge(application.checkin_status)}
                  </td>

                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <Button
                        text="View"
                        className="btn-outline-primary btn-sm h-8 w-28"
                        onClick={() => navigate(`/applications/${application.id}`, { state: { from: 'evaluations' } })}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex justify-center space-x-2 items-center">
                        {application.evaluation_status === 'completed' ? (
                          <Button
                            text="Evaluated"
                            className="btn-success btn-sm h-8 w-28 cursor-not-allowed opacity-80"
                            disabled
                          />
                        ) : (
                          <Button
                            text="Evaluate"
                            className="btn-outline-primary btn-sm h-8 w-28"
                            onClick={() => handleEvaluate(application)}
                          />
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

      {/* Evaluation now opens on dedicated page via navigation */}
    </div>
  );
};

export default Evaluations;