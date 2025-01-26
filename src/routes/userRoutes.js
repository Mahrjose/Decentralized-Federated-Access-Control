const express = require("express");
const logger = require("../config/logger");

const userController = require("../controllers/userController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const { fetchContext } = require("../middleware/extractContext");
const { fetchAndSaveContext } = require("../middleware/fetchAndSaveContext");

const router = express.Router();

// Log incoming requests
router.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Routes
router.post("/login", fetchContext, userController.login);
router.get(
  "/logout",
  isAuthenticatedUser,
  fetchAndSaveContext,
  userController.logout
);

router.get(
  "/fetch",
  isAuthenticatedUser,
  authorizeRoles("admin", "manager"),
  fetchAndSaveContext,
  userController.fetchAllUsers
);
router.get(
  "/fetch/:userID",
  isAuthenticatedUser,
  authorizeRoles("admin", "manager"),
  fetchAndSaveContext,
  userController.fetchSingleUser
);

router.post(
  "/register",
  isAuthenticatedUser,
  authorizeRoles("admin", "manager"),
  fetchAndSaveContext,
  userController.registerUser
);
router.put(
  "/update/:userID",
  isAuthenticatedUser,
  authorizeRoles("admin", "manager"),
  fetchAndSaveContext,
  userController.updateUser
);

router.delete(
  "/delete/:userID",
  isAuthenticatedUser,
  authorizeRoles("admin", "manager"),
  fetchAndSaveContext,
  userController.deleteUser
);

// Error handling middleware
router.use((err, req, res, next) => {
  logger.error(`Error in userRoutes: ${err.message}`);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = router;
