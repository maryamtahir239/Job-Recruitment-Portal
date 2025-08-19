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
  
        table
        .integer("evaluator_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("users") // or "interviewers" if you have a separate table
        .onDelete("CASCADE");
      
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
  