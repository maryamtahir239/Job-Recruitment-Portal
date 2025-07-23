
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
  
      table.string("form_version", 64).notNullable().defaultTo("ST-HR-F-001 v6.0");
      table.json("payload").notNullable();
      table.boolean("is_complete").notNullable().defaultTo(false);
  
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
  
      table.index(["candidate_id"], "idx_candapps_candidate_id");
      table.index(["job_id"], "idx_candapps_job_id");
      table.index(["invite_id"], "idx_candapps_invite_id");
    });
  }
  
  export function down(knex) {
    return knex.schema.dropTable("candidate_applications");
  }
  