export async function up(knex) {
  return knex.schema.createTable("evaluation_templates", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.text("description").nullable();
    // Foreign key to jobs table, required for every template
    table.integer("job_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("jobs")
      .onDelete("CASCADE")
      .index();
    table.json("main_questions").notNullable().defaultTo("[]");
    table.json("extra_questions").notNullable().defaultTo("[]");
    table.boolean("is_active").notNullable().defaultTo(true);
    table.integer("created_by")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    
    // Indexes
    table.index(["job_id"], "idx_evaluation_templates_job_id");
    table.index(["is_active"], "idx_evaluation_templates_active");
    table.index(["created_by"], "idx_evaluation_templates_created_by");
  });
}

export async function down(knex) {
  return knex.schema.dropTable("evaluation_templates");
} 