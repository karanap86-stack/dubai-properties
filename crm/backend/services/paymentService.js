// paymentService.js - Payment logic with multi-currency and FX automation

const Payment = require('../models/Payment');
const { getFxRate, BASE_CURRENCY } = require('./fxService');
// Optionally require webhook/event emitter
// const { emitPaymentEvent } = require('../utils/webhookEmitter');

/**
 * Create a payment with multi-currency support
 * @param {Object} params - { userId, orderId, amount, currency, paymentGateway, gatewayTransactionId }
 */

// Create a payment (initial status: pending)
async function createPayment(params) {
  const { userId, orderId, amount, currency, paymentGateway, gatewayTransactionId } = params;
  try {
    const fxRate = await getFxRate(currency, BASE_CURRENCY);
    const baseAmount = amount * fxRate;
    const payment = new Payment({
      userId,
      orderId,
      amount,
      currency,
      baseAmount,
      baseCurrency: BASE_CURRENCY,
      fxRate,
      paymentGateway,
      gatewayTransactionId,
      status: 'pending',
      auditLog: [{ action: 'created', performedBy: userId, timestamp: new Date(), details: { amount, currency, baseAmount, fxRate } }]
    });
    await payment.save();
    // emitPaymentEvent && emitPaymentEvent('payment_created', payment);
    return payment;
  } catch (e) {
    throw new Error('Create payment failed: ' + e.message);
  }
}

/**
 * Refund a payment (in original currency)
 * @param {String} paymentId
 * @param {Number} amount
 * @param {String} reason
 * @param {String} performedBy
 */

// Refund a payment (only if completed)
async function refundPayment(paymentId, amount, reason, performedBy) {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw new Error('Payment not found');
  if (payment.status !== 'completed') throw new Error('Only completed payments can be refunded');
  payment.refund = {
    amount,
    currency: payment.currency,
    baseAmount: amount * payment.fxRate,
    fxRate: payment.fxRate,
    refundedAt: new Date(),
    reason
  };
  payment.status = 'refunded';
  payment.auditLog.push({ action: 'refunded', performedBy, timestamp: new Date(), details: { amount, reason } });
  await payment.save();
  // emitPaymentEvent && emitPaymentEvent('payment_refunded', payment);
  return payment;
}

// Mark payment as completed (after gateway callback/webhook)
async function completePayment(paymentId, performedBy, details = {}) {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw new Error('Payment not found');
  if (payment.status !== 'pending') throw new Error('Only pending payments can be completed');
  payment.status = 'completed';
  payment.auditLog.push({ action: 'completed', performedBy, timestamp: new Date(), details });
  payment.updatedAt = new Date();
  await payment.save();
  // emitPaymentEvent && emitPaymentEvent('payment_completed', payment);
  return payment;
}

// Mark payment as failed (e.g., gateway failure)
async function failPayment(paymentId, performedBy, reason = '') {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw new Error('Payment not found');
  if (payment.status !== 'pending') throw new Error('Only pending payments can be failed');
  payment.status = 'failed';
  payment.auditLog.push({ action: 'failed', performedBy, timestamp: new Date(), details: { reason } });
  payment.updatedAt = new Date();
  await payment.save();
  // emitPaymentEvent && emitPaymentEvent('payment_failed', payment);
  return payment;
}

// Webhook handler (example: process gateway callback)
async function handlePaymentWebhook(event) {
  // event: { paymentId, status, performedBy, details }
  const { paymentId, status, performedBy, details } = event;
  if (status === 'completed') {
    return await completePayment(paymentId, performedBy, details);
  } else if (status === 'failed') {
    return await failPayment(paymentId, performedBy, details && details.reason);
  } else if (status === 'refunded') {
    // For refund, details must include amount and reason
    return await refundPayment(paymentId, details.amount, details.reason, performedBy);
  }
  throw new Error('Unknown webhook status: ' + status);
}

module.exports = {
  createPayment,
  refundPayment,
  completePayment,
  failPayment,
  handlePaymentWebhook
};
