// ✅ Must be very first for async error capture
require("express-async-errors");

const httpContext = require("express-http-context");
// const { v4: uuid } = require("uuid");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const { connectDB } = require("./config/db.js");
const { errorLogger, accessLogger } = require("./config/logger.js");

dotenv.config();
connectDB();
const app = express();

app.use(express.json());

// ✅ Attach request ID for traceability
app.use(httpContext.middleware);

// app.use((req, res, next) => {
//   const reqId = uuid();
//   httpContext.set("reqId", reqId);
//   req.reqId = reqId;
//   next();
// });

// ✅ Restore CORS handling!
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
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error("Blocked by CORS"), false);
  },
};
app.use(cors(corsOptions));

// ✅ Static uploads
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// ✅ Access logging middleware (MUST be before routes)
app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  res.on("finish", () => {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1_000_000;

    accessLogger.info({
      // reqId: req.reqId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${durationMs.toFixed(2)}ms`,
      slow: durationMs > 500 ? "⚠️ Slow request detected" : undefined,
      requestSize: req.socket.bytesRead,
      responseSize: res.getHeader("Content-Length") || 0,
    });
  });

  next();
});

// ✅ Routes
app.use("/api/auth", require("./api/routes/authRoutes.js"));
app.use("/api/users", require("./api/routes/userRoutes.js"));
app.use("/api/regions", require("./api/routes/regionRoutes.js"));
app.use("/api/districts", require("./api/routes/districtRoutes.js"));
app.use("/api/branches", require("./api/routes/branchRoutes.js"));
app.use("/api/members", require("./api/routes/memberRoutes.js"));
app.use("/api/reports", require("./api/routes/reportRoutes.js"));
app.use("/api/meetings", require("./api/routes/meetingRoutes.js"));
app.use("/api/contributions", require("./api/routes/contributionRoutes.js"));

// ✅ Test route
app.get("/error-test", async (req, res) => {
  throw new Error("💥 Test error logging!");
});

// ✅ MUST be the last middleware
process.on("unhandledRejection", (reason) => {
  errorLogger.error({
    event: "UNHANDLED_REJECTION",
    reason: reason.message || reason,
  });
});

process.on("uncaughtException", (error) => {
  errorLogger.error({
    event: "UNCAUGHT_EXCEPTION",
    message: error.message,
    stack: error.stack,
  });
  process.exit(1); // Restart via PM2 or systemd
});

const PORT = process.env.PORT;
app.listen(PORT, () =>
  console.log(`✅ Server running & logging on port ${PORT}`)
);
