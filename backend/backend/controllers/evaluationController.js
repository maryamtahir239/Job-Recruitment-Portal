import db from "../db/knex.js"
export const createEvaluation = async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    const { candidate, ratings, comments } = req.body;

    if (!ratings || typeof ratings !== "object") {
      return res.status(400).json({ message: "Invalid 'ratings' format." });
    }

    const totalScore = Object.values(ratings)
      .map(Number)
      .reduce((sum, val) => sum + (isNaN(val) ? 0 : val), 0);

    // Insert into evaluation table
    const [evaluationId] = await db("evaluation").insert({
      candidate_id: candidate?.id,
      evaluator_name: "interviewer",
      overall_comments: JSON.stringify(comments || {}),
      rating: totalScore,
    });

    // Insert dynamic questions into evaluation_scores table
    const questionEntries = Object.entries(ratings).map(([question, value]) => ({
      evaluation_id: evaluationId,
      question,
      rating: Number(value),
    }));

    await db("evaluation_scores").insert(questionEntries);

    res.status(201).json({
      message: "Evaluation submitted successfully",
      evaluationId,
    });
  } catch (error) {
    console.error("Error saving evaluation:", error);
    res.status(500).json({ message: "Failed to save evaluation", error });
  }
};
