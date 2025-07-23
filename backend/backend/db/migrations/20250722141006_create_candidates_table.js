export async function up(knex) {
  return knex.schema.createTable("candidates", (table) => {
    table.increments("id").primary(); // INT UNSIGNED AUTO_INCREMENT
    table.string("name").notNullable(); // Full name
    table.string("email").notNullable().unique();
    table.string("phone").nullable();
    table.string("designation").nullable();
    table.string("location").nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists("candidates");
}
