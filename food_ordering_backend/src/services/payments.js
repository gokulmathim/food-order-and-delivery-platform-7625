'use strict';

const { createPayment, getOrderById } = require('../data/store');
const config = require('../config');

class PaymentsService {
  // PUBLIC_INTERFACE
  processPayment({ userId, orderId, method = 'card' }) {
    /** Process a mock payment for a user order */
    const ord = getOrderById(orderId);
    if (!ord || ord.userId !== userId) {
      const e = new Error('Order not found');
      e.code = 'NOT_FOUND';
      throw e;
    }
    // Mock payment outcome success
    const providerRef = `prov_${Math.random().toString(36).slice(2, 10)}`;
    const payment = createPayment({
      orderId,
      amount: ord.total,
      status: 'succeeded',
      providerRef,
    });
    return {
      ...payment,
      method,
      provider: 'mock',
      mask: '**** **** **** 4242',
      providerKeyUsed: Boolean(config.paymentProviderKey),
    };
  }
}

module.exports = new PaymentsService();
