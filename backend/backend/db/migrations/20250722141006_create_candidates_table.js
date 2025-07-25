// This is your main candidates migration file.
// The filename will be something like 20230101000000_create_candidates_table.js (replace with your actual filename)

export async function up(knex) {
  return knex.schema.createTable("candidates", (table) => {
    table.increments("id").primary(); // INT UNSIGNED AUTO_INCREMENT, primary key
    table.string("name").notNullable(); // Full name, cannot be null
    table.string("email").notNullable().unique(); // Email, cannot be null, must be unique
    table.string("phone").nullable(); // Phone number, can be null
    table.string("designation").nullable(); // Job designation/title, can be null
    table.string("location").nullable(); // Candidate's location, can be null

    // This single line adds both 'created_at' and 'updated_at' columns.
    // For MySQL:
    // - created_at will default to CURRENT_TIMESTAMP on insert.
    // - updated_at will default to CURRENT_TIMESTAMP on insert AND
    //   automatically update to CURRENT_TIMESTAMP on every row modification.
    table.timestamps(true, true); // (useTimestamps, use_updated_at_as_update_trigger)
  });
}

export async function down(knex) {
  // Drops the 'candidates' table if it exists, reverting the 'up' operation.
  return knex.schema.dropTableIfExists("candidates");
}