const express = require("express");
const logger = require("../config/logger");
const dotenv = require("dotenv");

const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const { fetchAndSaveContext } = require("../middleware/fetchAndSaveContext");

const modelController = require("../controllers/modelController");

const router = express.Router();

// Log incoming requests
router.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

router.post("/train", modelController.train);
router.post("/use", modelController.use);

// Error handling middleware
router.use((err, req, res, next) => {
  logger.error(`Error in userRoutes: ${err.message}`);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = router;
