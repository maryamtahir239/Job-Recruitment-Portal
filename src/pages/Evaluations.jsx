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
import { safeToastError } from "@/utility/safeToast";
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
    const matchesEvaluationStatus = !filters.evaluationStatus || 
      (filters.evaluationStatus === 'pending' && (application.evaluation_status === 'pending' || !application.evaluation_status)) ||
      (filters.evaluationStatus === 'completed' && application.evaluation_status === 'completed');
    
    return matchesSearch && matchesJob && matchesEvaluationStatus;
  });

  const getEvaluationStatusBadge = (evaluationStatus) => {
    if (!evaluationStatus || evaluationStatus === 'pending') {
      return <Badge className="badge-warning">Pending</Badge>;
    }
    return <Badge className="badge-success">Completed</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getJobTitle = (jobId) => {
    const job = jobs.find(j => j.id === jobId);
    return job ? job.title : "Unknown Job";
  };

  const handleEvaluate = (application) => {
    // Add job title to the application object for the evaluation form
    const applicationWithJobTitle = {
      ...application,
      job_title: getJobTitle(application.job_id)
    };
    setSelectedCandidate(applicationWithJobTitle);
    setShowEvaluationForm(true);
  };

  const handleEvaluationClose = () => {
    setShowEvaluationForm(false);
    setSelectedCandidate(null);
    fetchApplications(); // Refresh applications after evaluation
  };

  const updateEvaluationStatus = async (applicationId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      
      const response = await axios.put(`/api/applications/${applicationId}/evaluation-status`, 
        { evaluation_status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      toast.success("Evaluation status updated successfully");
      fetchApplications();
    } catch (error) {
      console.error("Error updating evaluation status:", error);
      safeToastError("Failed to update evaluation status");
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
       <Card className="bg-white shadow border">
         <div className="flex justify-between items-center">
           <div>
             <h1 className="text-3xl font-bold text-gray-900">Candidates Assessment</h1>
             <p className="text-gray-600 mt-2">Evaluate and manage candidate assessments</p>
           </div>
         </div>
       </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white shadow border">
          <div className="flex flex-row-reverse items-center justify-between">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon icon="ph:file-text" className="text-blue-600 text-2xl" />
            </div>
            <div className="flex flex-col items-start">
              <div className="text-2xl font-bold text-gray-900">{applications.length}</div>
              <div className="text-sm text-gray-600">Total Applications</div>
            </div>
          </div>
        </Card>
        <Card className="bg-white shadow border">
          <div className="flex flex-row-reverse items-center justify-between">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Icon icon="ph:clock" className="text-yellow-600 text-2xl" />
            </div>
            <div className="flex flex-col items-start">
              <div className="text-2xl font-bold text-gray-900">{applications.filter(a => a.evaluation_status === 'pending' || !a.evaluation_status).length}</div>
              <div className="text-sm text-gray-600">Pending Evaluations</div>
            </div>
          </div>
        </Card>
        <Card className="bg-white shadow border">
          <div className="flex flex-row-reverse items-center justify-between">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon icon="ph:check-circle" className="text-green-600 text-2xl" />
            </div>
            <div className="flex flex-col items-start">
              <div className="text-2xl font-bold text-gray-900">{applications.filter(a => a.evaluation_status === 'completed').length}</div>
              <div className="text-sm text-gray-600">Completed Evaluations</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white shadow border">
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
      <Card className="bg-white shadow border">
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
                  Evaluation Status
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
                              src={`/${application.photo_url}`} 
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
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      <div className="truncate max-w-[200px] text-center" title={getJobTitle(application.job_id)}>
                        {getJobTitle(application.job_id)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {getEvaluationStatusBadge(application.evaluation_status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {formatDate(application.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      <div className="text-center">
                        <div className="truncate max-w-[120px] text-center" title={application.phone || "No phone"}>
                          {application.phone || "No phone"}
                        </div>
                        <div className="text-gray-500 break-all text-center" title={application.email}>
                          {application.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex justify-center space-x-2 items-center">
                        <Button
                          text="Evaluate"
                          className="btn-outline-primary btn-sm h-8"
                          onClick={() => handleEvaluate(application)}
                        />
                        <div className="relative">
                          <select
                            value={application.evaluation_status || 'pending'}
                            onChange={(e) => updateEvaluationStatus(application.id, e.target.value)}
                            className="appearance-none bg-white border border-blue-500 text-blue-600 rounded-md px-1 h-8 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer hover:bg-blue-50 transition-colors duration-200 min-w-[80px]"
                          >
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
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

             {/* Evaluation Form Modal */}
       {showEvaluationForm && selectedCandidate && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 transition-all duration-300 ease-in-out">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] overflow-hidden transform transition-all duration-300 ease-in-out scale-100">
             <EvaluationForm 
               candidate={selectedCandidate} 
               onClose={handleEvaluationClose}
             />
           </div>
         </div>
       )}
    </div>
  );
};

export default Evaluations; 