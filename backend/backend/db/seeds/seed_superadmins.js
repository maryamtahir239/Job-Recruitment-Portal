import bcrypt from "bcryptjs";

export async function seed(knex) {
  const hash1 = await bcrypt.hash("admin123", 10);
  const hash2 = await bcrypt.hash("admin456", 10);

  await knex("users").insert([
    {
      name: "Admin One",
      email: "admin1@portal.com",
      password: hash1,
      role: "SuperAdmin",
    },
    {
      name: "Admin Two",
      email: "admin2@portal.com",
      password: hash2,
      role: "SuperAdmin",
    },
  ]);
}
