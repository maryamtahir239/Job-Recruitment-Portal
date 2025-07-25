export async function up(knex) {
  return knex.schema.createTable("evaluation_scores", (table) => {
    table.increments("id").primary();
    table
      .integer("evaluation_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("evaluation")
      .onDelete("CASCADE");

    table.string("question").notNullable();
    table.integer("rating").unsigned().notNullable();
  });
}

export async function down(knex) {
  return knex.schema.dropTable("evaluation_scores");
}
