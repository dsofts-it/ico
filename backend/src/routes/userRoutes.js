const express = require('express');
const {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getReferralSummary,
  listReferralEarnings,
  getReferralCode,
  listReferralDownline,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/addresses', getAddresses);
router.post('/addresses', addAddress);
router.put('/addresses/:addressId', updateAddress);
router.delete('/addresses/:addressId', deleteAddress);
router.patch('/addresses/:addressId/default', setDefaultAddress);
router.get('/referral/summary', getReferralSummary);
router.get('/referral/earnings', listReferralEarnings);
router.get('/referral/code', getReferralCode);
router.get('/referral/downline', listReferralDownline);

module.exports = router;
