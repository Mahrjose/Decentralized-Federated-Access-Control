const express = require("express");
const userController = require("../controllers/userController");
const logger = require("../config/logger");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// Log incoming requests
router.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Routes
router.post("/login", userController.login);
router.get("/logout", isAuthenticatedUser, userController.logout);
router.get("/checkuser", isAuthenticatedUser, userController.checkUser);

router.get("/", isAuthenticatedUser, authorizeRoles("admin", "manager"), userController.listUsers);
router.get("/:userID", userController.getUser);

router.post("/", userController.createUser);
router.put("/:userID", userController.updateUser);

router.delete("/:userID", userController.deleteUser);

// Error handling middleware
router.use((err, req, res, next) => {
  logger.error(`Error in userRoutes: ${err.message}`);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = router;
