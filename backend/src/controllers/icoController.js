const IcoHolding = require('../models/IcoHolding');
const IcoTransaction = require('../models/IcoTransaction');
const WalletTransaction = require('../models/WalletTransaction');
const { createPhonePePaymentPayload } = require('../utils/phonePe');
const { getOrCreateWalletAccount } = require('../utils/walletAccount');
const { distributeReferralCommission } = require('../utils/referralService');
const { createOrder: createRazorpayOrder, RAZORPAY_KEY_ID } = require('../utils/razorpay');

const getTokenPrice = () => {
  const price = Number(process.env.ICO_PRICE_INR || process.env.ICO_TOKEN_PRICE_INR || 10);
  if (Number.isNaN(price) || price <= 0) {
    return 10;
  }
  return price;
};

const getTokenSymbol = () => process.env.ICO_TOKEN_SYMBOL || 'ICOX';

const getHolding = async (userId) => {
  const holding = await IcoHolding.findOne({ user: userId });
  return holding || { balance: 0 };
};

const getPublicIcoPrice = async (req, res) => {
  try {
    res.json({
      tokenSymbol: getTokenSymbol(),
      price: getTokenPrice(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getIcoSummary = async (req, res) => {
  try {
    const holding = await getHolding(req.user._id);
    const price = getTokenPrice();
    res.json({
      tokenSymbol: getTokenSymbol(),
      price,
      balance: holding.balance,
      valuation: holding.balance * price,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const listIcoTransactions = async (req, res) => {
  try {
    const transactions = await IcoTransaction.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const initiateIcoBuy = async (req, res) => {
  const { tokenAmount, fiatAmount, useWallet, paymentMethod } = req.body;
  const price = getTokenPrice();
  const tokenSymbol = getTokenSymbol();

  if (!tokenAmount && !fiatAmount) {
    return res.status(400).json({ message: 'tokenAmount or fiatAmount is required' });
  }

  const tokens = tokenAmount ? Number(tokenAmount) : Number(fiatAmount) / price;
  const amount = fiatAmount ? Number(fiatAmount) : tokens * price;

  if (Number.isNaN(tokens) || Number.isNaN(amount) || tokens <= 0 || amount <= 0) {
    return res.status(400).json({ message: 'Invalid purchase amount' });
  }

  const method = (paymentMethod || '').toLowerCase();
  const payWithWallet = useWallet === true || method === 'wallet';
  const payWithRazorpay = method === 'razorpay';

  try {
    if (payWithWallet) {
      const wallet = await getOrCreateWalletAccount(req.user._id);
      if (wallet.balance < amount) {
        return res.status(400).json({ message: 'Insufficient wallet balance' });
      }

      wallet.balance -= amount;
      wallet.totalDebited += amount;
      await wallet.save();

      const transaction = await IcoTransaction.create({
        user: req.user._id,
        type: 'buy',
        tokenAmount: tokens,
        pricePerToken: price,
        fiatAmount: amount,
        status: 'completed',
        paymentReference: 'wallet',
      });

      const holding = await IcoHolding.findOneAndUpdate(
        { user: req.user._id },
        { $inc: { balance: tokens } },
        { new: true, upsert: true },
      );

      const walletTx = await WalletTransaction.create({
        user: req.user._id,
        wallet: wallet._id,
        type: 'debit',
        category: 'purchase',
        amount,
        currency: wallet.currency,
        status: 'completed',
        description: `Wallet purchase of ${tokens} ${tokenSymbol} tokens`,
        metadata: {
          tokenAmount: tokens,
          pricePerToken: price,
          tokenSymbol,
          icoTransactionId: transaction._id,
        },
      });

      transaction.paymentReference = walletTx._id.toString();
      await transaction.save();

      await distributeReferralCommission({
        buyerId: req.user._id,
        amount,
        sourceType: 'ico',
        sourceId: transaction._id.toString(),
      });

      return res.status(201).json({
        transaction,
        wallet: {
          balance: wallet.balance,
          currency: wallet.currency,
        },
        holding: {
          balance: holding.balance,
          tokenSymbol,
          valuation: holding.balance * price,
        },
        referral: {
          credited: true,
        },
      });
    }

    if (payWithRazorpay) {
      const transaction = await IcoTransaction.create({
        user: req.user._id,
        type: 'buy',
        tokenAmount: tokens,
        pricePerToken: price,
        fiatAmount: amount,
        status: 'initiated',
      });

      const order = await createRazorpayOrder({
        amount,
        currency: 'INR',
        receipt: transaction._id.toString(),
        notes: {
          userId: req.user._id.toString(),
          tokenAmount: tokens,
          tokenSymbol,
        },
      });

      transaction.paymentReference = order.id || transaction._id.toString();
      await transaction.save();

      return res.status(201).json({
        transaction,
        paymentGateway: 'razorpay',
        razorpay: {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          keyId: RAZORPAY_KEY_ID,
          notes: order.notes,
          mock: order.mock || false,
        },
      });
    }

    const transaction = await IcoTransaction.create({
      user: req.user._id,
      type: 'buy',
      tokenAmount: tokens,
      pricePerToken: price,
      fiatAmount: amount,
      status: 'initiated',
    });

    const session = createPhonePePaymentPayload({
      amount,
      orderId: transaction._id.toString(),
      merchantUserId: req.user._id.toString(),
      callbackUrl: process.env.PHONEPE_CALLBACK_URL || 'https://your-domain.com/api/payments/phonepe/callback',
    });

    transaction.paymentReference = session.payload?.merchantTransactionId || transaction._id.toString();
    await transaction.save();

    res.status(201).json({
      transaction,
      paymentSession: {
        endpoint: session.endpoint,
        request: session.payloadBase64,
        checksum: session.checksum,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const requestIcoSell = async (req, res) => {
  const { tokenAmount } = req.body;

  if (!tokenAmount || Number(tokenAmount) <= 0) {
    return res.status(400).json({ message: 'Token amount is required' });
  }

  const tokens = Number(tokenAmount);

  try {
    const holding = await IcoHolding.findOne({ user: req.user._id });
    if (!holding || holding.balance < tokens) {
      return res.status(400).json({ message: 'Insufficient token balance' });
    }

    const price = getTokenPrice();
    const fiatAmount = tokens * price;

    const transaction = await IcoTransaction.create({
      user: req.user._id,
      type: 'sell',
      tokenAmount: tokens,
      pricePerToken: price,
      fiatAmount,
      status: 'pending',
    });

    holding.balance -= tokens;
    await holding.save();

    res.status(201).json({
      transaction,
      payoutNote: 'Admin needs to process payout manually or via PhonePe Payouts.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPublicIcoPrice,
  getIcoSummary,
  listIcoTransactions,
  initiateIcoBuy,
  requestIcoSell,
};
