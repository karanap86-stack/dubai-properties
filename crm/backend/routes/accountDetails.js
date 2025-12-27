// Express routes for managing account details
const express = require('express');
const router = express.Router();
const AccountDetails = require('../models/AccountDetails');
const User = require('../models/User');

// Add or update account details
router.post('/save', async (req, res) => {
  const { accountHolder, bankName, accountNumber, ifscOrSwift, branch, country, currency } = req.body;
  const userId = req.user._id; // Assume auth middleware
  let acc = await AccountDetails.findOne({ userId });
  if (acc) {
    acc.accountHolder = accountHolder;
    acc.bankName = bankName;
    acc.accountNumber = accountNumber;
    acc.ifscOrSwift = ifscOrSwift;
    acc.branch = branch;
    acc.country = country;
    acc.currency = currency;
    await acc.save();
  } else {
    acc = await AccountDetails.create({ userId, accountHolder, bankName, accountNumber, ifscOrSwift, branch, country, currency });
  }
  res.json(acc);
});

// Get account details for payment (only show to authorized parties)
router.get('/for-payment/:recipientId', async (req, res) => {
  const recipientId = req.params.recipientId;
  // Add access control logic here
  const acc = await AccountDetails.findOne({ userId: recipientId, isActive: true });
  if (!acc) return res.status(404).json({ error: 'No account details found' });
  res.json({
    accountHolder: acc.accountHolder,
    bankName: acc.bankName,
    accountNumber: acc.accountNumber,
    ifscOrSwift: acc.ifscOrSwift,
    branch: acc.branch,
    country: acc.country,
    currency: acc.currency
  });
});

module.exports = router;
