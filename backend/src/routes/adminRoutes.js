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
} = require('../controllers/adminUserController');
const { adminReviewKyc, getKycDetailAdmin } = require('../controllers/kycController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

router.use(protect, requireAdmin);

// Admin overview
router.get('/stats', getAdminStats);

// Users & KYC
router.get('/users', listUsers);
router.get('/users/:id', getUserDetail);
router.get('/kyc', listKycApplications);
router.get('/kyc/:kycId', getKycDetailAdmin);
router.patch('/kyc/:kycId/status', adminReviewKyc);
router.get('/ico/transactions', listIcoTransactions);
router.get('/referrals/earnings', listReferralEarningsAdmin);

router.get('/categories', listCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

router.get('/products', listProductsAdmin);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

module.exports = router;
