const express = require('express');
const router = express.Router();
const {
  getWalletSummary,
  listWalletTransactions,
  initiateWalletTopup,
  requestWalletWithdrawal,
  redeemReferralEarnings,
  adminListWalletTransactions,
  adminUpdateWalletTransaction,
} = require('../controllers/walletController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/summary', getWalletSummary);
router.get('/transactions', listWalletTransactions);
router.post('/topup', initiateWalletTopup);
router.post('/withdraw', requestWalletWithdrawal);
router.post('/referral/redeem', redeemReferralEarnings);

router.get('/admin/transactions', requireAdmin, adminListWalletTransactions);
router.patch('/admin/transactions/:transactionId', requireAdmin, adminUpdateWalletTransaction);

module.exports = router;
