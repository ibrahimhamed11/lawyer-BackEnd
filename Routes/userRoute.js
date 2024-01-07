const express = require('express');
const router = express.Router();
const authController = require('../Controllers/user'); 
const authMiddleware = require('../middleware/authMiddleware');

// Existing endpoints
router.post('/login', authController.loginUser);
router.post('/register', authController.registerUser);
router.post('/verify-email', authController.verifyEmail);

// New endpoints for password reset
router.post('/forgot-password', authController.forgotPassword); 
router.post('/send-reset-otp', authController.sendResetOTP); 
router.post('/verify-otp', authController.verifyOTP);


router.get('/user-info', authMiddleware, authController.getUserInfo); 
router.put('/update-user', authMiddleware, authController.updateUserInfo); 

module.exports = router;
