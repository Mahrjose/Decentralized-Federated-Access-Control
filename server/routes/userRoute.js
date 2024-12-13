const express = require('express');
const { create, get, getAll, updatePassword, login, logout } = require('../controllers/userController');

const router = express.Router();

router.post('/register', create);
router.get('/get', get);
router.get('/get/all', getAll);
router.patch('/update/password', updatePassword);
router.post('/login', login);
router.post('/logout', logout);

module.exports = router;