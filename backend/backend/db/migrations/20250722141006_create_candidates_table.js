export async function up(knex) {
  return knex.schema.createTable("candidates", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.string("email").notNullable().unique();
    table.string("phone").nullable();
    table.string("designation").nullable();
    table.string("location").nullable();

    
    table.integer("job_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("jobs")
      .onDelete("SET NULL"); 
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists("candidates");
}