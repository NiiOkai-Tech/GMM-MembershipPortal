import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

let connection;

export const connectDB = async () => {
  try {
    // Create a connection pool
    connection = await mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    console.log("MySQL Connected...");
    return connection;
  } catch (err) {
    console.error(`Error: ${err.message}`);
    // Exit process with failure
    process.exit(1);
  }
};

// Export a function to get the connection pool
export const getDB = () => {
  if (!connection) {
    throw new Error("Database not initialized. Call connectDB first.");
  }
  return connection;
};
