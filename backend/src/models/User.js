const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null values if user signs up with mobile
    trim: true,
    lowercase: true,
  },
  mobile: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null values if user signs up with email
    trim: true,
  },
  password: {
    type: String,
    // Required only if email is present, but we handle validation in controller usually
  },
  pin: {
    type: String, // Hashed PIN
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  isMobileVerified: {
    type: Boolean,
    default: false,
  },
  otp: {
    code: String,
    expiresAt: Date,
  },
}, {
  timestamps: true,
});

// Match Password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Match PIN
userSchema.methods.matchPin = async function(enteredPin) {
  return await bcrypt.compare(enteredPin, this.pin);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
