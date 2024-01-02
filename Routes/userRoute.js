// lawyer/src/routes/authRoute.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/user'); // Corrected import

router.post('/login', authController.loginUser);
router.post('/register', authController.registerUser);

router.post('/verify-email', authController.verifyEmail);

module.exports = router;
