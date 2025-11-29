const mongoose = require('mongoose');
const User = require('../models/User');
const ReferralEarning = require('../models/ReferralEarning');

const REQUIRED_FIELDS = ['line1', 'city', 'state', 'postalCode'];
const ADDRESS_FIELDS = [
  'label',
  'fullName',
  'phone',
  'line1',
  'line2',
  'city',
  'state',
  'postalCode',
  'country',
  'landmark',
];

const sanitizeAddressInput = (payload = {}) => {
  const address = {};
  ADDRESS_FIELDS.forEach((field) => {
    if (payload[field] !== undefined) {
      address[field] = typeof payload[field] === 'string'
        ? payload[field].trim()
        : payload[field];
    }
  });
  return address;
};

const validateRequiredFields = (address) => {
  const missing = REQUIRED_FIELDS.filter((field) => {
    const value = address[field];
    return value === undefined || value === null || value === '';
  });
  if (missing.length) {
    const fieldList = missing.join(', ');
    const error = new Error(`Missing required address fields: ${fieldList}`);
    error.statusCode = 400;
    throw error;
  }
};

const ensureUserExists = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user;
};

const ensureAddressIdentifiers = (user) => {
  let mutated = false;
  user.addresses.forEach((address) => {
    if (!address._id) {
      address._id = new mongoose.Types.ObjectId();
      mutated = true;
    }
  });
  if (mutated) {
    user.markModified('addresses');
  }
  return mutated;
};

const ensureDefaultAddress = (addresses = []) => {
  if (!addresses.length) {
    return;
  }
  const hasDefault = addresses.some((address) => address.isDefault);
  if (!hasDefault) {
    addresses[0].isDefault = true;
  }
};

const setDefaultById = (addresses, addressId) => {
  const targetId = addressId?.toString();
  let updated = false;
  addresses.forEach((address) => {
    if (address._id?.toString() === targetId) {
      address.isDefault = true;
      updated = true;
    } else {
      address.isDefault = false;
    }
  });
  return updated;
};

const getAddresses = async (req, res) => {
  try {
    const user = await ensureUserExists(req.user._id);
    const mutated = ensureAddressIdentifiers(user);
    if (mutated) {
      await user.save();
    }
    res.json(user.addresses || []);
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message });
  }
};

const addAddress = async (req, res) => {
  try {
    const user = await ensureUserExists(req.user._id);
    ensureAddressIdentifiers(user);
    const addressInput = sanitizeAddressInput(req.body);
    validateRequiredFields(addressInput);

    const address = addressInput;
    address.isDefault = Boolean(req.body.isDefault || user.addresses.length === 0);

    if (address.isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.addresses.push(address);
    ensureDefaultAddress(user.addresses);
    await user.save();

    res.status(201).json(user.addresses);
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message });
  }
};

const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await ensureUserExists(req.user._id);
    ensureAddressIdentifiers(user);
    const address = user.addresses.id(addressId);

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    const updates = sanitizeAddressInput(req.body);
    Object.assign(address, updates);

    if (req.body.isDefault !== undefined) {
      if (req.body.isDefault) {
        setDefaultById(user.addresses, address._id);
      } else {
        address.isDefault = false;
        ensureDefaultAddress(user.addresses);
      }
    }

    validateRequiredFields({
      line1: address.line1,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
    });

    await user.save();
    res.json(user.addresses);
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await ensureUserExists(req.user._id);
    ensureAddressIdentifiers(user);
    const address = user.addresses.id(addressId);

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    address.deleteOne();
    ensureDefaultAddress(user.addresses);
    await user.save();

    res.json(user.addresses);
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message });
  }
};

const setDefaultAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await ensureUserExists(req.user._id);
    ensureAddressIdentifiers(user);

    const updated = setDefaultById(user.addresses, addressId);
    if (!updated) {
      return res.status(404).json({ message: 'Address not found' });
    }

    await user.save();
    res.json(user.addresses);
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message });
  }
};

const getReferralSummary = async (req, res) => {
  try {
    const user = await ensureUserExists(req.user._id);
    res.json({
      referralCode: user.referralCode,
      referredBy: user.referredBy,
      referralLevel: user.referralLevel || 0,
      referralDownlineCounts: user.referralDownlineCounts || [],
      referralWalletBalance: user.referralWalletBalance || 0,
      referralTotalEarned: user.referralTotalEarned || 0,
    });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message });
  }
};

const listReferralEarnings = async (req, res) => {
  try {
    const earnings = await ReferralEarning.find({ earner: req.user._id })
      .sort({ createdAt: -1 })
      .limit(200);
    res.json(earnings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getReferralSummary,
  listReferralEarnings,
};
