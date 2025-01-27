const winston = require("winston");

const dotenv = require("dotenv");
dotenv.config();

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.colorize(),
    winston.format.printf(
      ({ timestamp, level, message, stack, ...metadata }) => {
        let logMessage = `${timestamp} [${level}]: ${message}`;

        // If metadata has additional properties, append them to the log message
        if (Object.keys(metadata).length > 0) {
          logMessage += ` ${JSON.stringify(metadata)}`;
        }

        // If stack trace exists, append it
        if (stack) {
          logMessage += `\n${stack}`;
        }

        return logMessage;
      }
    )
  ),
  transports: [new winston.transports.Console()],
});

// Patch the logger to handle multiple arguments
const originalError = logger.error;
logger.error = function (...args) {
  const errorParts = args.map((arg) =>
    typeof arg === "object" ? JSON.stringify(arg) : arg
  );
  originalError.call(logger, errorParts.join(" "));
};

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
