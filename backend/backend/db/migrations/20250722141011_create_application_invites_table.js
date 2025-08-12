export function up(knex) {
  return knex.schema.createTable("application_invites", (table) => {
    table.increments("id").primary();

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

    table.string("token_hash", 64).notNullable().unique();

    table.dateTime("expires_at").notNullable();
    table.dateTime("sent_at");
    table.dateTime("opened_at");
    table.dateTime("submitted_at");

    table
      .enu("status", ["pending", "sent", "opened", "submitted", "expired", "revoked"])
      .notNullable()
      .defaultTo("pending");

    table.json("metadata");

    // --- Check-in related fields ---
    table.string("checkin_token").unique();
    table.timestamp("checkin_sent_at").nullable();
    table.timestamp("checked_in_at").nullable();
    table.string("checkin_status").defaultTo("pending"); // pending, arrived, late, invalid
    table.timestamp("interview_start_time").nullable(); // from metadata.interviewDateTime for quick lookup

    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    table.index(["candidate_id"], "idx_application_invites_candidate_id");
    table.index(["job_id"], "idx_application_invites_job_id");
  });
}

export function down(knex) {
  return knex.schema.dropTable("application_invites");
}
