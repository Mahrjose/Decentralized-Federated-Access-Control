const express = require("express");
const accessController = require("../controllers/accessController");

const router = express.Router();

router.post("/check", accessController.checkAccess);
router.post("/evaluate", accessController.evaluatePolicy);

module.exports = router;
