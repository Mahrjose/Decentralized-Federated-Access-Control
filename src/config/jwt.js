const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const logger = require("./logger");

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h"; // Default to 1 hour

if (!JWT_SECRET) {
  logger.error("JWT_SECRET is not defined in the environment variables.");
  throw new Error("JWT_SECRET is required");
}

// Generate a JWT token
const generateToken = (payload) => {
  try {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  } catch (err) {
    logger.error("Error generating JWT token:", err.message);
    throw new Error("Failed to generate token");
  }
};

// Verify a JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    logger.error("Error verifying JWT token:", err.message);
    throw new Error("Invalid or expired token");
  }
};

module.exports = { generateToken, verifyToken };
