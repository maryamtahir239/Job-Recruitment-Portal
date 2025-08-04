// Test database connection
import db from "./db/knex.js";

// Set environment variables if not already set
if (!process.env.DB_HOST) {
  process.env.DB_HOST = "localhost";
  process.env.DB_USER = "root";
  process.env.DB_PASSWORD = "";
  process.env.DB_NAME = "job_recruitment_portal";
  process.env.JWT_SECRET = "your-super-secret-jwt-key-change-this-in-production";
}

console.log("Testing database connection...");
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_NAME:", process.env.DB_NAME);

try {
  // Test connection
  await db.raw('SELECT 1');
  console.log("✅ Database connection successful!");
  
  // Check if tables exist
  const tables = await db.raw("SHOW TABLES");
  console.log("Available tables:", tables[0].map(row => Object.values(row)[0]));
  
  // Check evaluation table
  const evaluationCount = await db("evaluation").count("* as count");
  console.log("Evaluation count:", evaluationCount[0].count);
  
  // Check candidate_applications table
  const applicationsCount = await db("candidate_applications").count("* as count");
  console.log("Candidate applications count:", applicationsCount[0].count);
  
  // Check users table
  const usersCount = await db("users").count("* as count");
  console.log("Users count:", usersCount[0].count);
  
} catch (error) {
  console.error("❌ Database connection failed:", error.message);
  console.error("Full error:", error);
} finally {
  process.exit(0);
} 