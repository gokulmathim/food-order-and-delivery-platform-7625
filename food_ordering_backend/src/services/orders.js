'use strict';

const { getQuery } = require('../db');

class OrdersService {
  // PUBLIC_INTERFACE
  async placeOrder(userId, { delivery_address = null, delivery_lat = null, delivery_lng = null }) {
    /** Convert active cart into an order; create order_items snapshot, clear cart status. */
    const q = getQuery();

    // Load active cart and items
    let cart, items;
    try {
      const res = await q('SELECT * FROM carts WHERE user_id = $1 AND status = $2 ORDER BY id DESC LIMIT 1', [userId, 'active']);
      cart = res.rows?.[0];
    } catch (_) {
      const res = await q('SELECT * FROM carts WHERE user_id = ? AND status = ? ORDER BY id DESC LIMIT 1', [userId, 'active']);
      cart = Array.isArray(res.rows) ? res.rows[0] : null;
    }

    if (!cart) {
      const err = new Error('No active cart');
      err.status = 400;
      throw err;
    }
    try {
      const res = await q(
        `SELECT ci.*, mi.name
         FROM cart_items ci
         JOIN menu_items mi ON mi.id = ci.menu_item_id
         WHERE ci.cart_id = $1
         ORDER BY ci.id ASC`,
        [cart.id]
      );
      items = res.rows;
    } catch (_) {
      const res = await q(
        `SELECT ci.*, mi.name
         FROM cart_items ci
         JOIN menu_items mi ON mi.id = ci.menu_item_id
         WHERE ci.cart_id = ?
         ORDER BY ci.id ASC`,
        [cart.id]
      );
      items = res.rows;
    }

    if (!items || items.length === 0) {
      const err = new Error('Cart is empty');
      err.status = 400;
      throw err;
    }

    const total_cents = items.reduce((sum, it) => sum + it.quantity * it.unit_price_cents, 0);
    const currency = items[0].currency || 'USD';

    // Start minimal transaction if available
    // We rely on simple operations; for pg we can use BEGIN/COMMIT, for mysql use connection. Here we keep it simple.
    let orderRow;
    try {
      const res = await q(
        `INSERT INTO orders (user_id, restaurant_id, cart_id, total_cents, currency, status, payment_status, delivery_address, delivery_lat, delivery_lng)
         VALUES ($1, $2, $3, $4, $5, 'pending', 'unpaid', $6, $7, $8)
         RETURNING *`,
        [userId, cart.restaurant_id, cart.id, total_cents, currency, delivery_address, delivery_lat, delivery_lng]
      );
      orderRow = res.rows?.[0];
    } catch (_) {
      await q(
        `INSERT INTO orders (user_id, restaurant_id, cart_id, total_cents, currency, status, payment_status, delivery_address, delivery_lat, delivery_lng)
         VALUES (?, ?, ?, ?, ?, 'pending', 'unpaid', ?, ?, ?)`,
        [userId, cart.restaurant_id, cart.id, total_cents, currency, delivery_address, delivery_lat, delivery_lng]
      );
      // Re-read last order for this cart
      const res2 = await q(
        'SELECT * FROM orders WHERE cart_id = ? ORDER BY id DESC LIMIT 1',
        [cart.id]
      );
      orderRow = Array.isArray(res2.rows) ? res2.rows[0] : null;
    }

    // Insert order items
    for (const it of items) {
      try {
        await q(
          `INSERT INTO order_items (order_id, menu_item_id, name, quantity, unit_price_cents, currency, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [orderRow.id, it.menu_item_id, it.name, it.quantity, it.unit_price_cents, it.currency, it.notes || null]
        );
      } catch (_) {
        await q(
          `INSERT INTO order_items (order_id, menu_item_id, name, quantity, unit_price_cents, currency, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [orderRow.id, it.menu_item_id, it.name, it.quantity, it.unit_price_cents, it.currency, it.notes || null]
        );
      }
    }

    // Mark cart as converted and clear its items
    try {
      await q('UPDATE carts SET status = $1 WHERE id = $2', ['converted', cart.id]);
      await q('DELETE FROM cart_items WHERE cart_id = $1', [cart.id]);
    } catch (_) {
      await q('UPDATE carts SET status = ? WHERE id = ?', ['converted', cart.id]);
      await q('DELETE FROM cart_items WHERE cart_id = ?', [cart.id]);
    }

    return orderRow;
  }

  // PUBLIC_INTERFACE
  async listOrders(userId, { limit = 50, offset = 0 } = {}) {
    /** Return paginated order list for user. */
    const q = getQuery();
    try {
      const { rows } = await q(
        `SELECT id, restaurant_id, total_cents, currency, status, payment_status, placed_at, updated_at
         FROM orders
         WHERE user_id = $1
         ORDER BY id DESC
         LIMIT ${Number(limit)} OFFSET ${Number(offset)}`,
        [userId]
      );
      return rows;
    } catch (_) {
      const { rows } = await q(
        `SELECT id, restaurant_id, total_cents, currency, status, payment_status, placed_at, updated_at
         FROM orders
         WHERE user_id = ?
         ORDER BY id DESC
         LIMIT ${Number(limit)} OFFSET ${Number(offset)}`,
        [userId]
      );
      return rows;
    }
  }

  // PUBLIC_INTERFACE
  async getOrder(userId, orderId) {
    /** Return order details and items if belongs to user. */
    const q = getQuery();
    let order;
    try {
      const { rows } = await q('SELECT * FROM orders WHERE id = $1 AND user_id = $2 LIMIT 1', [orderId, userId]);
      order = rows?.[0];
    } catch (_) {
      const { rows } = await q('SELECT * FROM orders WHERE id = ? AND user_id = ? LIMIT 1', [orderId, userId]);
      order = Array.isArray(rows) ? rows[0] : null;
    }
    if (!order) return null;

    let items;
    try {
      const { rows } = await q('SELECT * FROM order_items WHERE order_id = $1 ORDER BY id ASC', [orderId]);
      items = rows;
    } catch (_) {
      const { rows } = await q('SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC', [orderId]);
      items = rows;
    }
    return { ...order, items };
  }

  // PUBLIC_INTERFACE
  async updateStatus(orderId, { status, payment_status }) {
    /** Admin/courier utility: update order or payment status. */
    const q = getQuery();
    if (status) {
      try {
        await q('UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [status, orderId]);
      } catch (_) {
        await q('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, orderId]);
      }
    }
    if (payment_status) {
      try {
        await q('UPDATE orders SET payment_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [payment_status, orderId]);
      } catch (_) {
        await q('UPDATE orders SET payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [payment_status, orderId]);
      }
    }
    return true;
  }
}

module.exports = new OrdersService();
