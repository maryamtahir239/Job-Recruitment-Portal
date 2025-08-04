import db from "./db/knex.js";

// Set environment variables if not already set
if (!process.env.DB_HOST) {
  process.env.DB_HOST = "localhost";
  process.env.DB_USER = "root";
  process.env.DB_PASSWORD = "";
  process.env.DB_NAME = "interview_portal";
  process.env.JWT_SECRET = "your-super-secret-jwt-key-change-this-in-production";
}

async function checkTables() {
  try {
    console.log("Checking database tables...");
    
    // Get all tables
    const tables = await db.raw("SHOW TABLES");
    console.log("All tables:", tables[0].map(row => Object.values(row)[0]));
    
    // Check if evaluation table exists
    const evaluationTable = tables[0].find(row => 
      Object.values(row)[0].toLowerCase().includes('evaluation')
    );
    
    if (evaluationTable) {
      console.log("✅ Evaluation table found:", Object.values(evaluationTable)[0]);
      
      // Check evaluation table structure
      const evaluationStructure = await db.raw("DESCRIBE evaluation");
      console.log("Evaluation table structure:", evaluationStructure[0]);
      
      // Check evaluation data
      const evaluations = await db("evaluation").select("*");
      console.log("Evaluation data:", evaluations);
    } else {
      console.log("❌ Evaluation table not found");
      
      // Check for similar table names
      const similarTables = tables[0].filter(row => 
        Object.values(row)[0].toLowerCase().includes('eval') ||
        Object.values(row)[0].toLowerCase().includes('score')
      );
      console.log("Similar tables found:", similarTables.map(row => Object.values(row)[0]));
    }
    
  } catch (error) {
    console.error("Error checking tables:", error);
  } finally {
    process.exit(0);
  }
}

checkTables(); 