const express = require('express');
const router = express.Router();
const {
  createCategory,
  updateCategory,
  deleteCategory,
  listCategories,
  listProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/adminController');
const {
  listUsers,
  getUserDetail,
  listKycApplications,
  getAdminStats,
  listIcoTransactions,
  listReferralEarningsAdmin,
  updateUserStatus,
  updateUserEmail,
  updateUserPin,
  updateReferralEarningStatus,
  listBankChangeRequests,
  reviewBankChangeRequest,
  listMobileChangeRequests,
  reviewMobileChangeRequest,
  getReferralTreeAdmin,
} = require('../controllers/adminUserController');
const { adminReviewKyc, getKycDetailAdmin } = require('../controllers/kycController');
const {
  listNotificationsAdmin,
  createNotificationAdmin,
} = require('../controllers/notificationController');
const {
  adminListWalletTransactions,
  adminUpdateWalletTransaction,
} = require('../controllers/walletController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

router.use(protect, requireAdmin);

// Admin overview
router.get('/stats', getAdminStats);

// Users & KYC
router.get('/users', listUsers);
router.get('/users/:id', getUserDetail);
router.patch('/users/:id/status', updateUserStatus);
router.patch('/users/:id/email', updateUserEmail);
router.patch('/users/:id/pin', updateUserPin);
router.get('/kyc', listKycApplications);
router.get('/kyc/:kycId', getKycDetailAdmin);
router.patch('/kyc/:kycId/status', adminReviewKyc);
router.get('/ico/transactions', listIcoTransactions);
router.get('/referrals/earnings', listReferralEarningsAdmin);
router.patch('/referrals/earnings/:id', updateReferralEarningStatus);
router.get('/referrals/tree/:userId', getReferralTreeAdmin);

router.get('/bank/requests', listBankChangeRequests);
router.patch('/bank/requests/:id', reviewBankChangeRequest);
router.get('/mobile/requests', listMobileChangeRequests);
router.patch('/mobile/requests/:id', reviewMobileChangeRequest);

router.get('/wallet/transactions', adminListWalletTransactions);
router.patch('/wallet/transactions/:transactionId', adminUpdateWalletTransaction);

router.get('/notifications', listNotificationsAdmin);
router.post('/notifications', createNotificationAdmin);

router.get('/categories', listCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

router.get('/products', listProductsAdmin);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

module.exports = router;
