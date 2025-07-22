//_create_users_table.js
export function up(knex) {
    return knex.schema.createTable("users", (table) => {
      table.increments("id").primary();
      table.string("name").notNullable();
      table.string("email").notNullable().unique();
      table.string("password").notNullable();
      table.enu("role", ["SuperAdmin", "HR", "Interviewer"]).notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());
    });
  }
  
  export function down(knex) {
    return knex.schema.dropTable("users");
  }
  