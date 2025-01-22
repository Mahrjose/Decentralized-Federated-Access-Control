const express = require("express");
const policyController = require("../controllers/policyController");
const logger = require("../config/logger");

const router = express.Router();

// Log incoming requests
router.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

router.get("/", policyController.listPolicies);
router.get("/:policyID", policyController.getPolicy);
router.post("/", policyController.createPolicy);
router.put("/:policyID", policyController.updatePolicy);
router.delete("/:policyID", policyController.deletePolicy);

// Error handling middleware
router.use((err, req, res, next) => {
  logger.error(`Error in policyRoutes: ${err.message}`);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = router;
