import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Icon from "@/components/ui/Icon";

const SuperAdminDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalCandidates: 0,
    totalApplications: 0,
    totalHR: 0,
    totalInterviewers: 0,
    recentJobs: [],
    recentApplications: [],
    jobStatusDistribution: {},
    applicationStatusDistribution: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("SuperAdminDashboard useEffect called at:", new Date().toISOString());
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    console.log("SuperAdminDashboard fetchDashboardData called at:", new Date().toISOString());
    
    try {
      setLoading(true);
      
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "null");
      
      console.log("Current user:", user);
      console.log("Token:", token ? "Present" : "Missing");
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      // Fetch all required data
      const [jobsRes, candidatesRes, applicationsRes, usersRes] = await Promise.all([
        axios.get("/api/jobs"), // No auth required
        axios.get("/api/candidates", { headers }), // Auth required
        axios.get("/api/applications", { headers }), // Auth required
        axios.get("/api/admin/users", { headers }) // Auth required
      ]);

      const jobs = jobsRes.data || [];
      const candidates = candidatesRes.data || [];
      const applications = applicationsRes.data || [];
      const users = usersRes.data || [];
      
      console.log("Fetched data:", {
        jobs: jobs.length,
        candidates: candidates.length,
        applications: applications.length,
        users: users.length
      });
      
      console.log("Users data:", users);
      console.log("User roles found:", users.map(u => u.role));

      // Calculate statistics
      const activeJobs = jobs.filter(job => job.status === "Active").length;
      const hrUsers = users.filter(user => user.role === "HR").length;
      const interviewerUsers = users.filter(user => user.role === "Interviewer").length;

      // Job status distribution
      const jobStatusDistribution = jobs.reduce((acc, job) => {
        acc[job.status] = (acc[job.status] || 0) + 1;
        return acc;
      }, {});

      // Application status distribution
      const applicationStatusDistribution = applications.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, {});

      // Recent jobs (last 5)
      const recentJobs = jobs
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

      // Recent applications (last 5)
      const recentApplications = applications
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

      const finalStats = {
        totalJobs: jobs.length,
        activeJobs,
        totalCandidates: candidates.length,
        totalApplications: applications.length,
        totalHR: hrUsers,
        totalInterviewers: interviewerUsers,
        recentJobs,
        recentApplications,
        jobStatusDistribution,
        applicationStatusDistribution
      };
      
      console.log("Calculated statistics:", finalStats);
      setStats(finalStats);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Only show error for non-authentication issues
      if (
        error.response?.status !== 401 &&
        error.response?.status !== 403 &&
        error.response?.data?.error !== "Invalid credentials"
      ) {
        console.error("Dashboard data fetch error:", error.response?.data || error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      "Active": { color: "success", text: "Active" },
      "Closed": { color: "danger", text: "Closed" },
      "Draft": { color: "warning", text: "Draft" },
      "Applied": { color: "info", text: "Applied" },
      "Under Review": { color: "warning", text: "Under Review" },
      "Shortlisted": { color: "success", text: "Shortlisted" },
      "Rejected": { color: "danger", text: "Rejected" },
      "Hired": { color: "success", text: "Hired" }
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Super Admin Dashboard</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Monitor and oversee the entire recruitment system. View statistics, track performance, and manage user access.
        </p>
        {user && (
          <div className="mt-4 text-sm text-gray-500">
            Signed in as <strong>{user.name}</strong> ({user.email})
          </div>
        )}
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="flex-1">
              <h4 className="text-2xl font-bold text-gray-900">{stats.totalJobs}</h4>
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
              <h4 className="text-2xl font-bold text-gray-900">{stats.totalCandidates}</h4>
              <p className="text-gray-600">Total Candidates</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon icon="ph:users" className="text-green-600 text-xl" />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="flex-1">
              <h4 className="text-2xl font-bold text-gray-900">{stats.totalApplications}</h4>
              <p className="text-gray-600">Total Applications</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Icon icon="ph:file-text" className="text-purple-600 text-xl" />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="flex-1">
              <h4 className="text-2xl font-bold text-gray-900">{stats.totalHR + stats.totalInterviewers}</h4>
              <p className="text-gray-600">Total Users</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Icon icon="ph:user-circle" className="text-orange-600 text-xl" />
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Statistics */}
        <Card>
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Icon icon="ph:chart-bar" className="text-blue-600 mr-2" />
            Job Statistics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Jobs:</span>
              <span className="font-semibold">{stats.activeJobs}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Closed Jobs:</span>
              <span className="font-semibold">{stats.jobStatusDistribution.Closed || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Draft Jobs:</span>
              <span className="font-semibold">{stats.jobStatusDistribution.Draft || 0}</span>
            </div>
          </div>
        </Card>

        {/* User Statistics */}
        <Card>
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Icon icon="ph:users-three" className="text-green-600 mr-2" />
            User Statistics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">HR Users:</span>
              <span className="font-semibold">{stats.totalHR}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Interviewers:</span>
              <span className="font-semibold">{stats.totalInterviewers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Users:</span>
              <span className="font-semibold">{stats.totalHR + stats.totalInterviewers}</span>
            </div>
          </div>
        </Card>
      </div>


      <Card>
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <Icon icon="ph:gear" className="text-gray-600 mr-2" />
          System Management
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            text="Manage Users"
            className="btn-outline-primary w-full"
            onClick={() => navigate("/superadmin-dashboard/hr-interview")}
          />
          <Button
            text="View All Jobs"
            className="btn-outline-secondary w-full"
            onClick={() => navigate("/job-postings")}
          />
          <Button
            text="View All Applications"
            className="btn-outline-info w-full"
            onClick={() => navigate("/applications")}
          />
          <Button
            text="Evaluation Templates"
            className="btn-outline-warning w-full"
            onClick={() => navigate("/evaluation-templates")}
          />
        </div>
      </Card>


      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold flex items-center">
              <Icon icon="ph:briefcase" className="text-blue-600 mr-2" />
              Recent Jobs
            </h3>
            <Button
              text="View All"
              className="btn-outline-primary btn-sm"
              onClick={() => navigate("/job-postings")}
            />
          </div>
          <div className="space-y-3">
            {stats.recentJobs.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No jobs found</p>
            ) : (
              stats.recentJobs.map((job) => (
                <div key={job.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{job.title}</h4>
                    <p className="text-sm text-gray-600">{job.department}</p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(job.status)}
                    <p className="text-xs text-gray-500 mt-1">{formatDate(job.created_at)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Recent Applications */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold flex items-center">
              <Icon icon="ph:file-text" className="text-purple-600 mr-2" />
              Recent Applications
            </h3>
            <Button
              text="View All"
              className="btn-outline-primary btn-sm"
              onClick={() => navigate("/applications")}
            />
          </div>
          <div className="space-y-3">
            {stats.recentApplications.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No applications found</p>
            ) : (
              stats.recentApplications.map((application) => (
                <div key={application.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{application.full_name}</h4>
                    <p className="text-sm text-gray-600">{application.email}</p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(application.status)}
                    <p className="text-xs text-gray-500 mt-1">{formatDate(application.created_at)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      
    </div>
  );
};

export default SuperAdminDashboard;
