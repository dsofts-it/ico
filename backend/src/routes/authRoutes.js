const express = require('express');
const router = express.Router();
const {
  signupEmailInit,
  signupMobileInit,
  verifyOTP,
  setupPIN,
  loginEmail,
  loginMobileInit,
  loginMobileVerify,
  loginPIN,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Signup
router.post('/signup/email-init', signupEmailInit);
router.post('/signup/mobile-init', signupMobileInit);
router.post('/signup/verify', verifyOTP);

// PIN Setup
router.post('/pin/setup', protect, setupPIN);

// Login
router.post('/login/email', loginEmail);
router.post('/login/mobile-init', loginMobileInit);
router.post('/login/mobile-verify', loginMobileVerify);
router.post('/login/pin', loginPIN);

module.exports = router;
