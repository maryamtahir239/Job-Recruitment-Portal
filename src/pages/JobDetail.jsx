import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
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

  useEffect(() => {
    fetchJobDetails();
    // Remove automatic candidate fetching - only fetch when needed
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      const response = await axios.get(`/api/jobs/${jobId}`);
      setJob(response.data);
    } catch (error) {
      toast.error("Failed to fetch job details");
    } finally {
      setLoading(false);
    }
  };

  const fetchJobCandidates = async (showErrorOnFail = true) => {
    setCandidatesLoading(true);
    setHasCheckedCandidates(true);
    try {
      const response = await axios.get(`/api/jobs/${jobId}/candidates`);
      if (Array.isArray(response.data)) {
        setCandidates(response.data);
      } else {
        setCandidates([]);
      }
    } catch (error) {
      // Only show error toast if explicitly requested (manual load or after upload)
      if (showErrorOnFail) {
        toast.error("Failed to fetch candidates");
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
      toast.error("Please select a file");
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
            toast.error("Failed to parse Excel file");
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
            toast.error("Failed to parse CSV file");
            setUploading(false);
          }
        });
      } else {
        toast.error("Unsupported file type. Please upload Excel (.xlsx, .xls) or CSV (.csv) file.");
        setUploading(false);
      }
    } catch (error) {
      toast.error("Failed to upload candidates");
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
      fetchJobCandidates(true); // Show error if fetch fails after upload
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload candidates");
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
    const candidatesWithoutInvites = getCandidatesWithoutInvites();
    if (candidatesWithoutInvites.length === 0) {
      toast.warning("All candidates have already been sent invites!");
      return;
    }
    setSelectedCandidates(candidatesWithoutInvites);
    setSendInviteModalOpen(true);
  };

  // Handle successful invite sending
  const handleInviteSuccess = (sentCount) => {
    toast.success(`Successfully sent invites to ${sentCount} candidates!`);
    // Refresh candidates to update invite status
    fetchJobCandidates(true);
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
      toast.error("Title and deadline are required");
      return;
    }
    try {
      await axios.put(`/api/jobs/${jobId}`, editFormData);
      toast.success("Job updated successfully");
      setEditModalOpen(false);
      fetchJobDetails(); // Refresh job details
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update job");
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
        {/* Main Job Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="text-xl font-semibold mb-4">Job Details</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">Description</h4>
                <p className="text-gray-600 mt-1">
                  {job.description || "No description provided"}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">Requirements</h4>
                <p className="text-gray-600 mt-1">
                  {job.requirements || "No requirements specified"}
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
                className="btn-outline-primary btn-sm"
                onClick={() => setUploadModalOpen(true)}
              />
            </div>
            
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
                    onClick={fetchJobCandidates}
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Designation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invite Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {candidates.map((candidate, index) => (
                      <tr key={candidate.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <div className="text-sm font-medium text-gray-900">
                              {candidate.name}
                            </div>
                            {index < 5 && (
                              <Badge className="badge-success badge-sm">New</Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {candidate.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {candidate.phone ? candidate.phone : "Not specified"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {candidate.designation || "Not specified"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {candidate.location ? candidate.location : "Not specified"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
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
              <Button
                text={`Send Invites (${getCandidatesWithoutInvites().length})`}
                className="btn-primary w-full"
                onClick={handleSendInvites}
                disabled={candidates.length === 0 || getCandidatesWithoutInvites().length === 0}
              />
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
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {selectedFile && (
              <p className="text-sm text-gray-600 mt-2">
                📎 Selected: <span className="font-medium">{selectedFile.name}</span> ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
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
    </div>
  );
};

export default JobDetail; 