// migrations/YYYYMMDDHHMMSS_create_evaluation_scores_table.js (your generated filename)

export async function up(knex) {
    return knex.schema.createTable("evaluation_scores", (table) => {
      table.increments("id").primary(); // Primary key, auto-incrementing
      table
        .integer("evaluation_id")
        .unsigned() // Ensures the number is non-negative
        .notNullable()
        .references("id") // Foreign key reference to 'id' column
        .inTable("evaluation") // In the 'evaluation' table
        .onDelete("CASCADE"); // If the referenced evaluation is deleted, delete this row too
  
      table.string("question").notNullable(); // String for the question text
      table.integer("rating").unsigned().notNullable(); // Integer for the rating, non-negative
    });
  }
  
  export async function down(knex) {
    return knex.schema.dropTable("evaluation_scores"); // Reverts the migration by dropping the table
  }