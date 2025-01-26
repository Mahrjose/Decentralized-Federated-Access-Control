const express = require("express");
const policyController = require("../controllers/policyController");
const logger = require("../config/logger");
const dotenv = require("dotenv");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

dotenv.config();
const router = express.Router();

// Log incoming requests
router.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// ========= Policy Routes ==========

router.get(
  "/",
  // isAuthenticatedUser,
  // authorizeRoles("admin", "manager"),
  policyController.listPolicies
);
router.get(
  "/:policyID",
  // isAuthenticatedUser,
  // authorizeRoles("admin", "manager"),
  policyController.getPolicy
);
router.post(
  "/",
  // isAuthenticatedUser,
  // authorizeRoles("admin", "manager"),
  policyController.createPolicy
);
router.put(
  "/:policyID",
  // isAuthenticatedUser,
  // authorizeRoles("admin", "manager"),
  policyController.updatePolicy
);
router.delete(
  "/:policyID",
  // isAuthenticatedUser,
  // authorizeRoles("admin", "manager"),
  policyController.deletePolicy
);

// ========= Propagation Routes ==========

if (process.env.DECENTRALIZATION === "true") {
  router.post(
    "/propagate/global",
    // isAuthenticatedUser,
    // authorizeRoles("admin"),
    policyController.propagateGlobalPolicies
  );

  router.post(
    "/propagate/global/fetch",
    policyController.fetchAndSaveGlobalPolicies
  );

  router.post(
    "/propagate/regional/push",
    // isAuthenticatedUser,
    // authorizeRoles("admin", "manager"),
    policyController.propagateRegionalPolicies
  );

  router.post(
    "/propagate/regional/pull",
    // isAuthenticatedUser,
    // authorizeRoles("admin", "manager"),
    policyController.fetchAndSaveRegionalPolicies
  );
} else {
  logger.info("Decentralization is disabled, Propagation routes are inactive.");
}

// Error handling middleware
router.use((err, req, res, next) => {
  logger.error(`Error in policyRoutes: ${err.message}`);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = router;
