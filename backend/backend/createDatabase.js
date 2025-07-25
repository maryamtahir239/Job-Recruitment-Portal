// backend/createDatabase.js
import dotenv from "dotenv";
import mysql from "mysql2/promise"; // Using mysql2/promise for async/await

// Load environment variables from .env file
dotenv.config();

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

(async () => {
  let connection; // Declare connection outside try-catch for finally block access
  try {
    // 1. Connect to MySQL server (without specifying a database)
    connection = await mysql.createConnection({
      host: DB_HOST || "127.0.0.1",
      user: DB_USER || "root",
      password: DB_PASSWORD || "",
    });

    // 2. Check if the database already exists
    const [rows] = await connection.execute(
      `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`,
      [DB_NAME]
    );

    if (rows.length > 0) {
      // Database already exists
      console.log(`Database '${DB_NAME}' already exists.`);
    } else {
      // Database does not exist, so create it
      await connection.query(`CREATE DATABASE \`${DB_NAME}\`;`);
      console.log(`Database '${DB_NAME}' created successfully.`);
    }

    // 3. Close the connection and exit successfully
    await connection.end();
    process.exit(0);
  } catch (err) {
    console.error("Error creating/checking database:", err);
    if (connection) {
      try {
        await connection.end(); // Attempt to close connection even on error
      } catch (closeErr) {
        console.error("Error closing database connection:", closeErr);
      }
    }
    process.exit(1);
  }
})();