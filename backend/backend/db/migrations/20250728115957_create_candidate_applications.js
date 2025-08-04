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

    table
      .enu("status", ["Applied", "Under Review", "Shortlisted", "Rejected", "Hired"])
      .notNullable()
      .defaultTo("Applied");

    table
      .enu("evaluation_status", ["pending", "completed"])
      .notNullable()
      .defaultTo("pending");

    table.string("photo_url").nullable();
    table.string("resume_url").nullable();
    table.string("photo_filename").nullable();
    table.string("resume_filename").nullable();

    table.string("father_name").nullable();
    table.string("cnic").nullable();
    table.string("date_of_birth").nullable();
    table.string("gender").nullable();
    table.string("nationality").nullable();
    table.string("marital_status").nullable();

    table.text("address").nullable();
    table.string("city").nullable();
    table.string("province").nullable();

    table.string("emergency_contact_name").nullable();
    table.string("emergency_contact_phone").nullable();

    table.text("why_interested").nullable();
    table.text("career_goals").nullable();
    table.string("expected_salary").nullable();
    table.string("notice_period").nullable();

    table.boolean("isFresher").defaultTo(false);
    table.boolean("hasReferences").defaultTo(false);

    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    table.index(["candidate_id"], "idx_candidate_applications_candidate");
    table.index(["job_id"], "idx_candidate_applications_job");
    table.index(["invite_id"], "idx_candidate_applications_invite");
    table.index(["status"], "idx_candidate_applications_status");
    table.index(["created_at"], "idx_candidate_applications_created_at");
  });
}

export function down(knex) {
  return knex.schema.dropTable("candidate_applications");
}
