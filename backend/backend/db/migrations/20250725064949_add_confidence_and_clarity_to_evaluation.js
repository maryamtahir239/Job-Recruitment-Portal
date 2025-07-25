export async function up(knex) {
  return knex.schema.alterTable("evaluation", (table) => {
    table.text("confidence_and_clarity");
  });
}

export async function down(knex) {
  return knex.schema.alterTable("evaluation", (table) => {
    table.dropColumn("confidence_and_clarity");
  });
}
