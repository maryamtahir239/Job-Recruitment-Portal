import knex from '../db/knex.js';

export const getInterviewerDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(400).json({ error: "User ID not found in token" });
    }

    // 1. Basic Stats
    const [
      totalApplications,
      pendingEvaluations,
      completedEvaluations,
      upcomingInterviews,
      lastUpdated
    ] = await Promise.all([
      knex("candidate_applications").count("* as count").first(),
      knex("candidate_applications")
        .leftJoin("evaluation", function() {
          this.on("candidate_applications.id", "=", "evaluation.application_id")
              .andOn("evaluation.evaluator_id", "=", userId);
        })
        .whereNull("evaluation.id")
        .count("* as count")
        .first(),
      knex("evaluation")
        .where("evaluator_id", userId)
        .count("* as count")
        .first(),
      knex("candidate_applications")
        .whereIn("status", ["Shortlisted", "Under Review"])
        .count("* as count")
        .first(),
      knex("candidate_applications")
        .max("updated_at as last_updated")
        .first()
    ]);

    // 2. Weekly Trends
    const [weeklyApplications, weeklyEvaluations] = await Promise.all([
      knex("candidate_applications")
        .select(knex.raw("DAYNAME(created_at) as day"), knex.raw("COUNT(*) as count"))
        .where("created_at", ">=", knex.raw("DATE_SUB(NOW(), INTERVAL 7 DAY)"))
        .groupByRaw("DAYNAME(created_at)")
        .orderByRaw("FIELD(day, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')"),
      knex("evaluation")
        .select(knex.raw("DAYNAME(created_at) as day"), knex.raw("COUNT(*) as count"))
        .where("evaluator_id", userId)
        .where("created_at", ">=", knex.raw("DATE_SUB(NOW(), INTERVAL 7 DAY)"))
        .groupByRaw("DAYNAME(created_at)")
        .orderByRaw("FIELD(day, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')")
    ]);

    // 3. Performance Data
    const [averageScore, completionRate] = await Promise.all([
      knex("evaluation")
        .where("evaluator_id", userId)
        .avg("rating as avg_score")
        .first(),
      knex("evaluation")
        .where("evaluator_id", userId)
        .count("* as count")
        .first()
    ]);

    const recentActivityData = await knex("evaluation")
  .join("candidate_applications", "evaluation.application_id", "candidate_applications.id")
  .join("candidates", "candidate_applications.candidate_id", "candidates.id")
  .join("jobs", "candidate_applications.job_id", "jobs.id")
  .select(
    "evaluation.id",
    "evaluation.rating as score",
    "evaluation.created_at as time",
    "candidates.name as candidate_name",
    "candidates.id as candidate_id",
    "jobs.title as position",
    "jobs.id as job_id",
    "candidate_applications.id as application_id"
  )
  .orderBy("evaluation.created_at", "desc");


    // Log for debugging
    console.log("Recent Activity Raw Data:", {
      count: recentActivityData.length,
      sample: recentActivityData[0],
      allCandidates: recentActivityData.map(a => a.candidate_name),
      allPositions: recentActivityData.map(a => a.position)
    });

    // 5. Final Response
    const response = {
      stats: {
        totalApplications: parseInt(totalApplications?.count || 0),
        pendingEvaluations: parseInt(pendingEvaluations?.count || 0),
        completedEvaluations: parseInt(completedEvaluations?.count || 0),
        upcomingInterviews: parseInt(upcomingInterviews?.count || 0),
        lastUpdated: lastUpdated?.last_updated || new Date().toISOString()
      },
      weeklyTrends: {
        applications: weeklyApplications?.map(item => item.count) || Array(7).fill(0),
        evaluations: weeklyEvaluations?.map(item => item.count) || Array(7).fill(0)
      },
      performance: {
        averageScore: parseFloat(averageScore?.avg_score || 0),
        totalEvaluations: parseInt(completionRate?.count || 0),
        completionRate: Math.round(
          (parseInt(completionRate?.count || 0) / parseInt(totalApplications?.count || 1)) * 100
        ) || 0
      },
      recentActivity: recentActivityData.map(item => ({
        id: item.id,
        type: "evaluation_completed",
        candidate: item.candidate_name || "Unknown Candidate",
        position: item.position || "Unknown Position",
        time: item.time,
        score: item.score
      }))
    };

    res.json(response);
  } catch (err) {
    console.error("GET /api/dashboard/interviewer-stats error:", err);
    res.status(500).json({
      error: "Failed to fetch dashboard statistics",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

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

