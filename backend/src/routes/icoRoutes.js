const express = require('express');
const router = express.Router();
const {
  getPublicIcoPrice,
  getIcoSummary,
  listIcoTransactions,
  initiateIcoBuy,
  requestIcoSell,
} = require('../controllers/icoController');
const { protect } = require('../middleware/authMiddleware');

router.get('/price', getPublicIcoPrice);

router.use(protect);

router.get('/summary', getIcoSummary);
router.get('/transactions', listIcoTransactions);
router.post('/buy', initiateIcoBuy);
router.post('/sell', requestIcoSell);

module.exports = router;
