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
router.get("/", isAuthenticatedUser, authorizeRoles("admin"), userController.listUsers); //change the role accordingly can be added multiple roles ("user", "admin")
router.get("/:userID", userController.getUser);
router.post("/", userController.createUser);
router.put("/:userID", userController.updateUser);
router.delete("/:userID", userController.deleteUser);
router.post("/login", userController.login)
router.get("/signout", userController.logout);
router.get("/check", isAuthenticatedUser, userController.checkUser);

// Error handling middleware
router.use((err, req, res, next) => {
  logger.error(`Error in userRoutes: ${err.message}`);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = router;
