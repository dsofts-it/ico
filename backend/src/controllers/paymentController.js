const Order = require('../models/Order');
const IcoTransaction = require('../models/IcoTransaction');
const IcoHolding = require('../models/IcoHolding');

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
          handled = true;
          console.log('ICO holding updated', holding.balance);
        } else if (status !== 'paid' && transaction.type === 'buy') {
          console.log('ICO transaction failed');
        }
      }
    }

    res.json({ handled, merchantTransactionId, code: status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  handlePhonePeCallback,
};
