// create_jobs_table.js
// Basic job record. Extend with dept_id, location_id, etc., later.

export function up(knex) {
    return knex.schema.createTable("jobs", (table) => {
      table.increments("id").primary();
      table.string("title").notNullable();
      table.text("description");
      table.boolean("is_active").notNullable().defaultTo(true);
      table.timestamp("created_at").defaultTo(knex.fn.now());
    });
  }  
  export function down(knex) {
    return knex.schema.dropTable("jobs");
  }
  