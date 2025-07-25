/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("evaluation", (table) => {
    table.increments("id").primary();
    table.integer("candidate_id").unsigned().notNullable();
    table.string("evaluator_name").notNullable();
    table.text("educational_qualifications");
    table.text("work_experience");
    table.text("technical_skills");
    table.text("communication_skills");
    table.text("confidence_and_clarity");
    table.text("overall_comments");
    table.integer("rating").unsigned();
    table.timestamp("created_at").defaultTo(knex.fn.now());

    table
      .foreign("candidate_id")
      .references("id")
      .inTable("candidates")
      .onDelete("CASCADE");
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTable("evaluation");
}
