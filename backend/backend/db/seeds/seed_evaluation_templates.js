export async function seed(knex) {
  // Get the first SuperAdmin user to use as created_by
  const superAdmin = await knex("users")
    .where("role", "SuperAdmin")
    .first();

  if (!superAdmin) {
    console.log("No SuperAdmin user found. Skipping evaluation template seeds.");
    return;
  }

  // Get some jobs to associate templates with
  const jobs = await knex("jobs").select("id", "title");

  const templates = [
    {
      name: "Software Developer Evaluation",
      description: "Comprehensive evaluation template for software developer positions",
      job_id: jobs.find(j => j.title.toLowerCase().includes("developer"))?.id || null,
      main_questions: JSON.stringify([
        "Technical Skills and Programming Knowledge",
        "Problem-Solving Abilities",
        "Code Quality and Best Practices",
        "System Design and Architecture",
        "Communication and Team Collaboration"
      ]),
      extra_questions: JSON.stringify([
        "Experience with specific technologies",
        "Project management skills",
        "Learning ability and adaptability"
      ]),
      created_by: superAdmin.id,
      is_active: true
    },
    {
      name: "HR Manager Evaluation",
      description: "Evaluation template for HR management positions",
      job_id: jobs.find(j => j.title.toLowerCase().includes("hr"))?.id || null,
      main_questions: JSON.stringify([
        "HR Knowledge and Best Practices",
        "Leadership and Management Skills",
        "Communication and Interpersonal Skills",
        "Problem-Solving and Decision Making",
        "Organizational and Planning Skills"
      ]),
      extra_questions: JSON.stringify([
        "Experience with HRIS systems",
        "Conflict resolution skills",
        "Strategic thinking abilities"
      ]),
      created_by: superAdmin.id,
      is_active: true
    },
    {
      name: "General Interview Template",
      description: "Standard evaluation template for general positions",
      job_id: null, // General template
      main_questions: JSON.stringify([
        "Educational Qualifications",
        "Work Experience",
        "Technical/Professional Skills",
        "Communication Skills",
        "Confidence and Clarity"
      ]),
      extra_questions: JSON.stringify([
        "Problem-solving approach",
        "Teamwork and collaboration",
        "Career goals and motivation"
      ]),
      created_by: superAdmin.id,
      is_active: true
    }
  ];

  // Insert templates
  await knex("evaluation_templates").insert(templates);
  
  console.log("Evaluation templates seeded successfully");
}

export async function unseed(knex) {
  await knex("evaluation_templates").del();
} 