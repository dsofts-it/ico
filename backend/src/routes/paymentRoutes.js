const express = require('express');
const router = express.Router();
const { handlePhonePeCallback } = require('../controllers/paymentController');

router.post('/phonepe/callback', handlePhonePeCallback);

module.exports = router;
