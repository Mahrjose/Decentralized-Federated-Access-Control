const express = require('express');
const { createUser, getUsers } = require('../controllers/userController'); // Ensure this imports correctly

const router = express.Router();

// POST route to create a user
router.post('/', createUser);

// GET route to fetch all users
router.get('/', getUsers);

module.exports = router;
