const express = require("express");
const policyController = require("../controllers/policyController");

const router = express.Router();

router.get("/", policyController.listPolicies);
router.get("/:policyID", policyController.getPolicy);

router.post("/", policyController.createPolicy);
router.put("/:policyID", policyController.updatePolicy);

router.delete("/:policyID", policyController.deletePolicy);

module.exports = router;
