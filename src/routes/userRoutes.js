const express = require("express");
const logger = require("../config/logger");

const userController = require("../controllers/userController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const { fetchContext } = require("../middleware/extractContext");

const router = express.Router();

// Log incoming requests
router.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Routes
router.post("/login", fetchContext, userController.login);
router.get("/logout", isAuthenticatedUser, userController.logout);

router.get(
  "/fetch",
  isAuthenticatedUser,
  authorizeRoles("admin", "manager"),
  userController.fetchAllUsers
);
router.get(
  "/fetch/:userID",
  isAuthenticatedUser,
  authorizeRoles("admin", "manager"),
  userController.fetchSingleUser
);

router.post(
  "/create",
  isAuthenticatedUser,
  authorizeRoles("admin", "manager"),
  userController.createUser
);
router.put(
  "/update/:userID",
  isAuthenticatedUser,
  authorizeRoles("admin", "manager"),
  userController.updateUser
);

router.delete(
  "/delete/:userID",
  isAuthenticatedUser,
  authorizeRoles("admin", "manager"),
  userController.deleteUser
);

// Error handling middleware
router.use((err, req, res, next) => {
  logger.error(`Error in userRoutes: ${err.message}`);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = router;
