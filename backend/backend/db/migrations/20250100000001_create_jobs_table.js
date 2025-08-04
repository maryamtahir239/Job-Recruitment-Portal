export async function up(knex) {
  return knex.schema.createTable('jobs', (table) => {
    table.increments('id').primary();
    table.string('title').notNullable();
    table.string('department');
    table.integer('openings').defaultTo(1);
    table.enum('status', ['Active', 'Closed', 'Draft']).defaultTo('Active');
    table.date('deadline');
    table.text('description');
    table.text('requirements');
    table.string('salary_range');
    table.string('location');
    table.enum('job_type', ['Full-time', 'Part-time', 'Contract', 'Internship']).defaultTo('Full-time');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  return knex.schema.dropTable('jobs');
}
