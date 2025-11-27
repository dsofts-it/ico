const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { generateOTP, sendOTP } = require('../utils/otpService');
const bcrypt = require('bcryptjs');

const OTP_TTL_MINUTES = 10;

const normalizeChannel = (channel = '') => {
  if (!channel) {
    return '';
  }

  const normalized = channel.toLowerCase();
  if (normalized === 'sms') return 'mobile';
  if (normalized === 'mobile') return 'mobile';
  if (normalized === 'email') return 'email';
  return '';
};

const buildOTP = (channel) => ({
  code: generateOTP(),
  expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000),
  channel,
});

// @desc    Register user with Email (Step 1)
// @route   POST /api/auth/signup/email-init
// @access  Public
const signupEmailInit = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  const normalizedEmail = email.toLowerCase();

  try {
    const existingUser = await User.findOne({ email: normalizedEmail });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const otpPayload = buildOTP('email');

    if (existingUser) {
      if (existingUser.isEmailVerified) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }

      existingUser.name = name || existingUser.name;
      existingUser.email = normalizedEmail;
      existingUser.password = hashedPassword;
      existingUser.otp = otpPayload;

      await existingUser.save();
      await sendOTP(existingUser.email, otpPayload.code, 'email');

      return res.status(200).json({
        message: 'Signup re-initiated. OTP sent to email.',
        userId: existingUser._id,
      });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      otp: otpPayload,
    });

    await sendOTP(user.email, otpPayload.code, 'email');

    res.status(201).json({
      message: 'Signup initiated. OTP sent to email.',
      userId: user._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register user with Mobile (Step 1)
// @route   POST /api/auth/signup/mobile-init
// @access  Public
const signupMobileInit = async (req, res) => {
  const { name, mobile } = req.body;

  if (!name || !mobile) {
    return res.status(400).json({ message: 'Name and mobile are required' });
  }

  const normalizedMobile = mobile.trim();

  try {
    const existingUser = await User.findOne({ mobile: normalizedMobile });
    const otpPayload = buildOTP('mobile');

    if (existingUser) {
      if (existingUser.isMobileVerified) {
        return res.status(400).json({ message: 'User already exists with this mobile number' });
      }

      existingUser.name = name || existingUser.name;
      existingUser.mobile = normalizedMobile;
      existingUser.otp = otpPayload;

      await existingUser.save();
      await sendOTP(normalizedMobile, otpPayload.code, 'sms');

      return res.status(200).json({
        message: 'Signup re-initiated. OTP sent to mobile.',
        userId: existingUser._id,
      });
    }

    const user = await User.create({
      name,
      mobile: normalizedMobile,
      otp: otpPayload,
    });

    await sendOTP(normalizedMobile, otpPayload.code, 'sms');

    res.status(201).json({
      message: 'Signup initiated. OTP sent to mobile.',
      userId: user._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP and Finalize Signup
// @route   POST /api/auth/signup/verify
// @access  Public
const verifyOTP = async (req, res) => {
  const { userId, otp, type } = req.body;

  if (!userId || !otp) {
    return res.status(400).json({ message: 'User ID and OTP are required' });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.otp || !user.otp.code) {
      return res.status(400).json({ message: 'No pending OTP found. Please request a new one.' });
    }

    const storedChannel = normalizeChannel(user.otp.channel);
    const requestedChannel = normalizeChannel(type);
    const verificationChannel = requestedChannel || storedChannel;

    if (!verificationChannel) {
      return res.status(400).json({ message: 'Verification type missing' });
    }

    if (requestedChannel && storedChannel && requestedChannel !== storedChannel) {
      return res.status(400).json({ message: 'OTP verification type mismatch' });
    }

    if (user.otp.code !== otp || (user.otp.expiresAt && user.otp.expiresAt < new Date())) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.otp = undefined;
    if (verificationChannel === 'email') user.isEmailVerified = true;
    if (verificationChannel === 'mobile') user.isMobileVerified = true;

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      isEmailVerified: user.isEmailVerified,
      isMobileVerified: user.isMobileVerified,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Setup PIN
// @route   POST /api/auth/pin/setup
// @access  Private
const setupPIN = async (req, res) => {
  const { pin } = req.body;

  if (pin === undefined || pin === null) {
    return res.status(400).json({ message: 'PIN is required' });
  }

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isEmailVerified && !user.isMobileVerified) {
      return res.status(400).json({ message: 'Verify email or mobile before setting a PIN' });
    }

    const pinString = String(pin);

    if (pinString.length < 4) {
      return res.status(400).json({ message: 'PIN must be at least 4 characters long' });
    }

    const salt = await bcrypt.genSalt(10);
    user.pin = await bcrypt.hash(pinString, salt);

    await user.save();

    res.json({ message: 'PIN setup successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login with Email & Password
// @route   POST /api/auth/login/email
// @access  Public
const loginEmail = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const normalizedEmail = email.toLowerCase();

  try {
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({ message: 'Email not verified' });
    }

    if (await user.matchPassword(password)) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    }

    res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login with Mobile (Request OTP)
// @route   POST /api/auth/login/mobile-init
// @access  Public
const loginMobileInit = async (req, res) => {
  const { mobile } = req.body;

  if (!mobile) {
    return res.status(400).json({ message: 'Mobile number is required' });
  }

  const normalizedMobile = mobile.trim();

  try {
    const user = await User.findOne({ mobile: normalizedMobile });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isMobileVerified) {
      return res.status(403).json({ message: 'Mobile number is not verified' });
    }

    const otpPayload = buildOTP('mobile');
    user.otp = otpPayload;

    await user.save();
    await sendOTP(normalizedMobile, otpPayload.code, 'sms');

    res.json({ message: 'OTP sent to mobile', userId: user._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login with Mobile (Verify OTP)
// @route   POST /api/auth/login/mobile-verify
// @access  Public
const loginMobileVerify = async (req, res) => {
  const { mobile, otp } = req.body;

  if (!mobile || !otp) {
    return res.status(400).json({ message: 'Mobile number and OTP are required' });
  }

  const normalizedMobile = mobile.trim();

  try {
    const user = await User.findOne({ mobile: normalizedMobile });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isMobileVerified) {
      return res.status(403).json({ message: 'Mobile number is not verified' });
    }

    if (!user.otp || !user.otp.code) {
      return res.status(400).json({ message: 'No OTP pending verification' });
    }

    const channel = normalizeChannel(user.otp.channel || 'mobile');

    if (channel !== 'mobile') {
      return res.status(400).json({ message: 'OTP verification type mismatch' });
    }

    if (user.otp.code !== otp || (user.otp.expiresAt && user.otp.expiresAt < new Date())) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.otp = undefined;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      mobile: user.mobile,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login with PIN
// @route   POST /api/auth/login/pin
// @access  Public (but requires identifier)
const loginPIN = async (req, res) => {
  const { identifier, pin } = req.body; // identifier can be email or mobile

  if (!identifier || !pin) {
    return res.status(400).json({ message: 'Identifier and PIN are required' });
  }

  const trimmedIdentifier = identifier.trim();
  const normalizedIdentifier = trimmedIdentifier.includes('@')
    ? trimmedIdentifier.toLowerCase()
    : trimmedIdentifier;

  try {
    // Find user by email OR mobile
    const user = await User.findOne({
      $or: [{ email: normalizedIdentifier }, { mobile: normalizedIdentifier }],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.pin) {
      return res.status(400).json({ message: 'PIN not set for this user' });
    }

    const identifierMatchedEmail = user.email && user.email === normalizedIdentifier;
    const identifierMatchedMobile = user.mobile && user.mobile === normalizedIdentifier;

    if (identifierMatchedEmail && !user.isEmailVerified) {
      return res.status(403).json({ message: 'Email not verified' });
    }

    if (identifierMatchedMobile && !user.isMobileVerified) {
      return res.status(403).json({ message: 'Mobile number not verified' });
    }

    if (!identifierMatchedEmail && !identifierMatchedMobile) {
      return res.status(400).json({ message: 'Identifier does not match user records' });
    }

    const pinString = String(pin);

    if (await user.matchPin(pinString)) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid PIN' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  signupEmailInit,
  signupMobileInit,
  verifyOTP,
  setupPIN,
  loginEmail,
  loginMobileInit,
  loginMobileVerify,
  loginPIN,
};
