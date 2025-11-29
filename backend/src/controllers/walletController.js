const mongoose = require('mongoose');
const WalletAccount = require('../models/WalletAccount');
const WalletTransaction = require('../models/WalletTransaction');
const { createPhonePePaymentPayload } = require('../utils/phonePe');
const { getOrCreateWalletAccount } = require('../utils/walletAccount');

const CALLBACK_URL = process.env.PHONEPE_CALLBACK_URL || 'https://your-domain.com/api/payments/phonepe/callback';
const MIN_TOPUP_AMOUNT = Number(process.env.WALLET_MIN_TOPUP_AMOUNT || 10);
const MAX_TOPUP_AMOUNT = Number(process.env.WALLET_MAX_TOPUP_AMOUNT || 200000);
const MIN_WITHDRAW_AMOUNT = Number(process.env.WALLET_MIN_WITHDRAW_AMOUNT || 100);
const WALLET_TRANSACTION_STATUSES = ['initiated', 'pending', 'completed', 'failed', 'cancelled'];

const sanitizeTransaction = (transaction) => {
  if (!transaction) {
    return transaction;
  }
  const doc = transaction.toObject ? transaction.toObject() : transaction;
  delete doc.phonePePayload;
  delete doc.phonePeResponse;
  return doc;
};

const getWalletSummary = async (req, res) => {
  try {
    const wallet = await getOrCreateWalletAccount(req.user._id);
    const userObjectId = new mongoose.Types.ObjectId(req.user._id);

    const [pendingTopups] = await WalletTransaction.aggregate([
      {
        $match: {
          user: userObjectId,
          category: 'topup',
          status: { $in: ['initiated', 'pending'] },
        },
      },
      {
        $group: {
          _id: null,
          amount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const recentTransactions = await WalletTransaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      wallet: {
        balance: wallet.balance,
        currency: wallet.currency,
        pendingWithdrawals: wallet.pendingWithdrawals,
        totalCredited: wallet.totalCredited,
        totalDebited: wallet.totalDebited,
        updatedAt: wallet.updatedAt,
      },
      pendingTopups: pendingTopups?.amount || 0,
      pendingTopupCount: pendingTopups?.count || 0,
      recentTransactions: recentTransactions.map(sanitizeTransaction),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const listWalletTransactions = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    const filter = { user: req.user._id };
    if (req.query.status) {
      if (!WALLET_TRANSACTION_STATUSES.includes(req.query.status)) {
        return res.status(400).json({ message: 'Invalid status filter' });
      }
      filter.status = req.query.status;
    }
    if (req.query.type) {
      filter.type = req.query.type;
    }
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const [transactions, total] = await Promise.all([
      WalletTransaction.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      WalletTransaction.countDocuments(filter),
    ]);

    res.json({
      transactions: transactions.map(sanitizeTransaction),
      pagination: {
        total,
        page,
        limit,
        hasMore: skip + transactions.length < total,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const initiateWalletTopup = async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'A valid amount is required' });
    }

    if (amount < MIN_TOPUP_AMOUNT) {
      return res.status(400).json({ message: `Minimum top-up amount is INR ${MIN_TOPUP_AMOUNT}` });
    }

    if (amount > MAX_TOPUP_AMOUNT) {
      return res.status(400).json({ message: `Maximum top-up amount is INR ${MAX_TOPUP_AMOUNT}` });
    }

    const wallet = await getOrCreateWalletAccount(req.user._id);

    const transaction = await WalletTransaction.create({
      user: req.user._id,
      wallet: wallet._id,
      type: 'credit',
      category: 'topup',
      amount,
      currency: wallet.currency,
      status: 'initiated',
      description: req.body.note?.trim() || `Wallet top-up of INR ${amount}`,
      paymentGateway: 'phonepe',
      metadata: {
        note: req.body.note?.trim(),
        paymentInstrument: req.body.paymentInstrument,
      },
    });

    const session = createPhonePePaymentPayload({
      amount,
      orderId: transaction._id.toString(),
      merchantUserId: req.user._id.toString(),
      callbackUrl: CALLBACK_URL,
      redirectUrl: req.body.redirectUrl,
      paymentInstrument: req.body.paymentInstrument,
    });

    transaction.merchantTransactionId = session.payload?.merchantTransactionId || transaction._id.toString();
    transaction.phonePePayload = {
      endpoint: session.endpoint,
      payload: session.payload,
      payloadBase64: session.payloadBase64,
      checksum: session.checksum,
    };
    await transaction.save();

    const transactionJson = sanitizeTransaction(transaction);

    res.status(201).json({
      wallet: {
        balance: wallet.balance,
        currency: wallet.currency,
        pendingWithdrawals: wallet.pendingWithdrawals,
      },
      transaction: transactionJson,
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

const requestWalletWithdrawal = async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'A valid amount is required' });
    }

    if (amount < MIN_WITHDRAW_AMOUNT) {
      return res.status(400).json({ message: `Minimum withdrawal amount is INR ${MIN_WITHDRAW_AMOUNT}` });
    }

    const wallet = await getOrCreateWalletAccount(req.user._id);
    if (wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    wallet.balance -= amount;
    wallet.pendingWithdrawals += amount;
    await wallet.save();

    const transaction = await WalletTransaction.create({
      user: req.user._id,
      wallet: wallet._id,
      type: 'debit',
      category: 'withdrawal',
      amount,
      currency: wallet.currency,
      status: 'pending',
      description: req.body.note?.trim() || `Withdrawal request of INR ${amount}`,
      metadata: {
        payoutMethod: req.body.payoutMethod || 'manual',
        payoutDetails: req.body.payoutDetails,
        note: req.body.note?.trim(),
      },
    });

    res.status(201).json({
      wallet: {
        balance: wallet.balance,
        pendingWithdrawals: wallet.pendingWithdrawals,
        currency: wallet.currency,
      },
      transaction: sanitizeTransaction(transaction),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const adminListWalletTransactions = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.userId && mongoose.Types.ObjectId.isValid(req.query.userId)) {
      filter.user = req.query.userId;
    }
    if (req.query.status) {
      if (!WALLET_TRANSACTION_STATUSES.includes(req.query.status)) {
        return res.status(400).json({ message: 'Invalid status filter' });
      }
      filter.status = req.query.status;
    }
    if (req.query.type) {
      filter.type = req.query.type;
    }
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const [transactions, total] = await Promise.all([
      WalletTransaction.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name email mobile'),
      WalletTransaction.countDocuments(filter),
    ]);

    res.json({
      transactions: transactions.map(sanitizeTransaction),
      pagination: {
        total,
        page,
        limit,
        hasMore: skip + transactions.length < total,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const adminUpdateWalletTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { status, adminNote } = req.body;
    if (!status && adminNote === undefined) {
      return res.status(400).json({ message: 'Nothing to update' });
    }

    if (status && !WALLET_TRANSACTION_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const transaction = await WalletTransaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const previousStatus = transaction.status;
    let wallet;

    if (status && status !== transaction.status) {
      transaction.status = status;
      if (transaction.category === 'withdrawal') {
        wallet = await getOrCreateWalletAccount(transaction.user);

        if (previousStatus === 'pending' && status === 'completed') {
          wallet.pendingWithdrawals = Math.max(0, wallet.pendingWithdrawals - transaction.amount);
          wallet.totalDebited += transaction.amount;
          await wallet.save();
        } else if (previousStatus === 'pending' && ['failed', 'cancelled'].includes(status)) {
          wallet.balance += transaction.amount;
          wallet.pendingWithdrawals = Math.max(0, wallet.pendingWithdrawals - transaction.amount);
          await wallet.save();
        }
      }
    }

    if (adminNote !== undefined) {
      transaction.adminNote = adminNote;
    }

    await transaction.save();

    res.json({
      transaction: sanitizeTransaction(transaction),
      wallet: wallet ? {
        balance: wallet.balance,
        pendingWithdrawals: wallet.pendingWithdrawals,
        totalDebited: wallet.totalDebited,
      } : undefined,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getWalletSummary,
  listWalletTransactions,
  initiateWalletTopup,
  requestWalletWithdrawal,
  adminListWalletTransactions,
  adminUpdateWalletTransaction,
};
