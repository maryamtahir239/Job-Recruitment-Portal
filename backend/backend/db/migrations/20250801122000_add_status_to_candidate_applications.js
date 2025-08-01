export function up(knex) {
  return knex.schema.alterTable("candidate_applications", (table) => {
    table.string("status").defaultTo("Applied").notNullable();
  });
}

export function down(knex) {
  return knex.schema.alterTable("candidate_applications", (table) => {
    table.dropColumn("status");
  });
} 