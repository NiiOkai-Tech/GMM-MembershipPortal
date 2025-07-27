const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
dotenv.config();

let connection;

const connectDB = async () => {
  try {
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
    process.exit(1);
  }
};

const getDB = () => {
  if (!connection)
    throw new Error("Database not initialized. Call connectDB first.");
  return connection;
};

module.exports = { connectDB, getDB };
