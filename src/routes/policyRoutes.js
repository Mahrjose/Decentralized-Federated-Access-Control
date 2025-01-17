const express = require('express');
const { addPolicy, evaluatePolicy } = require('../controllers/policyController');

const router = express.Router();

router.post('/', addPolicy);
router.post('/evaluate', evaluatePolicy);

module.exports = router;
