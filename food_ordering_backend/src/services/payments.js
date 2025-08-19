'use strict';

const { getQuery } = require('../db');

const { PAYMENT_PROVIDER = 'mock' } = process.env;

class PaymentsService {
  // PUBLIC_INTERFACE
  async createPaymentIntent(orderId) {
    /** Create a payment row for an order and return a mock client secret. */
    const q = getQuery();

    // Fetch order
    let order;
    try {
      const { rows } = await q('SELECT * FROM orders WHERE id = $1', [orderId]);
      order = rows?.[0];
    } catch (_) {
      const { rows } = await q('SELECT * FROM orders WHERE id = ?', [orderId]);
      order = Array.isArray(rows) ? rows[0] : null;
    }
    if (!order) {
      const err = new Error('Order not found');
      err.status = 404;
      throw err;
    }
    if (order.payment_status === 'paid') {
      return { provider: PAYMENT_PROVIDER, client_secret: null, status: 'succeeded' };
    }

    // Upsert payment row
    try {
      await q(
        `INSERT INTO payments (order_id, provider, amount_cents, currency, status)
         VALUES ($1, $2, $3, $4, 'created')
         ON CONFLICT (order_id) DO UPDATE SET amount_cents = $3, currency = $4, updated_at = CURRENT_TIMESTAMP`,
        [order.id, PAYMENT_PROVIDER, order.total_cents, order.currency]
      );
    } catch (_) {
      // MySQL: emulate upsert
      const existing = await q('SELECT id FROM payments WHERE order_id = ?', [order.id]);
      if (Array.isArray(existing.rows) && existing.rows[0]) {
        await q(
          'UPDATE payments SET amount_cents = ?, currency = ?, updated_at = CURRENT_TIMESTAMP WHERE order_id = ?',
          [order.total_cents, order.currency, order.id]
        );
      } else {
        await q(
          'INSERT INTO payments (order_id, provider, amount_cents, currency, status) VALUES (?, ?, ?, ?, ?)',
          [order.id, PAYMENT_PROVIDER, order.total_cents, order.currency, 'created']
        );
      }
    }

    // Return mock client secret
    const clientSecret = `pi_${order.id}_secret_mock`;
    return { provider: PAYMENT_PROVIDER, client_secret: clientSecret, status: 'requires_confirmation' };
  }

  // PUBLIC_INTERFACE
  async confirmPayment(orderId, { client_secret }) {
    /** Mock confirmation: marks payment and order paid if client_secret matches pattern. */
    if (!client_secret || !client_secret.includes(`pi_${orderId}_secret_`)) {
      const err = new Error('Invalid client secret');
      err.status = 400;
      throw err;
    }
    const q = getQuery();
    try {
      await q('UPDATE payments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE order_id = $2', ['succeeded', orderId]);
      await q('UPDATE orders SET payment_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', ['paid', orderId]);
    } catch (_) {
      await q('UPDATE payments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE order_id = ?', ['succeeded', orderId]);
      await q('UPDATE orders SET payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', ['paid', orderId]);
    }
    return { status: 'succeeded' };
  }
}

module.exports = new PaymentsService();
