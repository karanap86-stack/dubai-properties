// Account details model for payment recipients (Mongoose schema)
const mongoose = require('mongoose');

const accountDetailsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accountHolder: { type: String, required: true },
  bankName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  ifscOrSwift: { type: String },
  branch: { type: String },
  country: { type: String },
  currency: { type: String, default: 'INR' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AccountDetails', accountDetailsSchema);
