import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";

// Load environment variables from .env file
dotenv.config();

// Initialize Database Connection
connectDB();

// Initialize Express app
const app = express();

// Middleware
// Enable Cross-Origin Resource Sharing
app.use(cors());
// Parse incoming JSON requests
app.use(express.json());

// A simple test route to ensure the server is working
app.get("/", (req, res) => {
  res.send("Membership Portal API is running...");
});

// TODO: Import and use route files here
// Example: import regionRoutes from './routes/regionRoutes.js';
// app.use('/api/regions', regionRoutes);

// Define the port the server will run on
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
