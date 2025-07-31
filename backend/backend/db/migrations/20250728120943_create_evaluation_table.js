export async function up(knex) {
    return knex.schema.createTable("evaluation", (table) => {
      table.increments("id").primary();
      table
        .integer("application_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("candidate_applications")
        .onDelete("CASCADE");
  
      table.string("evaluator_name").notNullable();
      table.text("educational_qualifications");
      table.text("work_experience");
      table.text("technical_skills");
      table.text("communication_skills");
      table.text("confidence_and_clarity");
      table.text("overall_comments");
      table.integer("rating").unsigned();
      table.timestamp("created_at").defaultTo(knex.fn.now());
    });
  }
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  export async function down(knex) {
    return knex.schema.dropTable("evaluation");
  }
  