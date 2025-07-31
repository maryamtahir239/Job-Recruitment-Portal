// Add profile_image field to users table
export function up(knex) {
  return knex.schema.alterTable("users", (table) => {
    table.string("profile_image").nullable();
  });
}

export function down(knex) {
  return knex.schema.alterTable("users", (table) => {
    table.dropColumn("profile_image");
  });
} 