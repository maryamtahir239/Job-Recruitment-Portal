import db from "../db/knex.js";

export const createEvaluation = async (req, res) => {
  try {
    const { candidate, ratings, comments } = req.body;
    
    console.log("Received evaluation data:", { candidate, ratings, comments });
    console.log("User from token:", req.user);

    // ✅ Validate input
    if (!candidate?.id) {
      return res.status(400).json({ message: "Candidate application ID is required." });
    }

    if (!ratings || typeof ratings !== "object") {
      return res.status(400).json({ message: "Invalid 'ratings' format." });
    }

    const totalScore = Object.values(ratings)
      .map(rating => {
        // Convert text ratings to numeric scores
        const scoreMap = {
          "excellent": 5,
          "good": 4,
          "average": 3,
          "satisfactory": 2,
          "unsatisfactory": 1
        };
        return scoreMap[rating] || 0;
      })
      .reduce((sum, val) => sum + val, 0);
    
    console.log("Calculated total score:", totalScore);

    // ✅ Insert into evaluation table (foreign key to candidate_applications)
    const evaluatorId = req.user?.id;
    if (!evaluatorId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check if candidate application exists
    const candidateApp = await db("candidate_applications")
      .where("id", candidate.id)
      .first();
    
    console.log("Found candidate application:", candidateApp);
    
    if (!candidateApp) {
      return res.status(404).json({ message: "Candidate application not found." });
    }

    const evaluationData = {
      application_id: candidate.id, // Changed from candidate_id to application_id to match migration
      evaluator_id: evaluatorId,
      overall_comments: JSON.stringify(comments || {}),
      rating: totalScore,
    };
    
    console.log("Inserting evaluation data:", evaluationData);

    const [evaluationId] = await db("evaluation").insert(evaluationData);
    
    console.log("Created evaluation with ID:", evaluationId);

    // ✅ Insert detailed question ratings (optional table)
    const questionEntries = Object.entries(ratings).map(([question, rating]) => ({
      evaluation_id: evaluationId,
      question,
      rating: rating, // Keep the text rating as is
    }));

    if (questionEntries.length > 0) {
      console.log("Inserting question entries:", questionEntries);
      await db("evaluation_scores").insert(questionEntries);
    }

    res.status(201).json({
      message: "Evaluation submitted successfully",
      evaluationId,
    });
  } catch (error) {
    console.error("Evaluation creation error:", error);
    
    // Handle specific database errors
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({ 
        message: "Database table not found. Please run migrations.",
        error: error.message 
      });
    }
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ 
        message: "Invalid candidate application ID.",
        error: error.message 
      });
    }
    
    res.status(500).json({ 
      message: "Failed to save evaluation", 
      error: error.message 
    });
  }
};

export const getEvaluations = async (req, res) => {
  try {
    const evaluations = await db("evaluation")
      .join("candidate_applications", "evaluation.application_id", "=", "candidate_applications.id")
      .join("users", "evaluation.evaluator_id", "=", "users.id")
      .select(
        "evaluation.id",
        "evaluation.application_id",
        "evaluation.rating",
        "evaluation.overall_comments",
        "evaluation.created_at",
        "candidate_applications.payload",
        "users.name as evaluator_name"
      )
      .orderBy("evaluation.created_at", "desc");

    const evaluationIds = evaluations.map((e) => e.id);
    const scores = await db("evaluation_scores")
      .whereIn("evaluation_id", evaluationIds)
      .select("evaluation_id", "question", "rating");

    // Group scores by evaluation_id
    const scoresGrouped = scores.reduce((acc, curr) => {
      if (!acc[curr.evaluation_id]) acc[curr.evaluation_id] = [];
      acc[curr.evaluation_id].push({ question: curr.question, rating: curr.rating });
      return acc;
    }, {});

    const result = evaluations.map((evalItem) => {
      const payload = JSON.parse(evalItem.payload);
      return {
        id: evalItem.id,
        candidateName: payload.personal?.full_name || "Unknown",
        totalScore: evalItem.rating,
        comments: JSON.parse(evalItem.overall_comments),
        createdAt: evalItem.created_at,
        scores: scoresGrouped[evalItem.id] || [],
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch evaluations" });
  }
};
