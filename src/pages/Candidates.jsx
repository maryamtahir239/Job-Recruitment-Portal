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

const Candidates = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Ensure jobs is always an array
  const safeJobs = Array.isArray(jobs) ? jobs : [];
  const [filters, setFilters] = useState({
    search: "",
    jobId: "",
    status: "",
    dateRange: ""
  });

  useEffect(() => {
    fetchCandidates();
    fetchJobs();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found. Please log in.");
        setCandidates([]);
        setLoading(false);
        return;
      }

      const response = await axios.get("/api/candidates", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      setCandidates(response.data || []);
    } catch (error) {
      // Only show toast for non-authentication errors
      if (
        error.response?.status !== 401 &&
        error.response?.status !== 403 &&
        error.response?.data?.error !== "Invalid credentials"
      ) {
        safeToastError("Failed to fetch candidates");
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

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
                         candidate.email?.toLowerCase().includes(filters.search.toLowerCase());
    const matchesJob = !filters.jobId || candidate.job_id === parseInt(filters.jobId);
    const matchesStatus = !filters.status || candidate.status === filters.status;
    
    return matchesSearch && matchesJob && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      "Applied": { color: "success", text: "Applied" },
      "Under Review": { color: "warning", text: "Under Review" },
      "Shortlisted": { color: "info", text: "Shortlisted" },
      "Rejected": { color: "danger", text: "Rejected" },
      "Hired": { color: "success", text: "Hired" },
      "Not Invited": { color: "secondary", text: "Not Invited" }
    };
    
    const config = statusConfig[status] || { color: "secondary", text: status };
    return <Badge className={`badge-${config.color}`}>{config.text}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getJobTitle = (jobId) => {
    if (!jobId || safeJobs.length === 0) return "Unknown Job";
    const job = safeJobs.find(j => j.id === jobId);
    return job ? job.title : "Unknown Job";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Candidates</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button
            text="Retry"
            className="btn-primary"
            onClick={() => {
              setError(null);
              fetchCandidates();
              fetchJobs();
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow border rounded p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Candidates</h1>
          <p className="text-gray-600 mt-2">Manage and view all candidates across job postings</p>
        </div>
        {/* Removed Add Candidate button */}
      </div>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white shadow border">
          <div className="flex flex-row-reverse items-center justify-between">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon icon="ph:users" className="text-blue-600 text-2xl" />
            </div>
            <div className="flex flex-col items-start">
              <div className="text-2xl font-bold text-gray-900">{candidates.length}</div>
              <div className="text-sm text-gray-600">Total Candidates</div>
            </div>
          </div>
        </Card>
        <Card className="bg-white shadow border">
          <div className="flex flex-row-reverse items-center justify-between">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon icon="ph:envelope" className="text-green-600 text-2xl" />
            </div>
            <div className="flex flex-col items-start">
              <div className="text-2xl font-bold text-gray-900">{candidates.filter(c => c.invite_sent).length}</div>
              <div className="text-sm text-gray-600">Invites Sent</div>
            </div>
          </div>
        </Card>
        <Card className="bg-white shadow border">
          <div className="flex flex-row-reverse items-center justify-between">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Icon icon="ph:file-text" className="text-yellow-600 text-2xl" />
            </div>
            <div className="flex flex-col items-start">
              <div className="text-2xl font-bold text-gray-900">{candidates.filter(c => c.invite_status === "submitted").length}</div>
              <div className="text-sm text-gray-600">Applications Submitted</div>
            </div>
          </div>
        </Card>
        <Card className="bg-white shadow border">
          <div className="flex flex-row-reverse items-center justify-between">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon icon="ph:eye" className="text-blue-600 text-2xl" />
            </div>
            <div className="flex flex-col items-start">
              <div className="text-2xl font-bold text-gray-900">{candidates.filter(c => c.invite_status === "opened").length}</div>
              <div className="text-sm text-gray-600">Invites Opened</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Textinput
            label="Search Candidates"
            type="text"
            name="search"
            value={filters.search || ""}
            onChange={handleFilterChange}
            placeholder="Search by name or email"
          />
          
          <Select
            label="Filter by Job"
            name="jobId"
            value={filters.jobId || ""}
            onChange={handleFilterChange}
            options={[
              { value: "", label: "All Jobs" },
              ...safeJobs.filter(job => job && job.id && job.title).map(job => ({ 
                value: job.id.toString(), 
                label: job.title 
              }))
            ]}
          />
          
          <Select
            label="Filter by Status"
            name="status"
            value={filters.status || ""}
            onChange={handleFilterChange}
            options={[
              { value: "", label: "All Statuses" },
              { value: "Not Invited", label: "Not Invited" },
              { value: "Under Review", label: "Under Review" },
              { value: "Applied", label: "Applied" }
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

      {/* Candidates Table */}
      <Card>
        <div
          className={`w-full min-w-0 ${filteredCandidates.length > 2 ? 'max-h-[400px] overflow-y-auto' : ''}`}
          style={{ overflowX: 'hidden' }}
        >
          <table className="w-full min-w-0 divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidate Name
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Applied
                </th>
                {/* Removed Status column */}
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invite Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
  Check-in Status
</th>

                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Application
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    {candidates.length === 0 ? "No candidates found. Add some candidates to get started!" : "No candidates match your filters."}
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center">
                        {/* Removed avatar/icon and email */}
                        <div className="text-sm font-medium text-gray-900">
                          {candidate.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {getJobTitle(candidate.job_id)}
                    </td>
                    {/* Removed Status column */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      <div>
                        <div>{candidate.phone || "No phone"}</div>
                        <div className="text-gray-500">{candidate.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {candidate.invite_sent ? (
                        <Badge className={`badge-${candidate.invite_status === 'submitted' ? 'success' : candidate.invite_status === 'opened' ? 'warning' : 'info'}`}>
                          {candidate.invite_status === 'submitted' ? 'Submitted' : 
                           candidate.invite_status === 'opened' ? 'Opened' : 'Sent'}
                        </Badge>
                      ) : (
                        <Badge className="badge-secondary">Not Sent</Badge>
                      )}
                    </td>
                   <td className="px-6 py-4 whitespace-nowrap text-center">
{candidate.checkin_status === "arrived" ? (
  <Badge className="badge-success bg-green-100 text-green-700 text-sm border-green-200 flex items-center">
    <Icon icon="ph:check-circle" className="w-4 h-4 mr-1 text-green-600" />
    Present
  </Badge>
) : (
  <span className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">Pending</span>
)}

</td>


<td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">

                      <div className="flex justify-center space-x-2">
                        <div className="relative group">
                                                  <Button
                          text="View"
                          className="btn-outline-primary btn-sm"
                          onClick={() => {
                            console.log("Candidate data:", candidate);
                            console.log("Navigating to application ID:", candidate.application_id || candidate.id);
                            navigate(`/applications/${candidate.application_id || candidate.id}`, { 
                              state: { from: 'candidates' } 
                            });
                          }}
                          disabled={candidate.invite_status !== 'submitted'}
                        />
                          {candidate.invite_status !== 'submitted' && (
                            <div className="absolute z-10 right-full top-1/2 -translate-y-1/2 mr-2 px-2 py-1 rounded bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
                              Candidate has not submitted their application yet
                            </div>
                          )}
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
    </div>
  );
};

export default Candidates; 
