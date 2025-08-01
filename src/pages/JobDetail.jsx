import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { safeToastError } from "@/utility/safeToast";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Icon from "@/components/ui/Icon";
import Modal from "@/components/ui/Modal";
import Textinput from "@/components/ui/Textinput";
import Select from "@/components/ui/Select";
import SendInviteModal from "@/components/SendInviteModal";
import Textarea from "@/components/ui/Textarea";

const JobDetail = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [hasCheckedCandidates, setHasCheckedCandidates] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [sendInviteModalOpen, setSendInviteModalOpen] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [checkedCandidates, setCheckedCandidates] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
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
  const [shouldAutoSelect, setShouldAutoSelect] = useState(false);
  const [tooltipText, setTooltipText] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);

  // Auto-select all candidates when they are loaded after upload
  useEffect(() => {
    if (shouldAutoSelect && candidates.length > 0) {
      // Only select candidates who haven't received invites yet
      const candidatesWithoutInvites = candidates.filter(candidate => !candidate.invite_sent);
      
      const candidateIdsToSelect = candidatesWithoutInvites.map(c => c.id).filter(id => id != null);
      
      // If no IDs found, try alternative field names
      if (candidateIdsToSelect.length === 0) {
        const alternativeIds = candidatesWithoutInvites.map(c => c.candidate_id || c.user_id || c._id).filter(id => id != null);
        if (alternativeIds.length > 0) {
          setCheckedCandidates(alternativeIds);
        }
      } else {
        setCheckedCandidates(candidateIdsToSelect);
      }
      
      setShouldAutoSelect(false); // Reset the flag
    }
  }, [candidates, shouldAutoSelect]);

  useEffect(() => {
    fetchJobDetails();
    // Remove automatic candidate fetching - only fetch when needed
  }, [jobId]);

  // Handle individual candidate selection
  const handleCandidateSelect = (candidateId) => {
    
    setCheckedCandidates(prev => {
      const newSelection = prev.includes(candidateId)
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId];
      return newSelection;
    });
  };

  // Handle select all candidates
  const handleSelectAll = () => {
    const candidatesWithoutInvites = candidates.filter(candidate => !candidate.invite_sent);
    const allCandidateIds = candidatesWithoutInvites.map(c => c.id).filter(id => id != null);
    
    if (checkedCandidates.length === allCandidateIds.length && allCandidateIds.length > 0) {
      // If all candidates without invites are selected, deselect all
      setCheckedCandidates([]);
    } else {
      // Select all candidates without invites
      setCheckedCandidates(allCandidateIds);
    }
  };

  // Check if all candidates without invites are selected
  const candidatesWithoutInvites = candidates.filter(candidate => !candidate.invite_sent);
  const isAllSelected = candidatesWithoutInvites.length > 0 && 
    checkedCandidates.length === candidatesWithoutInvites.length;

  // Tooltip functions
  const showTooltipMessage = (text, event) => {
    console.log("Showing tooltip:", text); // Debug log
    setTooltipText(text);
    
    // Calculate if there's enough space on the right side
    const tooltipWidth = 250; // Approximate tooltip width
    const windowWidth = window.innerWidth;
    const cursorX = event.clientX;
    
    // If there's not enough space on the right, show tooltip on the left
    const showOnLeft = cursorX + tooltipWidth + 20 > windowWidth;
    
    setTooltipPosition({ 
      x: event.clientX, 
      y: event.clientY,
      showOnLeft: showOnLeft
    });
    setShowTooltip(true);
  };

  const hideTooltip = () => {
    console.log("Hiding tooltip"); // Debug log
    setShowTooltip(false);
  };

  const fetchJobDetails = async () => {
    try {
      const response = await axios.get(`/api/jobs/${jobId}`);
      setJob(response.data);
    } catch (error) {
      safeToastError("Failed to fetch job details");
    } finally {
      setLoading(false);
    }
  };

  const fetchJobCandidates = async (showErrorOnFail = true, autoSelectAll = false) => {
    setCandidatesLoading(true);
    setHasCheckedCandidates(true);
    try {
      const response = await axios.get(`/api/jobs/${jobId}/candidates`);
      if (Array.isArray(response.data)) {
        setCandidates(response.data);
        
        // Set flag to auto-select if requested
        if (autoSelectAll) {
          setShouldAutoSelect(true);
        }
      } else {
        setCandidates([]);
      }
    } catch (error) {
      // Only show error toast if explicitly requested (manual load or after upload)
      if (showErrorOnFail) {
        safeToastError("Failed to fetch candidates");
      }
      setCandidates([]);
    } finally {
      setCandidatesLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUploadCandidates = async () => {
    if (!selectedFile) {
      safeToastError("Please select a file");
      return;
    }

    setUploading(true);
    
    try {
      // Parse the file
      const fileExtension = selectedFile.name.split(".").pop().toLowerCase();
      let candidates = [];

      if (fileExtension === "xlsx" || fileExtension === "xls") {
        // Handle Excel files
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const XLSX = await import("xlsx");
            const wb = XLSX.read(e.target.result, { type: "binary" });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const raw = XLSX.utils.sheet_to_json(ws);
            
            candidates = raw.map((row, index) => ({
              full_name: row.name || row.full_name || row["Full Name"] || `Candidate ${index + 1}`,
              email: row.email || row["Email"] || "",
              phone: row.phone || row.phone_number || row["Phone"] || "",
              designation: row.designation || row.title || row["Current Position"] || row["Designation"] || "",
              location: row.location || row["Location"] || row["City"] || row["Address"] || ""
            }));
            
          } catch (error) {
            safeToastError("Failed to parse Excel file");
            setUploading(false);
            return;
          }
          
          // Send candidates to server
          await sendCandidatesToServer(candidates);
        };
        reader.readAsBinaryString(selectedFile);
      } else if (fileExtension === "csv") {
        // Handle CSV files
        const Papa = await import("papaparse");
        Papa.parse(selectedFile, {
          header: true,
          skipEmptyLines: true,
          complete: async (result) => {
            candidates = result.data.map((row, index) => ({
              full_name: row.name || row.full_name || row["Full Name"] || `Candidate ${index + 1}`,
              email: row.email || row["Email"] || "",
              phone: row.phone || row.phone_number || row["Phone"] || "",
              designation: row.designation || row.title || row["Current Position"] || row["Designation"] || "",
              location: row.location || row["Location"] || row["City"] || row["Address"] || ""
            }));
            
            await sendCandidatesToServer(candidates);
          },
          error: (error) => {
            safeToastError("Failed to parse CSV file");
            setUploading(false);
          }
        });
      } else {
        safeToastError("Unsupported file type. Please upload Excel (.xlsx, .xls) or CSV (.csv) file.");
        setUploading(false);
      }
    } catch (error) {
      safeToastError("Failed to upload candidates");
      setUploading(false);
    }
  };

  const sendCandidatesToServer = async (candidates) => {
    try {
      const response = await axios.post(`/api/jobs/${jobId}/upload-candidates`, { candidates });
      
      // Show different toast messages based on the response
      const { stats } = response.data;
      if (stats.newlyInserted > 0 && stats.alreadyExists > 0) {
        toast.success(`${stats.newlyInserted} new candidates added! ${stats.alreadyExists} already exist.`);
      } else if (stats.newlyInserted > 0) {
        toast.success(`Successfully uploaded ${stats.newlyInserted} candidates!`);
      } else if (stats.alreadyExists > 0) {
        toast.info(`All ${stats.alreadyExists} candidates already exist for this job.`);
      }
      
      setUploadModalOpen(false);
      setSelectedFile(null);
      setHasCheckedCandidates(true); // Mark that we've checked for candidates
      setShouldAutoSelect(true); // Set flag to auto-select after upload
      
      // Fetch updated candidates
      await fetchJobCandidates(true);
      
    } catch (error) {
      safeToastError(error.response?.data?.message || "Failed to upload candidates");
    } finally {
      setUploading(false);
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

  // Get candidates who haven't been sent invites yet
  const getCandidatesWithoutInvites = () => {
    return candidates.filter(candidate => !candidate.invite_sent);
  };

  // Handle candidate selection for invites
  const handleSendInvites = () => {
    if (checkedCandidates.length === 0) {
      safeToastError("Please select at least one candidate to send invites");
      return;
    }
    
    const candidatesToInvite = candidates.filter(candidate => 
      checkedCandidates.includes(candidate.id) && !candidate.invite_sent
    );
    
    if (candidatesToInvite.length === 0) {
      safeToastError("Selected candidates already have invites sent");
      return;
    }
    
    setSelectedCandidates(candidatesToInvite);
    setSendInviteModalOpen(true);
  };

  // Handle successful invite sending
  const handleInviteSuccess = (sentCount) => {
    toast.success(`Successfully sent invites to ${sentCount} candidates!`);
    // Refresh candidates to update invite status
    fetchJobCandidates(true);
    // Clear selected candidates after sending invites
    setCheckedCandidates([]);
  };

  // Open edit modal and prefill form
  const openEditModal = () => {
    if (job) {
      setEditFormData({
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
      setEditModalOpen(true);
    }
  };

  // Handle edit form input change
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle edit form submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editFormData.title || !editFormData.deadline) {
      safeToastError("Title and deadline are required");
      return;
    }
    try {
      await axios.put(`/api/jobs/${jobId}`, editFormData);
      toast.success("Job updated successfully");
      setEditModalOpen(false);
      fetchJobDetails(); // Refresh job details
    } catch (error) {
      safeToastError(error.response?.data?.error || "Failed to update job");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h2>
        <Button
          text="Back to Jobs"
          className="btn-primary"
          onClick={() => navigate("/job-postings")}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
          </div>
          <p className="text-gray-600">{job.department} • {job.location}</p>
        </div>
        <div className="flex space-x-3">
          <Button
            text="Edit Job"
            className="btn-outline-primary"
            onClick={openEditModal}
          />
        </div>
      </div>

      {/* Job Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Description</h4>
                <p className="text-gray-700 text-base leading-relaxed">
                  {job.description}
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h4>
                <p className="text-gray-700 text-base leading-relaxed">
                  {job.requirements}
                </p>
              </div>
            </div>
          </Card>

          {/* Candidates Section */}
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Candidates ({candidates.length})</h3>
              <Button
                text="Load More Files"
                className="btn-outline-primary btn-sm w-32"
                onClick={() => setUploadModalOpen(true)}
              />
            </div>
            
            {/* Selection indicator */}
            {checkedCandidates.length > 0 && (
              <div className="mb-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between px-3">
                  <span className="text-sm text-blue-800">
                    {checkedCandidates.length} candidate{checkedCandidates.length !== 1 ? 's' : ''} selected
                  </span>
                  <Button
                    text="Clear Selection"
                    className="btn-outline-secondary btn-sm w-32"
                    onClick={() => setCheckedCandidates([])}
                  />
                </div>
              </div>
            )}
            
            {candidates.length === 0 ? (
              <div className="text-center py-8">
                <Icon icon="ph:users" className="text-gray-400 text-4xl mx-auto mb-4" />
                <p className="text-gray-500 mb-4">
                  {candidatesLoading ? 
                    "Loading candidates..." : 
                    hasCheckedCandidates ? 
                      "No candidates found for this job." : 
                      "Click 'Load Candidates' to check for uploaded candidates."
                  }
                </p>
                <div className="space-x-3">
                  <Button
                    text={candidatesLoading ? "Loading..." : "Load Candidates"}
                    className="btn-outline-primary"
                    onClick={() => {
                      setShouldAutoSelect(true);
                      fetchJobCandidates(true);
                    }}
                    disabled={candidatesLoading}
                  />
                  <Button
                    text="Upload Candidates"
                    className="btn-primary"
                    onClick={() => setUploadModalOpen(true)}
                  />
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div
                          onMouseEnter={(e) => {
                            if (candidatesWithoutInvites.length === 0) {
                              showTooltipMessage("All candidates already have invites sent", e);
                            }
                          }}
                          onMouseLeave={hideTooltip}
                          className="inline-block"
                        >
                          <input
                            type="checkbox"
                            checked={isAllSelected}
                            onChange={handleSelectAll}
                            disabled={candidatesWithoutInvites.length === 0}
                            className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                              candidatesWithoutInvites.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Designation
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invite Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {candidates.map((candidate, index) => (
                      <tr key={candidate.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div
                            onMouseEnter={(e) => {
                              if (candidate.invite_sent) {
                                const statusText = candidate.invite_status === 'submitted' ? 'has already submitted an application' : 
                                                 candidate.invite_status === 'opened' ? 'has opened the invite' : 
                                                 'has already been sent an invite';
                                showTooltipMessage(`This candidate ${statusText}`, e);
                              }
                            }}
                            onMouseLeave={hideTooltip}
                            className="inline-block"
                          >
                            <input
                              type="checkbox"
                              checked={checkedCandidates.includes(candidate.id)}
                              onChange={() => handleCandidateSelect(candidate.id)}
                              disabled={candidate.invite_sent}
                              className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                                candidate.invite_sent ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <div className="text-sm font-medium text-gray-900">
                              {candidate.name}
                            </div>
                            {index < 5 && (
                              <Badge className="badge-success badge-sm">New</Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                          {candidate.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                          {candidate.phone || "Not provided"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                          {candidate.designation || "Not specified"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          {candidate.location ? candidate.location : "Not specified"}
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-semibold mb-4">Job Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                {getStatusBadge(job.status)}
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Openings:</span>
                <span className="font-medium">{job.openings}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Job Type:</span>
                <span className="font-medium">{job.job_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Salary Range:</span>
                <span className="font-medium">{job.salary_range || "Not specified"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Deadline:</span>
                <span className="font-medium">{formatDate(job.deadline)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium">{formatDate(job.created_at)}</span>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <div
                onMouseEnter={(e) => {
                  if (candidates.length === 0) {
                    showTooltipMessage("No candidates available for this job", e);
                  } else if (candidates.every(c => c.invite_sent)) {
                    showTooltipMessage("All candidates have already received invites", e);
                  } else if (checkedCandidates.length === 0) {
                    showTooltipMessage("Please select at least one candidate to send invites", e);
                  }
                }}
                onMouseLeave={hideTooltip}
                className="inline-block w-full"
              >
                <Button
                  text={
                    candidates.length === 0 
                      ? "No Candidates" 
                      : candidates.every(c => c.invite_sent)
                      ? "All Invites Sent"
                      : `Send Invites (${checkedCandidates.length})`
                  }
                  className="btn-primary w-full"
                  onClick={handleSendInvites}
                  disabled={candidates.length === 0 || checkedCandidates.length === 0 || candidates.every(c => c.invite_sent)}
                />
              </div>
              <Button
                text="View Applications"
                className="btn-outline-primary w-full"
                onClick={() => navigate(`/applications?jobId=${jobId}`)}
              />
              <Button
                text="Close Job"
                className="btn-outline-danger w-full"
                onClick={() => {
                  // Implement close job functionality
                  toast.info("Close job functionality coming soon");
                }}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Upload Candidates Modal */}
      <Modal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Candidates"
        label="Upload Candidates"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select File (Excel/CSV)
            </label>
            <div className="cursor-pointer">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer"
                style={{ cursor: 'pointer' }}
              />
            </div>
            {selectedFile && (
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg mt-2">
                <div className="flex items-center">
                  <span className="text-sm text-gray-600">
                    📎 Selected: <span className="font-medium">{selectedFile.name}</span> ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const fileInput = document.querySelector('input[type="file"]');
                    if (fileInput) fileInput.value = '';
                    setSelectedFile(null);
                  }}
                  className="ml-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors duration-200 cursor-pointer"
                  title="Remove file"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: Excel (.xlsx, .xls) or CSV (.csv)
            </p>
          </div>

          {/* File Requirements */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
              📋 File Requirements:
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Must include columns: <strong>name</strong>, <strong>email</strong>, <strong>phone</strong>, <strong>designation</strong>, <strong>location</strong></li>
              <li>• Email addresses must be unique per job</li>
              <li>• Same candidates can be uploaded to different jobs</li>
              <li>• Duplicate candidates within the same job will be skipped</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              text="Cancel"
              className="btn-outline-secondary"
              onClick={() => setUploadModalOpen(false)}
            />
            <Button
              text={uploading ? "Uploading..." : "Upload Candidates"}
              className="btn-primary"
              onClick={handleUploadCandidates}
              disabled={!selectedFile || uploading}
            />
          </div>
        </div>
      </Modal>

      {/* Send Invite Modal */}
      <SendInviteModal
        open={sendInviteModalOpen}
        onClose={() => setSendInviteModalOpen(false)}
        selectedCandidates={selectedCandidates}
        onSendSuccess={handleInviteSuccess}
        jobId={jobId}
      />

      {/* Edit Job Modal */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Job"
        label="Edit Job"
      >
        <form onSubmit={handleEditSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Textinput
              label="Job Title"
              type="text"
              name="title"
              value={editFormData.title}
              onChange={handleEditInputChange}
              placeholder="Enter job title"
              required
            />
            <Textinput
              label="Department"
              type="text"
              name="department"
              value={editFormData.department}
              onChange={handleEditInputChange}
              placeholder="Enter department"
            />
            <Textinput
              label="Number of Openings"
              type="number"
              name="openings"
              value={editFormData.openings}
              onChange={handleEditInputChange}
              min="1"
              required
            />
            <Select
              label="Job Type"
              name="job_type"
              value={editFormData.job_type}
              onChange={handleEditInputChange}
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
              value={editFormData.location}
              onChange={handleEditInputChange}
              placeholder="Enter job location"
            />
            <Textinput
              label="Salary Range"
              type="text"
              name="salary_range"
              value={editFormData.salary_range}
              onChange={handleEditInputChange}
              placeholder="e.g., $50,000 - $70,000"
            />
            <Textinput
              label="Application Deadline"
              type="date"
              name="deadline"
              value={editFormData.deadline}
              onChange={handleEditInputChange}
              required
            />
            <Select
              label="Status"
              name="status"
              value={editFormData.status}
              onChange={handleEditInputChange}
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
            value={editFormData.description}
            onChange={handleEditInputChange}
            placeholder="Enter detailed job description"
            rows="4"
          />
          <Textarea
            label="Requirements"
            name="requirements"
            value={editFormData.requirements}
            onChange={handleEditInputChange}
            placeholder="Enter job requirements and qualifications"
            rows="4"
          />
          <div className="flex justify-end space-x-3">
            <Button
              text="Cancel"
              className="btn-outline-secondary"
              onClick={() => setEditModalOpen(false)}
              type="button"
            />
            <Button
              text="Update Job"
              className="btn-primary"
              type="submit"
            />
          </div>
        </form>
      </Modal>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="fixed z-[9999] px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg pointer-events-none border border-gray-700"
          style={{
            left: tooltipPosition.showOnLeft ? 'auto' : tooltipPosition.x + 10,
            right: tooltipPosition.showOnLeft ? window.innerWidth - tooltipPosition.x + 10 : 'auto',
            top: tooltipPosition.y - 50,
            maxWidth: '300px',
            minWidth: '200px'
          }}
        >
          {tooltipText}
          <div
            className={`absolute w-3 h-3 bg-gray-900 transform rotate-45 ${
              tooltipPosition.showOnLeft 
                ? 'border-r border-t border-gray-700' 
                : 'border-l border-b border-gray-700'
            }`}
            style={{
              left: tooltipPosition.showOnLeft ? 'auto' : '-6px',
              right: tooltipPosition.showOnLeft ? '-6px' : 'auto',
              top: '50%',
              marginTop: '-6px'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default JobDetail;