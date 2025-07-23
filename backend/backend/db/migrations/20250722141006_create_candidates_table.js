// create_candidates_table.js
// Minimal candidate record. Extend as needed (resume_url, status, etc.).

export function up(knex) {
    return knex.schema.createTable("candidates", (table) => {
      table.increments("id").primary(); // INT UNSIGNED AUTO_INCREMENT
      table.string("first_name").notNullable();
      table.string("last_name").notNullable();
      table.string("email").notNullable().unique();
      table.string("phone");
      table.timestamp("created_at").defaultTo(knex.fn.now());
    });
  }
  
  export function down(knex) {
    return knex.schema.dropTable("candidates");
  }
  