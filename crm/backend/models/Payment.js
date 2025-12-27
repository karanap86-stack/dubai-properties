// Payment.js - Multi-currency payment model for global transactions
const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  amount: { type: Number, required: true }, // Original amount
  currency: { type: String, required: true }, // Original currency (e.g., 'USD', 'INR')
  baseAmount: { type: Number, required: true }, // Amount in base currency
  baseCurrency: { type: String, required: true }, // e.g., 'USD'
  fxRate: { type: Number, required: true }, // FX rate at transaction time
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  paymentGateway: { type: String },
  gatewayTransactionId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  refund: {
    amount: Number,
    currency: String,
    baseAmount: Number,
    fxRate: Number,
    refundedAt: Date,
    reason: String
  },
  auditLog: [
    {
      action: String,
      performedBy: String,
      timestamp: Date,
      details: Object
    }
  ]
});

module.exports = mongoose.model('Payment', PaymentSchema);
