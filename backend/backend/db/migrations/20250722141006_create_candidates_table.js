export async function up(knex) {
  return knex.schema.createTable("candidates", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.string("email").notNullable(); // Remove unique constraint from email
    table.string("phone").nullable();
    table.string("designation").nullable();
    table.string("location").nullable();

    table.integer("job_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("jobs")
      .onDelete("SET NULL"); 
    
    // Add composite unique constraint on email and job_id
    table.unique(["email", "job_id"], "candidates_email_job_unique");
    
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists("candidates");
}