const mongoose = require('mongoose');
const User = require('../models/User');
const KycApplication = require('../models/KycApplication');
const IcoHolding = require('../models/IcoHolding');
const IcoTransaction = require('../models/IcoTransaction');
const WalletAccount = require('../models/WalletAccount');
const WalletTransaction = require('../models/WalletTransaction');
const ReferralEarning = require('../models/ReferralEarning');

const getTokenPrice = () => {
  const price = Number(process.env.ICO_PRICE_INR || process.env.ICO_TOKEN_PRICE_INR || 10);
  if (Number.isNaN(price) || price <= 0) return 10;
  return price;
};

// Admin: paginated user list with KYC badge
const listUsers = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const search = (req.query.search || '').trim();
    const role = (req.query.role || '').trim();
    const kycStatus = (req.query.kycStatus || '').trim();

    const filter = {};
    if (role) filter.role = role;
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { name: regex },
        { email: regex },
        { mobile: regex },
        { referralCode: regex },
      ];
    }

    // Fetch user list
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('name email mobile role referralCode referralLevel referralTotalEarned referralWalletBalance isEmailVerified isMobileVerified createdAt'),
      User.countDocuments(filter),
    ]);

    // Attach KYC status (optional filter by status)
    const userIds = users.map((u) => u._id);
    let kycQuery = { user: { $in: userIds } };
    
    if(kycStatus){
      kycQuery.status  = kycStatus;
    }

    o 

    const kycs = userIds.length ? await KycApplication.find(kycQuery).select('user status') : [];
    const kycMap = new Map(kycs.map((k) => [k.user.toString(), k.status]));

    const data = users
      .map((u) => ({
        ...u.toObject(),
        kycStatus: kycMap.get(u._id.toString()) || 'not_submitted',
      }))
      // If KYC filter applied, hide users that don't match
      .filter((u) => {
        if (!kycStatus) return true;
        return u.kycStatus === kycStatus;
      });

    const totalForResponse = kycStatus ? data.length : total;
    res.json({
      data,
      pagination: {
        total: totalForResponse,
        page,
        limit,
        hasMore: !kycStatus && skip + data.length < total,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: single user detail with KYC + balances
const getUserDetail = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const user = await User.findById(req.params.id).select('-password -pin');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const [kyc, wallet, holding] = await Promise.all([
      KycApplication.findOne({ user: user._id }),
      WalletAccount.findOne({ user: user._id }),
      IcoHolding.findOne({ user: user._id }),
    ]);

    const price = getTokenPrice();
    res.json({
      user,
      kyc: kyc || { status: 'not_submitted' },
      wallet: wallet
        ? {
            balance: wallet.balance,
            totalCredited: wallet.totalCredited,
            totalDebited: wallet.totalDebited,
            currency: wallet.currency,
          }
        : { balance: 0, totalCredited: 0, totalDebited: 0, currency: 'INR' },
      holdings: holding
        ? {
            balance: holding.balance,
            valuation: holding.balance * price,
            tokenSymbol: process.env.ICO_TOKEN_SYMBOL || 'ICOX',
          }
        : { balance: 0, valuation: 0, tokenSymbol: process.env.ICO_TOKEN_SYMBOL || 'ICOX' },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: KYC queue list
const listKycApplications = async (req, res) => {
  try {
    const status = (req.query.status || '').trim();
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const filter = {};
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const [kycs, total] = await Promise.all([
      KycApplication.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name email mobile referralCode role'),
      KycApplication.countDocuments(filter),
    ]);

    res.json({
      data: kycs,
      pagination: {
        total,
        page,
        limit,
        hasMore: skip + kycs.length < total,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: global stats snapshot
const getAdminStats = async (_req, res) => {
  try {
    const tokenSymbol = process.env.ICO_TOKEN_SYMBOL || 'ICOX';
    const price = getTokenPrice();

    const [totalUsers, kycVerified, kycPending, holdingsAgg, icoAgg, walletAgg, walletTxAgg] =
      await Promise.all([
        User.countDocuments(),
        KycApplication.countDocuments({ status: 'verified' }),
        KycApplication.countDocuments({ status: 'pending' }),
        IcoHolding.aggregate([{ $group: { _id: null, balance: { $sum: '$balance' } } }]),
        IcoTransaction.aggregate([
          { $match: { type: 'buy', status: 'completed' } },
          { $group: { _id: null, fiatAmount: { $sum: '$fiatAmount' } } },
        ]),
        WalletAccount.aggregate([{ $group: { _id: null, balance: { $sum: '$balance' } } }]),
        WalletTransaction.aggregate([
          { $group: { _id: '$type', amount: { $sum: '$amount' } } },
        ]),
      ]);

    const tokenCirculation = holdingsAgg[0]?.balance || 0;
    const icoVolumeInr = icoAgg[0]?.fiatAmount || 0;
    const walletBalance = walletAgg[0]?.balance || 0;
    const walletVolumes = walletTxAgg.reduce(
      (acc, curr) => {
        acc[curr._id] = curr.amount;
        return acc;
      },
      {},
    );

    res.json({
      users: {
        total: totalUsers,
        kycVerified,
        kycPending,
      },
      ico: {
        tokenSymbol,
        priceInr: price,
        circulation: tokenCirculation,
        circulationValueInr: tokenCirculation * price,
        buyVolumeInr: icoVolumeInr,
      },
      wallet: {
        totalBalanceInr: walletBalance,
        volume: walletVolumes,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: global ICO transactions list
const listIcoTransactions = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.userId && mongoose.Types.ObjectId.isValid(req.query.userId)) {
      filter.user = req.query.userId;
    }
    if (req.query.type) {
      filter.type = req.query.type;
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const [transactions, total] = await Promise.all([
      IcoTransaction.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name email mobile'),
      IcoTransaction.countDocuments(filter),
    ]);

    res.json({
      data: transactions,
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

// Admin: referral earnings list
const listReferralEarningsAdmin = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.earner && mongoose.Types.ObjectId.isValid(req.query.earner)) {
      filter.earner = req.query.earner;
    }
    if (req.query.sourceUser && mongoose.Types.ObjectId.isValid(req.query.sourceUser)) {
      filter.sourceUser = req.query.sourceUser;
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.sourceType) {
      filter.sourceType = req.query.sourceType;
    }
    if (req.query.depth !== undefined) {
      const depth = Number(req.query.depth);
      if (!Number.isNaN(depth)) {
        filter.depth = depth;
      }
    }

    const [earnings, total] = await Promise.all([
      ReferralEarning.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('earner', 'name email mobile referralCode')
        .populate('sourceUser', 'name email mobile referralCode'),
      ReferralEarning.countDocuments(filter),
    ]);

    res.json({
      data: earnings,
      pagination: {
        total,
        page,
        limit,
        hasMore: skip + earnings.length < total,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  listUsers,
  getUserDetail,
  listKycApplications,
  getAdminStats,
  listIcoTransactions,
  listReferralEarningsAdmin,
};
