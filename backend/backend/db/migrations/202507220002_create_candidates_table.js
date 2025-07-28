// migrations/20250724120000_create_candidate_applications.js

export function up(knex) {
  return knex.schema.createTable("candidate_applications", (table) => {
    table.increments("id").primary();

    table
      .integer("invite_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("application_invites")
      .onDelete("CASCADE");

    table
      .integer("candidate_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("candidates")
      .onDelete("CASCADE");

    table
      .integer("job_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("jobs")
      .onDelete("SET NULL");

    table.json("payload").notNullable();
    table.boolean("is_complete").notNullable().defaultTo(false);

    table.string("photo_filename").nullable();
    table.string("resume_filename").nullable();

    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    table.index(["candidate_id"], "idx_candidate_applications_candidate");
    table.index(["job_id"], "idx_candidate_applications_job");
    table.index(["invite_id"], "idx_candidate_applications_invite");
  });
}

export function down(knex) {
  return knex.schema.dropTable("candidate_applications");
}
