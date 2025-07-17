import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./api/routes/authRoutes.js";
import regionRoutes from "./api/routes/regionRoutes.js";
import districtRoutes from "./api/routes/districtRoutes.js";
import branchRoutes from "./api/routes/branchRoutes.js";
import memberRoutes from "./api/routes/memberRoutes.js";
import reportRoutes from "./api/routes/reportRoutes.js";

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

// Use authentication routes
app.use("/api/auth", authRoutes);
// Use region routes
app.use("/api/regions", regionRoutes);
// Use district routes
app.use("/api/districts", districtRoutes);
// Use branch routes
app.use("/api/branches", branchRoutes);
// Use member routes
app.use("/api/members", memberRoutes);

app.use("/api/reports", reportRoutes);

// Define the port the server will run on
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
