const Order = require('../models/Order');
const IcoTransaction = require('../models/IcoTransaction');
const IcoHolding = require('../models/IcoHolding');
const WalletTransaction = require('../models/WalletTransaction');
const WalletAccount = require('../models/WalletAccount');
const { distributeReferralCommission } = require('../utils/referralService');
const { verifySignature: verifyRazorpaySignature } = require('../utils/razorpay');

const PHONEPE_SUCCESS_CODES = ['PAYMENT_SUCCESS', 'SUCCESS'];

const handlePhonePeCallback = async (req, res) => {
  try {
    const payload = req.body?.data || req.body;
    const merchantTransactionId = payload?.merchantTransactionId || payload?.orderId;
    const transactionId = payload?.transactionId;
    const code = payload?.code;
    const status = PHONEPE_SUCCESS_CODES.includes(code) ? 'paid' : 'failed';

    if (!merchantTransactionId) {
      return res.status(400).json({ message: 'merchantTransactionId missing' });
    }

    let handled = false;

    const order = await Order.findById(merchantTransactionId);
    if (order) {
      order.paymentStatus = status === 'paid' ? 'paid' : 'failed';
      order.status = status === 'paid' ? 'confirmed' : 'pending';
      order.phonePePaymentLink = undefined;
      order.phonePePayload = undefined;
      await order.save();
      handled = true;

      if (status === 'paid') {
        const orderAmount = order.totals?.grandTotal || order.totals?.subtotal || 0;
        await distributeReferralCommission({
          buyerId: order.user,
          amount: orderAmount,
          sourceType: 'order',
          sourceId: order._id.toString(),
        });
      }
    }

    if (!handled) {
      const transaction = await IcoTransaction.findById(merchantTransactionId);
      if (transaction) {
        transaction.status = status === 'paid' ? 'completed' : 'failed';
        transaction.phonePeTransactionId = transactionId;
        await transaction.save();

        if (status === 'paid' && transaction.type === 'buy') {
          const holding = await IcoHolding.findOneAndUpdate(
            { user: transaction.user },
            { $inc: { balance: transaction.tokenAmount } },
            { new: true, upsert: true },
          );
          await distributeReferralCommission({
            buyerId: transaction.user,
            amount: transaction.fiatAmount,
            sourceType: 'ico',
            sourceId: transaction._id.toString(),
          });
          handled = true;
          console.log('ICO holding updated', holding.balance);
        } else if (status !== 'paid' && transaction.type === 'buy') {
          console.log('ICO transaction failed');
        }
      }
    }

    if (!handled) {
      const walletTransaction = await WalletTransaction.findById(merchantTransactionId);
      if (walletTransaction) {
        handled = true;
        walletTransaction.status = status === 'paid' ? 'completed' : 'failed';
        walletTransaction.phonePeTransactionId = transactionId;
        walletTransaction.phonePeResponse = payload;
        await walletTransaction.save();

        if (status === 'paid' && walletTransaction.type === 'credit') {
          const walletQuery = walletTransaction.wallet
            ? { _id: walletTransaction.wallet }
            : { user: walletTransaction.user };

          await WalletAccount.findOneAndUpdate(
            walletQuery,
            {
              $inc: {
                balance: walletTransaction.amount,
                totalCredited: walletTransaction.amount,
              },
              $setOnInsert: { user: walletTransaction.user },
            },
            { upsert: true, setDefaultsOnInsert: true },
          );
        }
      }
    }

    res.json({ handled, merchantTransactionId, code: status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const handleRazorpayVerify = async (req, res) => {
  try {
    const { orderId, paymentId, signature, transactionId } = req.body || {};
    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ message: 'orderId, paymentId and signature are required' });
    }

    const valid = verifyRazorpaySignature({ orderId, paymentId, signature });
    if (!valid) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const transaction = await IcoTransaction.findOne(
      transactionId ? { _id: transactionId } : { paymentReference: orderId },
    );
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    transaction.status = 'completed';
    transaction.paymentReference = orderId;
    transaction.phonePeTransactionId = paymentId; // reuse field for tracking
    await transaction.save();

    if (transaction.type === 'buy') {
      const holding = await IcoHolding.findOneAndUpdate(
        { user: transaction.user },
        { $inc: { balance: transaction.tokenAmount } },
        { new: true, upsert: true },
      );
      await distributeReferralCommission({
        buyerId: transaction.user,
        amount: transaction.fiatAmount,
        sourceType: 'ico',
        sourceId: transaction._id.toString(),
      });
      return res.json({ status: 'success', transactionId: transaction._id, holding });
    }

    res.json({ status: 'success', transactionId: transaction._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  handlePhonePeCallback,
  handleRazorpayVerify,
};
