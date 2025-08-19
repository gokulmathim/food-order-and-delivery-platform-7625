'use strict';

const paymentsService = require('../services/payments');

class PaymentsController {
  // PUBLIC_INTERFACE
  async createIntent(req, res) {
    /** Create payment intent for an order. */
    try {
      const { order_id } = req.body || {};
      if (!order_id) return res.status(400).json({ message: 'order_id required' });
      const result = await paymentsService.createPaymentIntent(Number(order_id));
      return res.status(201).json(result);
    } catch (e) {
      return res.status(e.status || 500).json({ message: e.message || 'Failed to create payment intent' });
    }
  }

  // PUBLIC_INTERFACE
  async confirm(req, res) {
    /** Confirm payment with mock client secret. */
    try {
      const { order_id, client_secret } = req.body || {};
      if (!order_id || !client_secret) {
        return res.status(400).json({ message: 'order_id and client_secret required' });
      }
      const result = await paymentsService.confirmPayment(Number(order_id), { client_secret });
      return res.json(result);
    } catch (e) {
      return res.status(e.status || 500).json({ message: e.message || 'Failed to confirm payment' });
    }
  }
}

module.exports = new PaymentsController();
