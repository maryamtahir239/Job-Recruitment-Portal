import db from "../db/knex.js";

// Get all evaluation templates
export const getEvaluationTemplates = async (req, res) => {
  try {
    console.log("Fetching evaluation templates...");
    const templates = await db("evaluation_templates")
      .leftJoin("jobs", "evaluation_templates.job_id", "jobs.id")
      .leftJoin("users", "evaluation_templates.created_by", "users.id")
      .select(
        "evaluation_templates.*",
        "jobs.title as job_title",
        "users.name as created_by_name"
      )
      .orderBy("evaluation_templates.created_at", "desc");

    console.log("Found templates:", templates);
    res.json(templates);
  } catch (error) {
    console.error("Error fetching evaluation templates:", error);
    res.status(500).json({ error: "Failed to fetch evaluation templates" });
  }
};

// Get evaluation template by ID
export const getEvaluationTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const template = await db("evaluation_templates")
      .leftJoin("jobs", "evaluation_templates.job_id", "jobs.id")
      .leftJoin("users", "evaluation_templates.created_by", "users.id")
      .select(
        "evaluation_templates.*",
        "jobs.title as job_title",
        "users.name as created_by_name"
      )
      .where("evaluation_templates.id", id)
      .first();

    if (!template) {
      return res.status(404).json({ error: "Evaluation template not found" });
    }

    res.json(template);
  } catch (error) {
    console.error("Error fetching evaluation template:", error);
    res.status(500).json({ error: "Failed to fetch evaluation template" });
  }
};

// Get evaluation template by job ID
export const getEvaluationTemplateByJobId = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const template = await db("evaluation_templates")
      .leftJoin("jobs", "evaluation_templates.job_id", "jobs.id")
      .leftJoin("users", "evaluation_templates.created_by", "users.id")
      .select(
        "evaluation_templates.*",
        "jobs.title as job_title",
        "users.name as created_by_name"
      )
      .where("evaluation_templates.job_id", jobId)
      .where("evaluation_templates.is_active", true)
      .first();

    if (!template) {
      return res.status(404).json({ error: "No active evaluation template found for this job" });
    }

    res.json(template);
  } catch (error) {
    console.error("Error fetching evaluation template by job ID:", error);
    res.status(500).json({ error: "Failed to fetch evaluation template" });
  }
};

// Create new evaluation template
export const createEvaluationTemplate = async (req, res) => {
  try {
    const { name, description, job_id, main_questions, extra_questions } = req.body;
    const created_by = req.user.id;

    // Validate required fields
    if (!name || !main_questions || !Array.isArray(main_questions)) {
      return res.status(400).json({ error: "Name and main questions are required" });
    }

    // If job_id is provided, check if it exists
    if (job_id) {
      const job = await db("jobs").where("id", job_id).first();
      if (!job) {
        return res.status(400).json({ error: "Invalid job ID" });
      }
    }

    const templateData = {
      name,
      description,
      job_id,
      main_questions: JSON.stringify(main_questions),
      extra_questions: JSON.stringify(extra_questions || []),
      created_by,
      is_active: true
    };

    const [templateId] = await db("evaluation_templates").insert(templateData);
    
    const newTemplate = await db("evaluation_templates")
      .leftJoin("jobs", "evaluation_templates.job_id", "jobs.id")
      .leftJoin("users", "evaluation_templates.created_by", "users.id")
      .select(
        "evaluation_templates.*",
        "jobs.title as job_title",
        "users.name as created_by_name"
      )
      .where("evaluation_templates.id", templateId)
      .first();

    res.status(201).json(newTemplate);
  } catch (error) {
    console.error("Error creating evaluation template:", error);
    res.status(500).json({ error: "Failed to create evaluation template" });
  }
};

// Update evaluation template
export const updateEvaluationTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, job_id, main_questions, extra_questions, is_active } = req.body;

    // Check if template exists
    const existingTemplate = await db("evaluation_templates").where("id", id).first();
    if (!existingTemplate) {
      return res.status(404).json({ error: "Evaluation template not found" });
    }

    // Validate required fields
    if (!name || !main_questions || !Array.isArray(main_questions)) {
      return res.status(400).json({ error: "Name and main questions are required" });
    }

    // If job_id is provided, check if it exists
    if (job_id) {
      const job = await db("jobs").where("id", job_id).first();
      if (!job) {
        return res.status(400).json({ error: "Invalid job ID" });
      }
    }

    const updateData = {
      name,
      description,
      job_id,
      main_questions: JSON.stringify(main_questions),
      extra_questions: JSON.stringify(extra_questions || []),
      is_active: is_active !== undefined ? is_active : existingTemplate.is_active,
      updated_at: db.fn.now()
    };

    await db("evaluation_templates").where("id", id).update(updateData);
    
    const updatedTemplate = await db("evaluation_templates")
      .leftJoin("jobs", "evaluation_templates.job_id", "jobs.id")
      .leftJoin("users", "evaluation_templates.created_by", "users.id")
      .select(
        "evaluation_templates.*",
        "jobs.title as job_title",
        "users.name as created_by_name"
      )
      .where("evaluation_templates.id", id)
      .first();

    res.json(updatedTemplate);
  } catch (error) {
    console.error("Error updating evaluation template:", error);
    res.status(500).json({ error: "Failed to update evaluation template" });
  }
};

// Delete evaluation template
export const deleteEvaluationTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if template exists
    const existingTemplate = await db("evaluation_templates").where("id", id).first();
    if (!existingTemplate) {
      return res.status(404).json({ error: "Evaluation template not found" });
    }

    await db("evaluation_templates").where("id", id).del();

    res.json({ message: "Evaluation template deleted successfully" });
  } catch (error) {
    console.error("Error deleting evaluation template:", error);
    res.status(500).json({ error: "Failed to delete evaluation template" });
  }
}; 