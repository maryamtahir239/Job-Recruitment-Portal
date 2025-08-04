import React, { useState, useEffect } from "react";
import Button from "../../components/ui/Button"; 
import Card from "../../components/ui/Card";
import Icon from "../../components/ui/Icon";
import { useNavigate } from "react-router-dom";
import ReactApexChart from "react-apexcharts";

const InterviewerDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingEvaluations: 0,
    completedEvaluations: 0,
    upcomingInterviews: 0,
    lastUpdated: new Date().toISOString()
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [performanceData, setPerformanceData] = useState({
    averageScore: 0,
    totalEvaluations: 0,
    completionRate: 0
  });

  const handleViewApplications = () => {
    navigate("/applications");
  };

  const handleEvaluatedCandidates = () => {
    navigate("/evaluated-candidates");
  };

  const handlePendingEvaluations = () => {
    navigate("/pending-evaluations");
  };

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/dashboard/interviewer-stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          console.error("Failed to fetch dashboard stats");
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchRecentActivity = async () => {
      try {
        // Mock data for recent activity
        const mockActivity = [
          {
            id: 1,
            type: "evaluation_completed",
            candidate: "John Doe",
            position: "Frontend Developer",
            time: "2 hours ago",
            score: 85
          },
          {
            id: 2,
            type: "new_application",
            candidate: "Jane Smith",
            position: "Backend Developer",
            time: "4 hours ago"
          },
          {
            id: 3,
            type: "evaluation_completed",
            candidate: "Mike Johnson",
            position: "UI/UX Designer",
            time: "1 day ago",
            score: 92
          }
        ];
        setRecentActivity(mockActivity);
      } catch (error) {
        console.error("Error fetching recent activity:", error);
      }
    };

    const fetchPerformanceData = async () => {
      try {
        // Mock performance data
        setPerformanceData({
          averageScore: 87.5,
          totalEvaluations: 24,
          completionRate: 85.7
        });
      } catch (error) {
        console.error("Error fetching performance data:", error);
      }
    };

    fetchDashboardStats();
    fetchRecentActivity();
    fetchPerformanceData();
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

  // Chart configuration for evaluation progress
  const evaluationProgressOptions = {
    chart: {
      type: 'donut',
      height: 200
    },
    series: [stats.completedEvaluations, stats.pendingEvaluations],
    labels: ['Completed', 'Pending'],
    colors: ['#10B981', '#F59E0B'],
    legend: {
      position: 'bottom'
    },
    plotOptions: {
      pie: {
        donut: {
          size: '60%'
        }
      }
    }
  };

  // Chart configuration for weekly trends
  const weeklyTrendsOptions = {
    chart: {
      type: 'line',
      height: 200,
      toolbar: {
        show: false
      }
    },
    series: [{
      name: 'Applications',
      data: [12, 19, 15, 25, 22, 30, 28]
    }, {
      name: 'Evaluations',
      data: [8, 15, 12, 20, 18, 25, 22]
    }],
    xaxis: {
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    colors: ['#3B82F6', '#10B981'],
    stroke: {
      curve: 'smooth'
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
        <Card>
          <div className="flex items-center">
            <div className="flex-1">
              <h4 className="text-2xl font-bold text-gray-900">
                {loading ? "..." : stats.totalApplications}
              </h4>
              <p className="text-gray-600">Total Applications</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon icon="ph:file-text" className="text-blue-600 text-xl" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-1">
              <h4 className="text-2xl font-bold text-gray-900">
                {loading ? "..." : stats.pendingEvaluations}
              </h4>
              <p className="text-gray-600">Pending Evaluations</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Icon icon="ph:clock" className="text-yellow-600 text-xl" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-1">
              <h4 className="text-2xl font-bold text-gray-900">
                {loading ? "..." : stats.completedEvaluations}
              </h4>
              <p className="text-gray-600">Completed Evaluations</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon icon="ph:check-circle" className="text-green-600 text-xl" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-1">
              <h4 className="text-2xl font-bold text-gray-900">
                {loading ? "..." : stats.upcomingInterviews}
              </h4>
              <p className="text-gray-600">Upcoming Interviews</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Icon icon="ph:calendar" className="text-purple-600 text-xl" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-1">
              <h4 className="text-xl font-bold text-gray-900">Last updated</h4>
              <p className="text-gray-600">
                {loading ? "Loading..." : formatLastUpdated(stats.lastUpdated)}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center -mt-6 justify-center">
              <Icon icon="ph:activity" className="text-red-600 text-xl" />
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
                <span className="text-gray-600">Average Score</span>
                <span className="font-semibold text-green-600">{performanceData.averageScore}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Evaluations</span>
                <span className="font-semibold text-blue-600">{performanceData.totalEvaluations}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completion Rate</span>
                <span className="font-semibold text-purple-600">{performanceData.completionRate}%</span>
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
              {recentActivity.map((activity) => (
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
                    <p className="text-sm text-gray-500">{activity.time}</p>
                    {activity.score && (
                      <p className="text-sm font-medium text-green-600">Score: {activity.score}%</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default InterviewerDashboard;
