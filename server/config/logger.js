// config/logger.js
const { createLogger, format, transports } = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const path = require("path");

// ✅ Sensitive data redactor
const redactSensitive = format((info) => {
  const keysToRedact = ["password", "token", "authorization", "auth"];
  const redact = (obj) => {
    if (typeof obj === "object") {
      for (let key in obj) {
        if (keysToRedact.includes(key.toLowerCase())) {
          obj[key] = "***REDACTED***";
        } else if (typeof obj[key] === "object") {
          redact(obj[key]);
        }
      }
    }
  };
  redact(info);
  return info;
})();

const logFormat = format.combine(
  redactSensitive,
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.json()
);

// ✅ Access log rotation
const accessLogger = createLogger({
  //   reqId: req.reqId,
  level: "info",
  format: logFormat,
  transports: [
    new DailyRotateFile({
      dirname: path.join(__dirname, "../logs"),
      filename: "access-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "10m",
      maxFiles: "30d",
    }),
  ],
});

// ✅ Error log rotation + console log for debugging
const errorLogger = createLogger({
  //   reqId: req.reqId,
  level: "error",
  format: logFormat,
  transports: [
    new transports.Console(),
    new DailyRotateFile({
      dirname: path.join(__dirname, "../logs"),
      filename: "error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "10m",
      maxFiles: "60d",
    }),
  ],
});

module.exports = { accessLogger, errorLogger };
