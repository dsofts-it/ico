const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { generateOTP, sendOTP } = require('../utils/otpService');
const bcrypt = require('bcryptjs');

// @desc    Register user with Email (Step 1)
// @route   POST /api/auth/signup/email-init
// @access  Public
const signupEmailInit = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otpCode = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create temporary user or update if exists but unverified (logic simplified for new user)
    // For simplicity, we create the user but mark unverified
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      otp: {
        code: otpCode,
        expiresAt: otpExpires,
      },
    });

    await sendOTP(email, otpCode, 'email');

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

  try {
    const userExists = await User.findOne({ mobile });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this mobile number' });
    }

    const otpCode = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({
      name,
      mobile,
      otp: {
        code: otpCode,
        expiresAt: otpExpires,
      },
    });

    await sendOTP(mobile, otpCode, 'sms');

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
  const { userId, otp, type } = req.body; // type: 'email' or 'mobile'

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.otp.code !== otp || user.otp.expiresAt < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Clear OTP and mark verified
    user.otp = undefined;
    if (type === 'email') user.isEmailVerified = true;
    if (type === 'mobile') user.isMobileVerified = true;

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
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

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const salt = await bcrypt.genSalt(10);
    user.pin = await bcrypt.hash(pin, salt);

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

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login with Mobile (Request OTP)
// @route   POST /api/auth/login/mobile-init
// @access  Public
const loginMobileInit = async (req, res) => {
  const { mobile } = req.body;

  try {
    const user = await User.findOne({ mobile });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otpCode = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = {
      code: otpCode,
      expiresAt: otpExpires,
    };

    await user.save();
    await sendOTP(mobile, otpCode, 'sms');

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

  try {
    const user = await User.findOne({ mobile });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.otp.code !== otp || user.otp.expiresAt < Date.now()) {
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

  try {
    // Find user by email OR mobile
    const user = await User.findOne({
      $or: [{ email: identifier }, { mobile: identifier }],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.pin) {
      return res.status(400).json({ message: 'PIN not set for this user' });
    }

    if (await user.matchPin(pin)) {
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
