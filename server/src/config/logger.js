const winston = require("winston");
const dotenv = require("dotenv");
const { format } = winston;
const { combine, timestamp, printf, colorize, errors, splat, json } = format;

dotenv.config();

// Custom console format for pretty-printing
const consoleFormat = combine(
  colorize(), // Add colors to the output
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), // Add timestamp
  printf(({ timestamp, level, message, stack }) => {
    // Pretty-print JSON objects
    if (typeof message === "object") {
      message = JSON.stringify(message, null, 2); // Indent with 2 spaces
    }
    // Include stack trace for errors
    if (stack) {
      return `${timestamp} [${level}]: ${message}\n${stack}`;
    }
    return `${timestamp} [${level}]: ${message}`;
  })
);

// File format (structured JSON)
const fileFormat = combine(
  timestamp(),
  errors({ stack: true }),
  splat(),
  json() // Log as JSON
);

// Create a logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info", // Default to 'info'
  transports: [
    // Log to console (pretty-printed)
    new winston.transports.Console({
      format: consoleFormat,
    }),
    // Log errors to a file (structured JSON)
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: fileFormat,
    }),
    // Log all messages to a file (structured JSON)
    new winston.transports.File({
      filename: "logs/combined.log",
      format: fileFormat,
    }),
  ],
});

// Handle uncaught exceptions and promise rejections
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "Reason:", reason);
  process.exit(1);
});

module.exports = logger;
