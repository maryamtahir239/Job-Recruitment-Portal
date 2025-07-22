// backend/createDatabase.js
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

(async () => {
  try {
    // Connect to MySQL server (without specifying database)
    const connection = await mysql.createConnection({
      host: DB_HOST || "127.0.0.1",
      user: DB_USER || "root",
      password: DB_PASSWORD || "",
    });

    // Create DB if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
    console.log(`Database '${DB_NAME}' created or already exists.`);
    await connection.end();
    process.exit(0);
  } catch (err) {
    console.error("Error creating database:", err);
    process.exit(1);
  }
})();
