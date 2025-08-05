import React, { useEffect, useState } from "react";
import Card from "@/components/ui/card";
import Button from "../components/ui/Button.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Badge from "@/components/ui/Badge";
import Icon from "@/components/ui/Icon";

const PendingEvaluations = () => {
  const [pendingEvaluations, setPendingEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
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
        
        // Filter for pending evaluations
        const pending = response.data.filter(application => 
          !application.evaluation_status || application.evaluation_status === 'pending'
        );
        
        setPendingEvaluations(pending);
      } catch (error) {
        console.error("Error fetching pending evaluations:", error);
        setPendingEvaluations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingEvaluations();
  }, []);

  const handleEvaluate = (candidate) => {
    navigate(`/evaluate/${candidate.id}`, { state: { candidate } });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

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

      {/* Pending Evaluations Table */}
      <Card className="bg-white shadow border">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-10">
              <p className="text-gray-600">Loading pending evaluations...</p>
            </div>
          ) : pendingEvaluations.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No pending evaluations found.</p>
              <p className="text-gray-400 text-sm mt-2">All evaluations have been completed.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied Date
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days Pending
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
                {pendingEvaluations.map((evaluation) => (
                  <tr key={evaluation.id} className="hover:bg-gray-50">
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
                          <div className={`h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center ${evaluation.photo_url ? 'hidden' : ''}`}>
                            <span className="text-white text-sm font-medium">
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
                        <div className="truncate max-w-[120px] text-center" title={evaluation.phone || "No phone"}>
                          {evaluation.phone || "No phone"}
                        </div>
                        <div className="text-gray-500 break-all text-center" title={evaluation.email}>
                          {evaluation.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {formatDate(evaluation.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      <span className="text-yellow-600 font-medium">
                        {evaluation.created_at ? 
                          Math.floor((new Date() - new Date(evaluation.created_at)) / (1000 * 60 * 60 * 24)) : 
                          'N/A'
                        } days
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Badge className="badge-warning">Pending</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <Button
                        text="Evaluate"
                        className="btn-outline-primary btn-sm h-8"
                        onClick={() => handleEvaluate(evaluation)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PendingEvaluations; 