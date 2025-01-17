const express = require("express");
const userController = require("../controllers/userController");

const router = express.Router();

router.get("/", userController.listUsers);
router.get("/:userID", userController.getUser);

router.post("/", userController.createUser);
router.put("/:userID", userController.updateUser);

router.delete("/:userID", userController.deleteUser);

module.exports = router;
