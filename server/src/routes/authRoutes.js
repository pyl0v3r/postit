const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const loginRateLimiter = require('../middleware/loginRateLimiter');

router.post('/register', authController.register);
router.post('/login', loginRateLimiter, authController.login);
router.get('/:userId', authController.getCurrentUser);

module.exports = router;
