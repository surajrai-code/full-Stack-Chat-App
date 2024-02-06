const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/register', authController.register);
router.get('/users', authController.getAllUsers);

router.get('/profile', authMiddleware.getUserDataFromRequest, authController.profile);

module.exports = router;
