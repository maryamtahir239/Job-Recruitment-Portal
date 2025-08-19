import React, { useState, useEffect } from "react";
import Button from "../../components/ui/Button"; 
import Card from "../../components/ui/Card";
import Icon from "../../components/ui/Icon";
import { useNavigate } from "react-router-dom";
import ReactApexChart from "react-apexcharts";
 

const InterviewerDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const navigate = useNavigate();
  
  // State management
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingEvaluations: 0,
    completedEvaluations: 0,
    upcomingInterviews: 0,
    lastUpdated: new Date().toISOString()
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [performanceData, setPerformanceData] = useState({
    averageScore: 0,
    totalEvaluations: 0,
    completionRate: 0
  });
  const [weeklyTrendsOptions, setWeeklyTrendsOptions] = useState({
    chart: {
      type: 'line',
      height: 200,
      toolbar: { show: false }
    },
    series: [
      { name: 'Applications', data: [0, 0, 0, 0, 0, 0, 0] },
      { name: 'Evaluations', data: [0, 0, 0, 0, 0, 0, 0] }
    ],
    xaxis: {
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    colors: ['#3B82F6', '#10B981'],
    stroke: { curve: 'smooth' }
  });

  const handleViewApplications = () => navigate("/applications");
  const handleEvaluatedCandidates = () => navigate("/evaluated-candidates");
  const handlePendingEvaluations = () => navigate("/pending-evaluations");

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch("/api/dashboard/interviewer-stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch dashboard stats");
      }

      const data = await response.json();
      
      setStats({
        totalApplications: data.stats?.totalApplications || 0,
        pendingEvaluations: data.stats?.pendingEvaluations || 0,
        completedEvaluations: data.stats?.completedEvaluations || 0,
        upcomingInterviews: data.stats?.upcomingInterviews || 0,
        lastUpdated: data.stats?.lastUpdated || new Date().toISOString()
      });

      setPerformanceData({
        averageScore: data.performance?.averageScore || 0,
        totalEvaluations: data.performance?.totalEvaluations || 0,
        completionRate: data.performance?.completionRate || 0
      });

      setRecentActivity(data.recentActivity || []);

      setWeeklyTrendsOptions(prev => ({
        ...prev,
        series: [
          { 
            name: 'Applications', 
            data: data.weeklyTrends?.applications || Array(7).fill(0) 
          },
          { 
            name: 'Evaluations', 
            data: data.weeklyTrends?.evaluations || Array(7).fill(0) 
          }
        ]
      }));

    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const formatLastUpdated = (timestamp) => {
    if (!timestamp) return "Never";
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return "Yesterday";
    return date.toLocaleDateString();
  };

  const formatActivityTime = (timestamp) => {
    if (!timestamp) return "Just now";
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffHours < 48) return "Yesterday";
    return date.toLocaleDateString();
  };

  const evaluationProgressOptions = {
    chart: {
      type: 'donut',
      height: 200
    },
    series: [stats.completedEvaluations, stats.pendingEvaluations],
    labels: ['Completed', 'Pending'],
    colors: ['#10B981', '#F59E0B'],
    legend: { position: 'bottom' },
    plotOptions: {
      pie: { donut: { size: '60%' } }
    }
  };
 


  return (
    <div className="flex flex-col items-center justify-start min-h-screen mt-4 bg-gray-50 px-4">
   
  


      <div className="text-center p-1 w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome, {user?.name || "Interviewer"}!
        </h1>
        <p className="text-gray-600 text-lg mb-1">
          You are logged in as{" "}
          <span className="font-semibold text-blue-600">
            {user?.role || "interviewer"}
          </span>.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          Review interview details and provide feedback through the dashboard.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <Button
            text="View Applications"
            className="btn-primary px-6 py-3 text-base font-medium hover:shadow-lg transition-all duration-200 mb-2 w-full sm:w-auto flex items-center justify-center gap-2"
            onClick={handleViewApplications}
          >
            <Icon icon="ph:file-text" className="text-white text-lg" />
            View Applications
          </Button>
          <Button
            text="Completed Evaluations"
            className="btn-primary px-6 py-3 text-base font-medium hover:shadow-lg transition-all duration-200 mb-2 w-full sm:w-auto flex items-center justify-center gap-2"
            onClick={handleEvaluatedCandidates}
          >
            <Icon icon="ph:check-circle" className="text-white text-lg" />
            Completed Evaluations
          </Button>
          <Button
            text="Pending Evaluations"
            className="btn-primary px-6 py-3 text-base font-medium hover:shadow-lg transition-all duration-200 mb-2 w-full sm:w-auto flex items-center justify-center gap-2"
            onClick={handlePendingEvaluations}
          >
            <Icon icon="ph:clock" className="text-white text-lg" />
            Pending Evaluations
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 w-full max-w-6xl px-2 mb-8">
        <Card className="bg-white shadow border">
          <div className="flex flex-row-reverse items-center justify-between">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon icon="ph:file-text" className="text-blue-600 text-2xl" />
            </div>
            <div className="flex flex-col items-start">
              <div className="text-2xl font-bold text-gray-900">{loading ? "..." : stats.totalApplications}</div>
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
              <div className="text-2xl font-bold text-gray-900">{loading ? "..." : stats.pendingEvaluations}</div>
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
              <div className="text-2xl font-bold text-gray-900">{loading ? "..." : stats.completedEvaluations}</div>
              <div className="text-sm text-gray-600">Completed Evaluations</div>
            </div>
          </div>
        </Card>
        <Card className="bg-white shadow border">
          <div className="flex flex-row-reverse items-center justify-between">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Icon icon="ph:calendar" className="text-purple-600 text-2xl" />
            </div>
            <div className="flex flex-col items-start">
              <div className="text-2xl font-bold text-gray-900">{loading ? "..." : stats.upcomingInterviews}</div>
              <div className="text-sm text-gray-600">Upcoming Interviews</div>
            </div>
          </div>
        </Card>
        <Card className="bg-white shadow border">
          <div className="flex flex-row-reverse items-center justify-between">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center -mt-6">
              <Icon icon="ph:activity" className="text-red-600 text-2xl" />
            </div>
            <div className="flex flex-col items-start">
              <div className="text-xl font-bold text-gray-900">Last updated</div>
              <div className="text-sm text-gray-600">{loading ? "Loading..." : formatLastUpdated(stats.lastUpdated)}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts and Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-6xl px-2 mb-8">
        {/* Evaluation Progress Chart */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Evaluation Progress</h3>
            <ReactApexChart
              options={evaluationProgressOptions}
              series={evaluationProgressOptions.series}
              type="donut"
              height={200}
            />
          </div>
        </Card>

        {/* Weekly Trends Chart */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Trends</h3>
            <ReactApexChart
              options={weeklyTrendsOptions}
              series={weeklyTrendsOptions.series}
              type="line"
              height={200}
            />
          </div>
        </Card>
      </div>

      {/* Performance Insights and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-6xl px-2 mb-8">
        {/* Performance Insights */}
        <Card>
  <div className="p-6">
    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
      <Icon icon="ph:chart-line" className="text-blue-600" />
      Performance Insights
    </h3>
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-gray-600">Total Evaluations</span>
        <div className="flex items-center gap-2">
          {/* This is the new line */}
          <span className="font-semibold text-blue-600">
            {performanceData.totalEvaluations}
          </span>
          <div className="w-24 bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${performanceData.totalEvaluations > 100 ? 100 : performanceData.totalEvaluations}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-gray-600">Average Score</span>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-green-600">
            {performanceData.averageScore.toFixed(1)}%
          </span>
          <div className="w-24 bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-green-600 h-2.5 rounded-full"
              style={{ width: `${performanceData.averageScore}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-gray-600">Completion Rate</span>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-purple-600">
            {performanceData.completionRate}%
          </span>
          <div className="w-24 bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-purple-600 h-2.5 rounded-full"
              style={{ width: `${performanceData.completionRate}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</Card>
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Icon icon="ph:activity" className="text-green-600" />
              Recent Activity
            </h3>
          
<div className="space-y-3">
  {console.log("Recent Activity in Frontend:", recentActivity)}
      {recentActivity.map((activity) => {
        const activityDate = new Date(activity.time);
    const now = new Date();
    const diffHours = Math.floor((now - activityDate) / (1000 * 60 * 60));
    
    let timeText;
    if (diffHours < 1) timeText = "Just now";
    else if (diffHours < 24) timeText = `${diffHours} hours ago`;
    else if (diffHours < 48) timeText = "Yesterday";
    else timeText = activityDate.toLocaleDateString();

    return (
      <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            activity.type === 'evaluation_completed' ? 'bg-green-100' : 'bg-blue-100'
          }`}>
            <Icon 
              icon={activity.type === 'evaluation_completed' ? 'ph:check-circle' : 'ph:user-plus'} 
              className={`text-sm ${
                activity.type === 'evaluation_completed' ? 'text-green-600' : 'text-blue-600'
              }`} 
            />
          </div>
          <div>
            <p className="font-medium text-gray-800">{activity.candidate}</p>
            <p className="text-sm text-gray-600">{activity.position}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">{timeText}</p>
          {activity.score && (
            <p className="text-sm font-medium text-green-600">Score: {activity.score}%</p>
          )}
        </div>
      </div>
    );
  })}
</div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default InterviewerDashboard;