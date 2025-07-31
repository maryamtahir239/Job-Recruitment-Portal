import React, { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Icon from "@/components/ui/Icon";
import axios from "axios";
import { toast } from "react-toastify";

const HRDashboard = () => {
  console.log("HRDashboard: Component function called");
  
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  console.log("HRDashboard: User data:", user);
  
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalCandidates: 0,
    totalApplications: 0,
    recentApplications: 0
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("HRDashboard: Component mounted, fetching data...");
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log("HRDashboard: Starting to fetch dashboard data...");
      setLoading(true);
      setError(null);
      
      // Temporarily remove authentication headers to test
      // const config = {
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json'
      //   }
      // };
      
      // Fetch jobs
      const jobsResponse = await axios.get("/api/jobs");
      const jobs = jobsResponse.data;
      console.log("HRDashboard: Jobs fetched:", jobs.length);
      
      // Fetch candidates
      const candidatesResponse = await axios.get("/api/candidates");
      const candidates = candidatesResponse.data;
      console.log("HRDashboard: Candidates fetched:", candidates.length);
      
      // Fetch applications
      const applicationsResponse = await axios.get("/api/applications");
      const applications = applicationsResponse.data;
      console.log("HRDashboard: Applications fetched:", applications.length);
      
      // Calculate stats
      const activeJobs = jobs.filter(job => job.status === "Active").length;
      const recentApplications = applications.filter(app => {
        const appDate = new Date(app.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return appDate > weekAgo;
      }).length;
      
      setStats({
        totalJobs: jobs.length,
        activeJobs,
        totalCandidates: candidates.length,
        totalApplications: applications.length,
        recentApplications
      });
      
      // Store candidates and applications in state
      setCandidates(candidates);
      setApplications(applications);
      
      // Get recent jobs (last 5)
      setRecentJobs(jobs.slice(0, 5));
      
      console.log("HRDashboard: Data fetching completed successfully");
    } catch (error) {
      console.error("HRDashboard: Error fetching data:", error);
      setError(error.message);
      // Only show toast for non-authentication errors
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        toast.error(`Failed to load dashboard data: ${error.response?.data?.error || error.message}`);
      }
    } finally {
      setLoading(false);
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

  if (error) {
    console.log("HRDashboard: Rendering error state");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button
            text="Retry"
            className="btn-primary"
            onClick={() => {
              setError(null);
              fetchDashboardData();
            }}
          />
        </div>
      </div>
    );
  }

  if (loading) {
    console.log("HRDashboard: Rendering loading state");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  console.log("HRDashboard: Rendering main component");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome, {user?.name || "HR"}!
        </h1>
        <p className="text-gray-600 text-lg mb-4">
          You are logged in as{" "}
          <span className="font-semibold text-blue-600">{user?.role}</span>.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          Manage job postings, review applications, and track recruitment progress.
        </p>
        
        {/* Quick Actions */}
        <div className="flex justify-center space-x-4 mb-8">
          <Button
            text="Manage Job Postings"
            className="btn-primary"
            onClick={() => window.location.href = "/job-postings"}
          />
          <Button
            text="View Applications"
            className="btn-outline-primary"
            onClick={() => window.location.href = "/applications"}
          />
          <Button
            text="View Candidates"
            className="btn-outline-secondary"
            onClick={() => window.location.href = "/candidates"}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
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
              <h4 className="text-2xl font-bold text-gray-900">{stats.activeJobs}</h4>
              <p className="text-gray-600">Active Jobs</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon icon="ph:check-circle" className="text-green-600 text-xl" />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="flex-1">
              <h4 className="text-2xl font-bold text-gray-900">{stats.totalCandidates}</h4>
              <p className="text-gray-600">Total Candidates</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Icon icon="ph:users" className="text-purple-600 text-xl" />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="flex-1">
              <h4 className="text-2xl font-bold text-gray-900">{stats.totalApplications}</h4>
              <p className="text-gray-600">Applications</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Icon icon="ph:file-text" className="text-yellow-600 text-xl" />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="flex-1">
              <h4 className="text-2xl font-bold text-gray-900">{stats.recentApplications}</h4>
              <p className="text-gray-600">This Week</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Icon icon="ph:clock" className="text-red-600 text-xl" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Jobs */}
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Recent Job Postings</h3>
          <Button
            text="View All Jobs"
            className="btn-outline-primary"
            onClick={() => window.location.href = "/job-postings"}
          />
        </div>
        
        {recentJobs.length === 0 ? (
          <div className="text-center py-8">
            <Icon icon="ph:briefcase" className="text-gray-400 text-4xl mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No jobs posted yet</p>
            <Button
              text="Create First Job"
              className="btn-primary"
              onClick={() => window.location.href = "/job-postings"}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job Title
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidates
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applications
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-medium text-gray-900">{job.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {job.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {candidates.filter(c => c.job_id === job.id).length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {applications.filter(a => a.job_id === job.id).length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {getStatusBadge(job.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <Button
                        text="View Details"
                        className="btn-outline-primary btn-sm"
                        onClick={() => window.location.href = `/job-postings/${job.id}`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default HRDashboard;