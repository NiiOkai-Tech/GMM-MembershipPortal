const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { connectDB } = require("./config/db.js");
const authRoutes = require("./api/routes/authRoutes.js");
const regionRoutes = require("./api/routes/regionRoutes.js");
const districtRoutes = require("./api/routes/districtRoutes.js");
const branchRoutes = require("./api/routes/branchRoutes.js");
const memberRoutes = require("./api/routes/memberRoutes.js");
const reportRoutes = require("./api/routes/reportRoutes.js");
const userRoutes = require("./api/routes/userRoutes.js");
const meetingRoutes = require("./api/routes/meetingRoutes.js");
const contributionRoutes = require("./api/routes/contributionRoutes.js");

dotenv.config();
connectDB();
const app = express();

// Whitelist of allowed domains
const allowedOrigins = [
  "https://ghanamuslimmission.net",
  "https://www.ghanamuslimmission.net",
  "https://membership.ghanamuslimmission.net",
  "https://www.membership.ghanamuslimmission.net",
  "http://localhost:5173",
  "http://localhost:3000",
];

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg =
        "The CORS policy for this site does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json());

app.get("/", (req, res) => res.send("Membership Portal API is running..."));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/regions", regionRoutes);
app.use("/api/districts", districtRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/contributions", contributionRoutes);

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
