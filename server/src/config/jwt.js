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
const jwt = require("jsonwebtoken");

const generateToken = (payload) => {
  try {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  } catch (err) {
    console.error("Error generating JWT token:", err.message);
    throw new Error("Failed to generate token");
  }
};

const setToken = (user, res) => {
  const token = generateToken({ id: user.id });

  const isProduction = process.env.NODE_ENV === "PRODUCTION";

  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    expires: new Date(Date.now() + parseInt(process.env.COOKIE_EXPIRE) * 24 * 60 * 60 * 1000),
  });
};

module.exports = setToken;
