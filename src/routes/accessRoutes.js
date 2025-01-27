const express = require("express");
const accessController = require("../controllers/accessController");
const logger = require("../config/logger");
const { fetchAndSaveContext } = require("../middleware/fetchAndSaveContext");

const router = express.Router();

// Log incoming requests
router.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

router.post("/evaluate", fetchAndSaveContext, accessController.evaluatePolicy);

// Error handling middleware
router.use((err, req, res, next) => {
  logger.error(`Error in accessRoutes: ${err.message}`);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = router;
