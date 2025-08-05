import React, { useEffect, useState } from "react";
import Card from "@/components/ui/card";
import Button from "../components/ui/Button.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Badge from "@/components/ui/Badge";
import Icon from "@/components/ui/Icon";
import Textinput from "@/components/ui/Textinput";
import Select from "@/components/ui/Select";

const PendingEvaluations = () => {
  const [pendingEvaluations, setPendingEvaluations] = useState([]);
  const [allApplications, setAllApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    jobId: "",
    daysPending: ""
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPendingEvaluations = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/applications", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        setAllApplications(response.data || []);
        
        // Filter for pending evaluations
        const pending = response.data.filter(application => 
          !application.evaluation_status || application.evaluation_status === 'pending'
        );
        
        setPendingEvaluations(pending);
      } catch (error) {
        console.error("Error fetching pending evaluations:", error);
        setPendingEvaluations([]);
        setAllApplications([]);
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

    fetchPendingEvaluations();
    fetchJobs();
  }, []);

  const handleEvaluate = (candidate) => {
    navigate(`/evaluate/${candidate.id}`, { state: { candidate } });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysPending = (dateString) => {
    if (!dateString) return 0;
    return Math.floor((new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24));
  };

  const getJobTitle = (jobId) => {
    const job = jobs.find(j => j.id === jobId);
    return job ? job.title : "Unknown Job";
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredPendingEvaluations = pendingEvaluations.filter(evaluation => {
    const matchesSearch = evaluation.full_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
                         evaluation.email?.toLowerCase().includes(filters.search.toLowerCase());
    const matchesJob = !filters.jobId || evaluation.job_id === parseInt(filters.jobId);
    const daysPending = getDaysPending(evaluation.created_at);
    const matchesDays = !filters.daysPending || 
      (filters.daysPending === "1-3" && daysPending >= 1 && daysPending <= 3) ||
      (filters.daysPending === "4-7" && daysPending >= 4 && daysPending <= 7) ||
      (filters.daysPending === "8+" && daysPending >= 8);
    
    return matchesSearch && matchesJob && matchesDays;
  });

  // Calculate statistics
  const totalPending = pendingEvaluations.length;
  const urgentPending = pendingEvaluations.filter(e => getDaysPending(e.created_at) >= 7).length;
  const averageDaysPending = totalPending > 0 
    ? Math.round(pendingEvaluations.reduce((sum, e) => sum + getDaysPending(e.created_at), 0) / totalPending)
    : 0;
  const uniquePositions = [...new Set(pendingEvaluations.map(e => e.job_id))].length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white shadow border">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pending Evaluations</h1>
            <p className="text-gray-600 mt-2">Review and evaluate pending candidate assessments</p>
          </div>
          <Button
            text="Back to Evaluations"
            className="btn-outline-primary"
            onClick={() => navigate("/evaluations")}
          />
        </div>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white shadow border">
          <div className="flex items-center">
            <div className="flex-1">
              <h4 className="text-2xl font-bold text-gray-900">{totalPending}</h4>
              <p className="text-gray-600">Total Pending</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Icon icon="ph:clock" className="text-yellow-600 text-xl" />
            </div>
          </div>
        </Card>
        
        <Card className="bg-white shadow border">
          <div className="flex items-center">
            <div className="flex-1">
              <h4 className="text-2xl font-bold text-red-600">{urgentPending}</h4>
              <p className="text-gray-600">Urgent (7+ days)</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Icon icon="ph:warning" className="text-red-600 text-xl" />
            </div>
          </div>
        </Card>
        
        <Card className="bg-white shadow border">
          <div className="flex items-center">
            <div className="flex-1">
              <h4 className="text-2xl font-bold text-gray-900">{averageDaysPending}</h4>
              <p className="text-gray-600">Avg Days Pending</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon icon="ph:calendar" className="text-blue-600 text-xl" />
            </div>
          </div>
        </Card>
        
        <Card className="bg-white shadow border">
          <div className="flex items-center">
            <div className="flex-1">
              <h4 className="text-2xl font-bold text-gray-900">{uniquePositions}</h4>
              <p className="text-gray-600">Open Positions</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Icon icon="ph:briefcase" className="text-purple-600 text-xl" />
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
            label="Days Pending"
            name="daysPending"
            value={filters.daysPending}
            onChange={handleFilterChange}
            options={[
              { value: "", label: "All" },
              { value: "1-3", label: "1-3 days" },
              { value: "4-7", label: "4-7 days" },
              { value: "8+", label: "8+ days" }
            ]}
          />

          <div className="flex items-end">
            <Button
              text="Clear Filters"
              className="btn-outline-secondary w-full"
              onClick={() => setFilters({ search: "", jobId: "", daysPending: "" })}
            />
          </div>
        </div>
      </Card>

      {/* Pending Evaluations Table */}
      <Card className="bg-white shadow border">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Pending Evaluations</h3>
          <p className="text-sm text-gray-600 mt-1">Showing {filteredPendingEvaluations.length} of {totalPending} pending evaluations</p>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading pending evaluations...</p>
            </div>
          ) : filteredPendingEvaluations.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon icon="ph:check-circle" className="text-gray-400 text-2xl" />
              </div>
              <p className="text-gray-500 text-lg font-medium">No pending evaluations found</p>
              <p className="text-gray-400 text-sm mt-2">All evaluations have been completed or no candidates are waiting for evaluation.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied Date
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days Pending
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPendingEvaluations.map((evaluation) => {
                  const daysPending = getDaysPending(evaluation.created_at);
                  const isUrgent = daysPending >= 7;
                  
                  return (
                    <tr key={evaluation.id} className={`hover:bg-gray-50 ${isUrgent ? 'bg-red-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {evaluation.photo_url ? (
                              <img 
                                className="h-10 w-10 rounded-full object-cover" 
                                src={`/${evaluation.photo_url}`} 
                                alt="Profile" 
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className={`h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center ${evaluation.photo_url ? 'hidden' : ''}`}>
                              <span className="text-gray-600 text-sm font-medium">
                                {evaluation.full_name ? evaluation.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'NA'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                              {evaluation.full_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        <div className="text-center">
                          <div className="font-medium">{getJobTitle(evaluation.job_id)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        {(() => {
                          const job = jobs.find(j => j.id === evaluation.job_id);
                          return job && job.department ? job.department : 'N/A';
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {formatDate(evaluation.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        <span className={`font-medium ${isUrgent ? 'text-red-600' : 'text-yellow-600'}`}>
                          {daysPending} days
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {isUrgent ? (
                          <Badge className="badge-danger">Urgent</Badge>
                        ) : daysPending >= 4 ? (
                          <Badge className="badge-warning">Medium</Badge>
                        ) : (
                          <Badge className="badge-success">Low</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <Button
                          text="Evaluate"
                          className={`btn-sm h-8 ${isUrgent ? 'btn-danger' : 'btn-outline-primary'}`}
                          onClick={() => handleEvaluate(evaluation)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PendingEvaluations; 