import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Icon from "@/components/ui/Icon";
import { safeToastError } from "@/utility/safeToast";

const ApplicationDetail = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [application, setApplication] = useState(null);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);

  useEffect(() => {
    fetchApplicationDetails();
  }, [applicationId]);

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      
      console.log("Fetching application with ID:", applicationId);
      
      // Fetch application details
      const applicationResponse = await axios.get(`/api/applications/${applicationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
             console.log("Application response:", applicationResponse.data);
       console.log("Photo URL:", applicationResponse.data.photo_url);
       console.log("Resume URL:", applicationResponse.data.resume_url);
       setApplication(applicationResponse.data);
      
      // Fetch job details if application has job_id
      if (applicationResponse.data.job_id) {
        const jobResponse = await axios.get(`/api/jobs/${applicationResponse.data.job_id}`);
        setJob(jobResponse.data);
      }
    } catch (error) {
      console.error("Error fetching application details:", error);
      console.error("Error response:", error.response?.status, error.response?.data);
      if (error.response?.status === 404) {
        setError("Application not found");
      } else {
        setError("Failed to load application details");
        safeToastError("Failed to load application details");
      }
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`/api/applications/${applicationId}`, 
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      toast.success("Application status updated successfully");
      fetchApplicationDetails(); // Refresh the data
    } catch (error) {
      console.error("Error updating application status:", error);
      safeToastError("Failed to update application status");
    }
  };

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

  const openResumeModal = () => {
    if (application?.resume_url) {
      setShowResumeModal(true);
    } else {
      safeToastError("No resume available");
    }
  };

  const closeResumeModal = () => {
    setShowResumeModal(false);
  };

  const openImageModal = () => {
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
  };

  // Determine the back button text and navigation based on where user came from
  const getBackButtonInfo = () => {
    const referrer = location.state?.from || document.referrer;
    
    // Check if user came from candidates page
    if (location.state?.from === 'candidates' || referrer.includes('/candidates')) {
      return {
        text: "Back to Candidates",
        path: "/candidates"
      };
    }
    
    // Check if user came from applications page
    if (location.state?.from === 'applications' || referrer.includes('/applications')) {
      return {
        text: "Back to Applications",
        path: "/applications"
      };
    }
    
    // Default fallback
    return {
      text: "Back to Applications",
      path: "/applications"
    };
  };

  const backButtonInfo = getBackButtonInfo();

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
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Application</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-4">
            <Button
              text="Retry"
              className="btn-primary"
              onClick={fetchApplicationDetails}
            />
            <Button
              text="Back to Applications"
              className="btn-outline-secondary"
              onClick={() => navigate("/applications")}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Application Not Found</h2>
          <Button
            text="Back to Applications"
            className="btn-outline-secondary"
            onClick={() => navigate("/applications")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
                 <div>
           <h1 className="text-4xl font-bold text-gray-900 mb-2">Application Details</h1>
           <p className="text-lg text-gray-600">Comprehensive candidate information and application status</p>
         </div>
                 <div className="flex space-x-3">
           <Button
             text={backButtonInfo.text}
             className="btn-outline-secondary"
             onClick={() => navigate(backButtonInfo.path)}
           />
          <div className="relative">
            <select
              value={application.status}
              onChange={(e) => updateApplicationStatus(e.target.value)}
              className="appearance-none bg-white border border-blue-500 text-blue-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer hover:bg-blue-50 transition-colors duration-200"
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Application Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
                         <div className="flex items-center mb-4">
               <div className="flex-shrink-0 h-16 w-16 relative group">
                 {application.photo_url ? (
                   <div className="relative">
                     <img 
                       className="h-16 w-16 rounded-full object-cover cursor-pointer transition-transform duration-200 group-hover:scale-105" 
                       src={`/${application.photo_url}`} 
                       alt="Profile" 
                       onClick={openImageModal}
                       onError={(e) => {
                         e.target.style.display = 'none';
                         e.target.nextSibling.style.display = 'flex';
                       }}
                     />
                     {/* Hover overlay */}
                     <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer" onClick={openImageModal}>
                       <span className="text-white text-xs font-medium">Click to view</span>
                     </div>
                   </div>
                 ) : null}
                 <div className={`h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center ${application.photo_url ? 'hidden' : ''}`}>
                   <span className="text-white text-lg font-medium">
                     {application.full_name ? application.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'NA'}
                   </span>
                 </div>
               </div>
                             <div className="ml-4">
                 <h2 className="text-3xl font-bold text-gray-900 mb-1">{application.full_name}</h2>
                 <p className="text-lg text-gray-600 mb-2">{application.email}</p>
                 <div className="mt-2">
                   {getStatusBadge(application.status)}
                 </div>
               </div>
            </div>
            
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">Personal Information</h4>
                  <div className="space-y-3 text-sm">
                   <div><strong>Father's Name:</strong> {application.father_name || "Not provided"}</div>
                   <div><strong>CNIC:</strong> {application.cnic || "Not provided"}</div>
                   <div><strong>Phone:</strong> {application.phone || "Not provided"}</div>
                   <div><strong>Date of Birth:</strong> {application.date_of_birth || "Not provided"}</div>
                   <div><strong>Gender:</strong> {application.gender || "Not provided"}</div>
                   <div><strong>Nationality:</strong> {application.nationality || "Not provided"}</div>
                   <div><strong>Marital Status:</strong> {application.marital_status || "Not provided"}</div>
                 </div>
               </div>
               
                               <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">Address Information</h4>
                  <div className="space-y-3 text-sm">
                    <div><strong>Address:</strong> {application.address || "Not provided"}</div>
                    <div><strong>City:</strong> {application.city || "Not provided"}</div>
                    <div><strong>Province:</strong> {application.province || "Not provided"}</div>
                  </div>
                  
                  <h4 className="text-xl font-semibold text-gray-900 mb-4 mt-6 border-b border-gray-200 pb-2">Emergency Contact</h4>
                  <div className="space-y-3 text-sm">
                   <div><strong>Name:</strong> {application.emergency_contact_name || "Not provided"}</div>
                   <div><strong>Phone:</strong> {application.emergency_contact_phone || "Not provided"}</div>
                 </div>
               </div>
             </div>
             
                           <div className="mt-6">
                <h4 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">Job Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><strong>Job Applied:</strong> {job?.title || "Unknown Job"}</div>
                  <div><strong>Applied Date:</strong> {formatDate(application.created_at)}</div>
                </div>
              </div>
                     </Card>

           {/* Additional Information */}
           {(application.why_interested || application.career_goals || application.expected_salary || application.notice_period) && (
             <Card>
                               <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <Icon icon="ph:info" className="text-purple-600 text-xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Additional Information</h3>
                </div>
               
               <div className="text-gray-700 space-y-4">
                                   {application.why_interested && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Why are you interested in this position?</h4>
                      <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg">
                        {application.why_interested}
                      </p>
                    </div>
                  )}
                  
                  {application.career_goals && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Career Goals</h4>
                      <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg">
                        {application.career_goals}
                      </p>
                    </div>
                  )}
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                       {application.expected_salary && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Expected Salary</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                          {application.expected_salary}
                        </p>
                      </div>
                    )}
                    
                    {application.notice_period && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Notice Period</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                          {application.notice_period}
                        </p>
                      </div>
                    )}
                 </div>
               </div>
             </Card>
           )}

           {/* Education */}
                       <Card>
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <Icon icon="ph:graduation-cap" className="text-blue-600 text-xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Education</h3>
              </div>
             
             <div className="text-gray-700">
               {Array.isArray(application.education) && application.education.length > 0 ? (
                 <div className="space-y-6">
                   {application.education.map((edu, index) => (
                     <div key={index} className="relative">
                       {/* Timeline dot */}
                       <div className="absolute left-0 top-2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm"></div>
                       
                       {/* Content */}
                       <div className="ml-6 pb-6 border-l-2 border-gray-200 pl-6">
                         <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200">
                           <div className="flex items-start justify-between mb-3">
                             <div>
                               <h4 className="text-lg font-semibold text-gray-900 mb-1">
                                 {edu.level || 'Education Entry'}
                               </h4>
                               {edu.course_of_study && (
                                 <p className="text-blue-600 font-medium mb-1">{edu.course_of_study}</p>
                               )}
                               {edu.institution && (
                                 <p className="text-gray-600 text-sm">{edu.institution}</p>
                               )}
                             </div>
                             {edu.status && (
                               <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                 edu.status.toLowerCase() === 'completed' 
                                   ? 'bg-green-100 text-green-800'
                                   : edu.status.toLowerCase() === 'ongoing'
                                   ? 'bg-yellow-100 text-yellow-800'
                                   : 'bg-gray-100 text-gray-800'
                               }`}>
                                 {edu.status}
                               </span>
                             )}
                           </div>
                           
                                                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              {edu.passing_year && (
                                <div className="flex items-center">
                                  <Icon icon="ph:calendar" className="text-gray-400 mr-2" />
                                  <span className="text-gray-600">Year: <span className="font-medium">{edu.passing_year}</span></span>
                                </div>
                              )}
                              {edu.gpa && (
                                <div className="flex items-center">
                                  <Icon icon="ph:star" className="text-gray-400 mr-2" />
                                  <span className="text-gray-600">GPA: <span className="font-medium">{edu.gpa}</span></span>
                                </div>
                              )}
                            </div>
                            
                            {/* Additional Details with proper title */}
                            {edu.additional_details && edu.additional_details.trim() !== '' && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="flex items-start">
                                  <Icon icon="ph:note" className="text-gray-400 mr-2 mt-0.5" />
                                  <div>
                                    <p className="text-sm font-medium text-gray-700 mb-1">Additional Details:</p>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                      {edu.additional_details}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-8">
                   <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Icon icon="ph:graduation-cap" className="text-gray-400 text-2xl" />
                   </div>
                   <p className="text-gray-500 text-lg font-medium">No Education Details</p>
                   <p className="text-gray-400 text-sm">Education information not provided by the candidate</p>
                 </div>
               )}
             </div>
           </Card>

           {/* Experience */}
                       <Card>
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <Icon icon="ph:briefcase" className="text-green-600 text-xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Experience</h3>
              </div>
             
             <div className="text-gray-700">
               {application.isFresher ? (
                 <div className="text-center py-8">
                   <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Icon icon="ph:user-plus" className="text-green-600 text-2xl" />
                   </div>
                   <p className="text-green-600 text-lg font-semibold mb-2">Fresher</p>
                   <p className="text-gray-500 text-sm">No prior work experience</p>
                 </div>
               ) : Array.isArray(application.experience) && application.experience.length > 0 ? (
                 <div className="space-y-6">
                   {application.experience.map((exp, index) => (
                     <div key={index} className="relative">
                       {/* Timeline dot */}
                       <div className="absolute left-0 top-2 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                       
                       {/* Content */}
                       <div className="ml-6 pb-6 border-l-2 border-gray-200 pl-6">
                         <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200">
                           <div className="flex items-start justify-between mb-3">
                             <div>
                               <h4 className="text-lg font-semibold text-gray-900 mb-1">
                                 {exp.position_held || exp.company_name || 'Experience Entry'}
                               </h4>
                               {exp.company_name && (
                                 <p className="text-green-600 font-medium">{exp.company_name}</p>
                               )}
                             </div>
                             <div className="flex flex-col items-end space-y-1">
                               {exp.is_current && (
                                 <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                   Current
                                 </span>
                               )}
                               {exp.employment_type && (
                                 <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                   {exp.employment_type}
                                 </span>
                               )}
                             </div>
                           </div>
                           
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3">
                             {exp.from && exp.to && (
                               <div className="flex items-center">
                                 <Icon icon="ph:calendar" className="text-gray-400 mr-2" />
                                 <span className="text-gray-600">
                                   {exp.from} - {exp.to}
                                 </span>
                               </div>
                             )}
                             {exp.salary && (
                               <div className="flex items-center">
                                 <Icon icon="ph:money" className="text-gray-400 mr-2" />
                                 <span className="text-gray-600">Salary: <span className="font-medium">{exp.salary}</span></span>
                               </div>
                             )}
                           </div>
                           
                                                       {exp.job_description && (
                              <div className="mb-3">
                                <div className="flex items-start">
                                  <Icon icon="ph:briefcase" className="text-gray-400 mr-2 mt-0.5" />
                                  <div>
                                    <p className="text-sm font-medium text-gray-700 mb-1">Job Description:</p>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                      {exp.job_description}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {exp.achievements && (
                              <div className="pt-3 border-t border-gray-200">
                                <div className="flex items-start">
                                  <Icon icon="ph:trophy" className="text-gray-400 mr-2 mt-0.5" />
                                  <div>
                                    <p className="text-sm font-medium text-gray-700 mb-1">Achievements:</p>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                      {exp.achievements}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-8">
                   <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Icon icon="ph:briefcase" className="text-gray-400 text-2xl" />
                   </div>
                   <p className="text-gray-500 text-lg font-medium">No Experience Details</p>
                   <p className="text-gray-400 text-sm">Work experience information not provided</p>
                 </div>
               )}
             </div>
           </Card>

           {/* References */}
                       <Card>
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                  <Icon icon="ph:users" className="text-orange-600 text-xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">References</h3>
              </div>
             
             <div className="text-gray-700">
               {application.hasReferences ? (
                 <div className="text-center py-8">
                   <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Icon icon="ph:user-minus" className="text-orange-600 text-2xl" />
                   </div>
                   <p className="text-orange-600 text-lg font-semibold mb-2">No References Provided</p>
                   <p className="text-gray-500 text-sm">Candidate chose not to provide references</p>
                 </div>
               ) : Array.isArray(application.references) && application.references.length > 0 ? (
                 <div className="space-y-6">
                   {application.references.map((ref, index) => (
                     <div key={index} className="relative">
                       {/* Timeline dot */}
                       <div className="absolute left-0 top-2 w-3 h-3 bg-orange-500 rounded-full border-2 border-white shadow-sm"></div>
                       
                       {/* Content */}
                       <div className="ml-6 pb-6 border-l-2 border-gray-200 pl-6">
                         <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200">
                           <div className="flex items-start justify-between mb-3">
                             <div>
                               <h4 className="text-lg font-semibold text-gray-900 mb-1">
                                 {ref.ref_name || 'Reference Entry'}
                               </h4>
                               {ref.relationship && (
                                 <p className="text-orange-600 font-medium">{ref.relationship}</p>
                               )}
                             </div>
                           </div>
                           
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3">
                             {ref.ref_phone && (
                               <div className="flex items-center">
                                 <Icon icon="ph:phone" className="text-gray-400 mr-2" />
                                 <span className="text-gray-600">{ref.ref_phone}</span>
                               </div>
                             )}
                             {ref.ref_email && (
                               <div className="flex items-center">
                                 <Icon icon="ph:envelope" className="text-gray-400 mr-2" />
                                 <span className="text-gray-600">{ref.ref_email}</span>
                               </div>
                             )}
                           </div>
                           
                           {ref.known_duration && (
                             <div className="pt-3 border-t border-gray-200">
                               <div className="flex items-center">
                                 <Icon icon="ph:clock" className="text-gray-400 mr-2" />
                                 <span className="text-sm text-gray-600">
                                   Known for: <span className="font-medium">{ref.known_duration}</span>
                                 </span>
                               </div>
                             </div>
                           )}
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-8">
                   <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Icon icon="ph:users" className="text-gray-400 text-2xl" />
                   </div>
                   <p className="text-gray-500 text-lg font-medium">No References</p>
                   <p className="text-gray-400 text-sm">Reference information not provided</p>
                 </div>
               )}
             </div>
           </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
                     {/* Quick Actions */}
                       <Card>
              <h3 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Quick Actions</h3>
             <div className="space-y-3">
               <Button
                 text="Open Resume"
                 className="btn-primary w-full"
                 onClick={openResumeModal}
                 icon="ph:file-text"
               />
             </div>
           </Card>

          {/* Application Timeline */}
                     <Card>
             <h3 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Application Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <div>
                  <div className="text-sm font-medium">Application Submitted</div>
                  <div className="text-xs text-gray-500">{formatDate(application.created_at)}</div>
                </div>
              </div>
              {application.status !== "Applied" && (
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <div>
                    <div className="text-sm font-medium">Status Updated</div>
                    <div className="text-xs text-gray-500">Current: {application.status}</div>
                  </div>
                </div>
              )}
            </div>
          </Card>
                 </div>
       </div>

               {/* Image Modal */}
        {showImageModal && application?.photo_url && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4">
            <div className="relative max-w-4xl max-h-full">
              {/* Close button */}
              <button
                onClick={closeImageModal}
                className="absolute -top-4 -right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors duration-200 z-10"
              >
                <Icon icon="ph:x" className="text-gray-600 text-lg" />
              </button>
              
              {/* Image */}
              <img
                src={`/${application.photo_url}`}
                alt="Profile"
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                onError={(e) => {
                  e.target.style.display = 'none';
                  closeImageModal();
                }}
              />
            </div>
          </div>
        )}

        {/* Resume Modal */}
        {showResumeModal && application?.resume_url && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4">
            <div className="relative max-w-6xl max-h-full w-full">
              {/* Close button */}
              <button
                onClick={closeResumeModal}
                className="absolute -top-4 -right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors duration-200 z-10"
              >
                <Icon icon="ph:x" className="text-gray-600 text-lg" />
              </button>
              
              {/* Resume */}
              <div className="bg-white rounded-lg shadow-2xl w-full h-[90vh] overflow-hidden">
                <iframe
                  src={`/${application.resume_url}`}
                  className="w-full h-full"
                  title="Resume"
                  onError={() => {
                    closeResumeModal();
                    safeToastError("Failed to load resume");
                  }}
                />
              </div>
            </div>
          </div>
        )}
     </div>
   );
 };

export default ApplicationDetail; 