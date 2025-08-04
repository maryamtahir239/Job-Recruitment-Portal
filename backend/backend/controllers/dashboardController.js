import knex from '../db/knex.js';

// Get interviewer dashboard statistics
export const getInterviewerDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID not found in token" });
    }

    // Get total applications
    const totalApplications = await knex("candidate_applications")
      .count("* as count")
      .first();

    // Get pending evaluations (applications that haven't been evaluated by this interviewer)
    const pendingEvaluations = await knex("candidate_applications")
      .leftJoin("evaluation", function() {
        this.on("candidate_applications.id", "=", "evaluation.application_id")
          .andOn("evaluation.evaluator_id", "=", userId);
      })
      .whereNull("evaluation.id")
      .count("* as count")
      .first();

    // Get completed evaluations by this interviewer
    const completedEvaluations = await knex("evaluation")
      .where("evaluator_id", userId)
      .count("* as count")
      .first();

    // Get upcoming interviews (applications with status "Shortlisted" or "Under Review")
    const upcomingInterviews = await knex("candidate_applications")
      .whereIn("status", ["Shortlisted", "Under Review"])
      .count("* as count")
      .first();

    // Get last updated timestamp
    const lastUpdated = await knex("candidate_applications")
      .max("updated_at as last_updated")
      .first();

    const stats = {
      totalApplications: parseInt(totalApplications.count) || 0,
      pendingEvaluations: parseInt(pendingEvaluations.count) || 0,
      completedEvaluations: parseInt(completedEvaluations.count) || 0,
      upcomingInterviews: parseInt(upcomingInterviews.count) || 0,
      lastUpdated: lastUpdated.last_updated || new Date().toISOString()
    };

    res.json(stats);
  } catch (err) {
    console.error("GET /api/dashboard/interviewer-stats error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard statistics" });
  }
};

// Get HR dashboard statistics
export const getHRDashboardStats = async (req, res) => {
  try {
    // Get total applications
    const totalApplications = await knex("candidate_applications")
      .count("* as count")
      .first();

    // Get applications by status
    const applicationsByStatus = await knex("candidate_applications")
      .select("status")
      .count("* as count")
      .groupBy("status");

    // Get total evaluations
    const totalEvaluations = await knex("evaluation")
      .count("* as count")
      .first();

    // Get recent applications (last 7 days)
    const recentApplications = await knex("candidate_applications")
      .where("created_at", ">=", knex.raw("DATE_SUB(NOW(), INTERVAL 7 DAY)"))
      .count("* as count")
      .first();

    const stats = {
      totalApplications: parseInt(totalApplications.count) || 0,
      totalEvaluations: parseInt(totalEvaluations.count) || 0,
      recentApplications: parseInt(recentApplications.count) || 0,
      applicationsByStatus: applicationsByStatus.reduce((acc, item) => {
        acc[item.status] = parseInt(item.count);
        return acc;
      }, {})
    };

    res.json(stats);
  } catch (err) {
    console.error("GET /api/dashboard/hr-stats error:", err);
    res.status(500).json({ error: "Failed to fetch HR dashboard statistics" });
  }
}; 