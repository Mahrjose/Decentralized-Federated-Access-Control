const express = require("express");
const policyController = require("../controllers/policyController");
const logger = require("../config/logger");
const dotenv = require("dotenv");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const { fetchAndSaveContext } = require("../middleware/fetchAndSaveContext");

dotenv.config();
const router = express.Router();

// Log incoming requests
router.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// ========= Policy Routes ==========

router.get(
  "/fetch",
  // isAuthenticatedUser,
  // authorizeRoles("admin", "manager"),
  //fetchAndSaveContext,
  policyController.fetchAllPolicies
);

router.get(
  "/fetch/:policyID",
  // isAuthenticatedUser,
  // authorizeRoles("admin", "manager"),
  //fetchAndSaveContext,
  policyController.fetchSinglePolicy
);

router.post(
  "/register",
  // isAuthenticatedUser,
  // authorizeRoles("admin", "manager"),
  //fetchAndSaveContext,
  policyController.registerPolicy
);

router.put(
  "/update/:policyID",
  // isAuthenticatedUser,
  // authorizeRoles("admin", "manager"),
  //fetchAndSaveContext,
  policyController.updatePolicy
);

router.delete(
  "/delete/:policyID",
  // isAuthenticatedUser,
  // authorizeRoles("admin", "manager"),
  //fetchAndSaveContext,
  policyController.deletePolicy
);

// ========= Propagation Routes ==========

if (process.env.DECENTRALIZATION === "true") {
  router.post(
    "/propagate/global/push",
    // isAuthenticatedUser,
    // authorizeRoles("admin"),
    fetchAndSaveContext,
    policyController.propagateGlobalPolicies
  );

  router.post(
    "/propagate/global/fetch",
    // isAuthenticatedUser,
    // authorizeRoles("admin"),
    fetchAndSaveContext,
    policyController.fetchAndSaveGlobalPolicies
  );

  router.put(
    "/propagate/global/update",
    // isAuthenticatedUser,
    // authorizeRoles("admin"),
    // fetchAndSaveContext,
    policyController.propagateGlobalPolicyUpdate
  );

  router.delete(
    "/propagate/global/delete",
    // isAuthenticatedUser,
    // authorizeRoles("admin"),
    // fetchAndSaveContext,
    policyController.propagateGlobalPolicyDelete
  );

  router.post(
    "/propagate/regional/push",
    // isAuthenticatedUser,
    // authorizeRoles("admin", "manager"),
    policyController.propagateRegionalPolicies
  );

  router.post(
    "/propagate/regional/fetch",
    // isAuthenticatedUser,
    // authorizeRoles("admin", "manager"),
    policyController.fetchAndSaveRegionalPolicies
  );

  router.put(
    "/propagate/regional/update",
    // isAuthenticatedUser,
    // authorizeRoles("admin"),
    policyController.propagateRegionalPolicyUpdate
  );

  router.delete(
    "/propagate/regional/delete",
    // isAuthenticatedUser,
    // authorizeRoles("admin"),
    policyController.propagateRegionalPolicyDelete
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
