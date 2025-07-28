import db from "../db/knex.js";

export const createEvaluation = async (req, res) => {
  try {
    console.log("Request Body:", req.body);

    const { candidate, ratings, comments } = req.body;

    // ✅ Validate input
    if (!candidate?.id) {
      return res.status(400).json({ message: "Candidate application ID is required." });
    }

    if (!ratings || typeof ratings !== "object") {
      return res.status(400).json({ message: "Invalid 'ratings' format." });
    }

    const totalScore = Object.values(ratings)
      .map(Number)
      .reduce((sum, val) => sum + (isNaN(val) ? 0 : val), 0);

    // ✅ Insert into evaluation table (foreign key to candidate_applications)
    const [evaluationId] = await db("evaluation").insert({
      candidate_id: candidate.id, // Ensure this references candidate_applications.id
      evaluator_name: "interviewer",
      overall_comments: JSON.stringify(comments || {}),
      rating: totalScore,
    });

    // ✅ Insert detailed question ratings (optional table)
    const questionEntries = Object.entries(ratings).map(([question, value]) => ({
      evaluation_id: evaluationId,
      question,
      rating: Number(value),
    }));

    if (questionEntries.length > 0) {
      await db("evaluation_scores").insert(questionEntries);
    }

    res.status(201).json({
      message: "Evaluation submitted successfully",
      evaluationId,
    });
  } catch (error) {
    console.error("Error saving evaluation:", error);
    res.status(500).json({ message: "Failed to save evaluation", error });
  }
};

export const getEvaluations = async (req, res) => {
  try {
    const evaluations = await db("evaluation")
      .join("candidate_applications", "evaluation.candidate_id", "=", "candidate_applications.id")
      .select(
        "evaluation.id",
        "evaluation.candidate_id",
        "evaluation.rating",
        "evaluation.overall_comments",
        "evaluation.created_at",
        "candidate_applications.payload"
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
    console.error("Error fetching evaluations:", err);
    res.status(500).json({ error: "Failed to fetch evaluations" });
  }
};
