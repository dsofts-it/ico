const express = require('express');
const router = express.Router();
const { handlePhonePeCallback, handleRazorpayVerify } = require('../controllers/paymentController');

router.post('/phonepe/callback', handlePhonePeCallback);
router.post('/razorpay/verify', handleRazorpayVerify);

module.exports = router;
