// payments.js - Express routes for multi-currency payments
const express = require('express');
const router = express.Router();
const { createPayment, refundPayment } = require('../services/paymentService');

// POST /payments - Create a new payment
router.post('/', async (req, res) => {
  try {
    const payment = await createPayment(req.body);
    res.status(201).json(payment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /payments/:id/refund - Refund a payment
router.post('/:id/refund', async (req, res) => {
  try {
    const { amount, reason, performedBy } = req.body;
    const payment = await refundPayment(req.params.id, amount, reason, performedBy);
    res.json(payment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
