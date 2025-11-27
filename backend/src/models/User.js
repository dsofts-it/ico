const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
  label: String,
  line1: String,
  line2: String,
  city: String,
  state: String,
  postalCode: String,
  country: {
    type: String,
    default: 'IN',
  },
  landmark: String,
  isDefault: {
    type: Boolean,
    default: false,
  },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true,
  },
  mobile: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  password: {
    type: String,
  },
  pin: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  addresses: [addressSchema],
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  isMobileVerified: {
    type: Boolean,
    default: false,
  },
  otp: {
    code: {
      type: String,
    },
    expiresAt: {
      type: Date,
    },
    channel: {
      type: String,
      enum: ['email', 'mobile'],
    },
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
