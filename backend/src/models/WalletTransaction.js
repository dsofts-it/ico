const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WalletAccount',
    required: true,
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true,
  },
  category: {
    type: String,
    enum: ['topup', 'purchase', 'withdrawal', 'refund', 'adjustment'],
    default: 'topup',
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: 'INR',
    uppercase: true,
  },
  status: {
    type: String,
    enum: ['initiated', 'pending', 'completed', 'failed', 'cancelled'],
    default: 'initiated',
  },
  description: String,
  merchantTransactionId: {
    type: String,
    index: true,
  },
  paymentGateway: {
    type: String,
    default: 'phonepe',
  },
  phonePePayload: mongoose.Schema.Types.Mixed,
  phonePeTransactionId: String,
  phonePeResponse: mongoose.Schema.Types.Mixed,
  referenceId: String,
  metadata: mongoose.Schema.Types.Mixed,
  adminNote: String,
}, {
  timestamps: true,
});

walletTransactionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);
