// migrations/YYYYMMDDHHMMSS_create_candidate_applications.js (your generated filename)

export function up(knex) {
    return knex.schema.createTable("candidate_applications", (table) => {
      table.increments("id").primary(); // Primary key, auto-incrementing
  
      table
        .integer("invite_id")
        .unsigned() // Ensures the number is non-negative
        .notNullable()
        .references("id") // Foreign key reference to 'id' column
        .inTable("application_invites") // In the 'application_invites' table
        .onDelete("CASCADE"); // If the referenced invite is deleted, delete this row too
  
      table
        .integer("candidate_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("candidates")
        .onDelete("CASCADE"); // If the referenced candidate is deleted, delete this row too
  
      table
        .integer("job_id")
        .unsigned()
        .nullable() // This column can be NULL
        .references("id")
        .inTable("jobs")
        .onDelete("SET NULL"); // If the referenced job is deleted, set this column to NULL
  
      table.json("payload").notNullable(); // Stores JSON data
      table.boolean("is_complete").notNullable().defaultTo(false); // Boolean with a default value
  
      // Application status
      table
        .enu("status", ["Applied", "Under Review", "Shortlisted", "Rejected", "Hired"])
        .notNullable()
        .defaultTo("Applied");
  
      // File paths
      table.string("photo_filename").nullable(); // String for filename, can be NULL
      table.string("resume_filename").nullable(); // String for filename, can be NULL
  
      table.timestamp("created_at").defaultTo(knex.fn.now()); // Timestamp, defaults to current time
      table.timestamp("updated_at").defaultTo(knex.fn.now()); // Timestamp, defaults to current time
  
      // Indexing for faster lookups on these columns
      table.index(["candidate_id"], "idx_candidate_applications_candidate");
      table.index(["job_id"], "idx_candidate_applications_job");
      table.index(["invite_id"], "idx_candidate_applications_invite");
      table.index(["status"], "idx_candidate_applications_status");
      table.index(["created_at"], "idx_candidate_applications_created_at");
    });
  }
  
  export function down(knex) {
    return knex.schema.dropTable("candidate_applications"); // Reverts the migration by dropping the table
  }