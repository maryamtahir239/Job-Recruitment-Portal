import React, { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Icon from "@/components/ui/Icon";

const EvaluatedCandidates = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    jobId: ""
  });
  const [filteredEvaluations, setFilteredEvaluations] = useState([]);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);

  useEffect(() => {
    // Debug: Check if user is logged in
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (user) {
    }
    
    fetchEvaluations();
    fetchJobs();
  }, []);

  const fetchEvaluations = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setEvaluations([]);
        setLoading(false);
        return;
      }

      const res = await fetch("/api/evaluation", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Failed to parse error response" }));
        setEvaluations([]);
        setLoading(false);
        return;
      }

      const data = await res.json();
      setEvaluations(Array.isArray(data) ? data : []);
    } catch (error) {
      setEvaluations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/jobs");
      const data = await response.json();
      setJobs(Array.isArray(data) ? data : []);
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

  useEffect(() => {
    setFilteredEvaluations(
      evaluations.filter(ev => {
        const matchesSearch = ev.candidateName?.toLowerCase().includes(filters.search.toLowerCase());
        const matchesJob = !filters.jobId || ev.jobTitle === getJobTitle(parseInt(filters.jobId));
        return matchesSearch && matchesJob;
      })
    );
  }, [filters, evaluations]);

  const getJobTitle = (jobId) => {
    const job = jobs.find(j => j.id === jobId);
    return job ? job.title : "";
  };

  function handleViewEvaluation(ev) {
    setSelectedEvaluation(ev);
  }

  // Calculate statistics
  const totalEvaluations = evaluations.length;
  const averageScore = evaluations.length > 0 
    ? Math.round(evaluations.reduce((sum, ev) => sum + (ev.totalScore || 0), 0) / evaluations.length * 10) / 10
    : 0;
  const uniqueJobs = [...new Set(evaluations.map(ev => ev.jobTitle))].length;
  const thisMonth = evaluations.filter(ev => {
    const evDate = new Date(ev.createdAt);
    const now = new Date();
    return evDate.getMonth() === now.getMonth() && evDate.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="space-y-6">
      {/* Header with simple styling */}
      <Card className="bg-white shadow border">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Evaluated Candidates</h1>
            <p className="text-gray-600 mt-2">View and manage completed candidate evaluations</p>
          </div>
          <div className="hidden md:block">
          </div>
        </div>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white shadow border">
          <div className="flex flex-row-reverse items-center justify-between">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon icon="ph:check-circle" className="text-blue-600 text-2xl" />
            </div>
            <div className="flex flex-col items-start">
              <div className="text-2xl font-bold text-gray-900">{totalEvaluations}</div>
              <div className="text-sm text-gray-600">Total Evaluations</div>
            </div>
          </div>
        </Card>

        <Card className="bg-white shadow border">
          <div className="flex flex-row-reverse items-center justify-between">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon icon="ph:star" className="text-green-600 text-2xl" />
            </div>
            <div className="flex flex-col items-start">
              <div className="text-2xl font-bold text-gray-900">{averageScore}</div>
              <div className="text-sm text-gray-600">Average Score</div>
            </div>
          </div>
        </Card>

        <Card className="bg-white shadow border">
          <div className="flex flex-row-reverse items-center justify-between">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Icon icon="ph:briefcase" className="text-purple-600 text-2xl" />
            </div>
            <div className="flex flex-col items-start">
              <div className="text-2xl font-bold text-gray-900">{uniqueJobs}</div>
              <div className="text-sm text-gray-600">Open Positions</div>
            </div>
          </div>
        </Card>

        <Card className="bg-white shadow border">
          <div className="flex flex-row-reverse items-center justify-between">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Icon icon="ph:calendar" className="text-yellow-600 text-2xl" />
            </div>
            <div className="flex flex-col items-start">
              <div className="text-2xl font-bold text-gray-900">{thisMonth}</div>
              <div className="text-sm text-gray-600">This Month</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Enhanced Filters */}
      <Card className="bg-white shadow border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Textinput
            label="Search Candidates"
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search by name"
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

          <div className="flex items-end">
            <Button
              text="Clear Filters"
              className="btn-outline-secondary w-full"
              onClick={() => setFilters({ search: "", jobId: "" })}
            />
          </div>
        </div>
      </Card>

      {/* Enhanced Evaluations Table */}
      <Card className="overflow-hidden bg-white shadow border">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Evaluation Results</h3>
          <p className="text-sm text-gray-600 mt-1">Showing {filteredEvaluations.length} of {evaluations.length} evaluations</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Applied
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!localStorage.getItem("token") ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <div className="space-y-4">
                      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-gray-900 font-medium">Authentication Required</p>
                        <p className="text-gray-500 text-sm mt-1">You need to be logged in to view evaluations.</p>
                      </div>
                      <button 
                        onClick={() => window.location.href = '/login'} 
                        className="btn-primary btn-sm"
                      >
                        Go to Login
                      </button>
                    </div>
                  </td>
                </tr>
              ) : loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="text-gray-500">Loading evaluations...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredEvaluations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <div className="space-y-4">
                      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-gray-900 font-medium">
                          {evaluations.length === 0 ? "No evaluations found" : "No evaluations match your filters"}
                        </p>
                        <p className="text-gray-500 text-sm mt-1">
                          {evaluations.length === 0 
                            ? "Start evaluating candidates to see results here." 
                            : "Try adjusting your search criteria."}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEvaluations.map((ev) => (
                  <tr key={ev.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          {ev.photoUrl ? (
                            <img 
                              className="h-12 w-12 rounded-full object-cover border-2 border-gray-200" 
                              src={`/${ev.photoUrl}`} 
                              alt="Profile" 
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className={`h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-200 ${ev.photoUrl ? 'hidden' : ''}`}>
                            <span className="text-gray-600 text-sm font-medium">
                              {ev.candidateName ? ev.candidateName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'NA'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {ev.candidateName}
                          </div>
                          <div className="text-sm text-gray-500">
                            Evaluated by {ev.evaluatorName || "Unknown"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium" title={ev.jobTitle}>
                        {ev.jobTitle}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Badge className="badge-success bg-green-100 text-green-800 border-green-200 flex items-center">
                        <Icon icon="ph:check-circle" className="w-4 h-4 mr-1 text-green-600" />
                        Completed
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center">
                        <div className="bg-gray-200 rounded-full h-8 w-8 flex items-center justify-center mr-2">
                          <span className="text-sm font-bold text-gray-700">{ev.totalScore}</span>
                        </div>
                        <span className="text-sm text-gray-500">/25</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      {new Date(ev.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <Button
                        text="View Details"
                        className="btn-outline-primary btn-sm"
                        onClick={() => handleViewEvaluation(ev)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Enhanced Modal for viewing evaluation details */}
      {selectedEvaluation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" style={{ marginTop: '70px' }}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                         <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl">
               <div className="flex justify-between items-start">
                 <div>
                   <h2 className="text-2xl text-white font-bold">Evaluation Details</h2>
                   <p className="text-white mt-1">{selectedEvaluation.candidateName}</p>
                 </div>
                 <button
                   onClick={() => setSelectedEvaluation(null)}
                   className="text-white hover:text-gray-200 transition-colors"
                 >
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                   </svg>
                 </button>
               </div>
             </div>
             
             <div className="p-6 space-y-6">
               {/* Basic Info */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="bg-gray-50 p-3 rounded-lg">
                   <h3 className="font-semibold text-gray-900 mb-2 text-base flex items-center">
                     <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                     </svg>
                     Candidate Information
                   </h3>
                   <div className="space-y-1 text-sm">
                     <div className="flex items-center"><svg className="w-3 h-3 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg><span className="font-medium">Name:</span> {selectedEvaluation.candidateName}</div>
                     <div className="flex items-center"><svg className="w-3 h-3 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.605-9-1.65M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg><span className="font-medium">Position:</span> {selectedEvaluation.jobTitle}</div>
                     <div className="flex items-center"><svg className="w-3 h-3 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span className="font-medium">Evaluator:</span> {selectedEvaluation.evaluatorName || "—"}</div>
                     <div className="flex items-center"><svg className="w-3 h-3 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg><span className="font-medium">Date:</span> {new Date(selectedEvaluation.createdAt).toLocaleDateString()}</div>
                   </div>
                 </div>
                 
                 <div className="bg-gray-50 p-3 rounded-lg">
                   <h3 className="font-semibold text-gray-900 mb-2 text-base flex items-center">
                     <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                     </svg>
                     Score Summary
                   </h3>
                   <div className="flex items-center space-x-2">
                     <div className="bg-blue-100 text-blue-800 rounded-full h-12 w-12 flex items-center justify-center">
                       <span className="text-lg font-bold">{selectedEvaluation.totalScore}</span>
                     </div>
                     <div>
                       <div className="text-sm text-gray-600">Total Score</div>
                       <div className="text-sm text-gray-500">out of 25 points</div>
                     </div>
                   </div>
                 </div>
               </div>

               {/* Question-wise Ratings */}
               {selectedEvaluation.scores && selectedEvaluation.scores.length > 0 && (
                 <div className="bg-gray-50 p-4 rounded-lg">
                   <h1 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                     <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                     </svg>
                     Question-wise Ratings:
                   </h1>
                   <div className="space-y-3">
                     {selectedEvaluation.scores.map((q, i) => (
                       <div key={i} className="bg-white p-3 rounded border">
                         <div className="flex justify-between items-center">
                           <span className="font-medium text-gray-700">{q.question}</span>
                           <Badge className={`badge-${q.rating === 'excellent' ? 'success' : q.rating === 'good' ? 'primary' : q.rating === 'average' ? 'warning' : 'danger'}`}>
                             {q.rating}
                           </Badge>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               )}

               {/* Comments Section */}
               <div className="bg-gray-50 p-4 rounded-lg">
                 <h1 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                   <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                   </svg>
                   Evaluation Comments:
                 </h1>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <p className="font-semibold text-gray-700 mb-2 flex items-center">
                       
                       Improvement Areas:
                     </p>
                     <p className="text-sm text-gray-600 bg-white p-3 rounded border">
                       {selectedEvaluation.comments?.improvement || "No improvement areas noted."}
                     </p>
                   </div>
                   <div>
                     <p className="font-semibold text-gray-700 mb-2 flex items-center">
                      
                       Overall Evaluation:
                     </p>
                     <p className="text-sm text-gray-600 bg-white p-3 rounded border">
                       {selectedEvaluation.comments?.evaluation || "No evaluation comments."}
                     </p>
                   </div>
                   <div>
                     <p className="font-semibold text-gray-700 mb-2 flex items-center">
                      
                       Recommendation:
                     </p>
                     <p className="text-sm text-gray-600 bg-white p-3 rounded border">
                       {selectedEvaluation.comments?.recommendation || "No recommendation provided."}
                     </p>
                   </div>
                   <div>
                     <p className="font-semibold text-gray-700 mb-2 flex items-center">
                       
                       HR Comments:
                     </p>
                     <p className="text-sm text-gray-600 bg-white p-3 rounded border">
                       {selectedEvaluation.comments?.hrComments || "No HR comments."}
                     </p>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluatedCandidates;
