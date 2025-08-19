'use strict';

const { getQuery } = require('./index');

// PUBLIC_INTERFACE
async function findUserByEmail(email) {
  /** Find a user by email. Returns row or null. */
  const q = getQuery();
  const sql = 'SELECT * FROM users WHERE email = $1 LIMIT 1';
  try {
    const { rows } = await q(sql, [email]);
    return rows?.[0] || null;
  } catch (e) {
    const mysqlSql = 'SELECT * FROM users WHERE email = ? LIMIT 1';
    const { rows } = await q(mysqlSql, [email]);
    return Array.isArray(rows) ? rows[0] || null : null;
  }
}

// PUBLIC_INTERFACE
async function createUser({ email, hashed_password, full_name, phone, role = 'customer' }) {
  /** Create a user with hashed password. Returns created row id. */
  const q = getQuery();
  const pgSql = `INSERT INTO users (email, phone, hashed_password, full_name, role)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING id`;
  const params = [email, phone || null, hashed_password, full_name || null, role];
  try {
    const { rows } = await q(pgSql, params);
    return rows?.[0]?.id;
  } catch (e) {
    const mySql = `INSERT INTO users (email, phone, hashed_password, full_name, role)
                   VALUES (?, ?, ?, ?, ?)`;
    await q(mySql, params);
    return null;
  }
}

// PUBLIC_INTERFACE
async function getActiveCart(userId) {
  /** Retrieve or create an active cart for user. */
  const q = getQuery();
  try {
    const { rows } = await q('SELECT * FROM carts WHERE user_id = $1 AND status = $2 ORDER BY id DESC LIMIT 1', [userId, 'active']);
    if (rows && rows[0]) return rows[0];
  } catch (e) {
    const { rows } = await q('SELECT * FROM carts WHERE user_id = ? AND status = ? ORDER BY id DESC LIMIT 1', [userId, 'active']);
    if (Array.isArray(rows) && rows[0]) return rows[0];
  }
  try {
    const { rows } = await q('INSERT INTO carts (user_id, status) VALUES ($1, $2) RETURNING *', [userId, 'active']);
    return rows?.[0] || null;
  } catch (e) {
    await q('INSERT INTO carts (user_id, status) VALUES (?, ?)', [userId, 'active']);
    const { rows } = await q('SELECT * FROM carts WHERE user_id = ? AND status = ? ORDER BY id DESC LIMIT 1', [userId, 'active']);
    return Array.isArray(rows) ? rows[0] || null : null;
  }
}

// PUBLIC_INTERFACE
async function addItemToCart(cartId, menuItemId, quantity, unitPriceCents, currency = 'USD', notes = null) {
  /** Upsert-like behavior to add or increment an item in a cart. */
  const q = getQuery();
  try {
    const { rows } = await q('SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND menu_item_id = $2 LIMIT 1', [cartId, menuItemId]);
    if (rows && rows[0]) {
      const newQty = rows[0].quantity + quantity;
      await q('UPDATE cart_items SET quantity = $1, unit_price_cents = $2, currency = $3, notes = $4 WHERE id = $5', [newQty, unitPriceCents, currency, notes, rows[0].id]);
      return true;
    }
  } catch (_) {
    const { rows } = await q('SELECT id, quantity FROM cart_items WHERE cart_id = ? AND menu_item_id = ? LIMIT 1', [cartId, menuItemId]);
    if (Array.isArray(rows) && rows[0]) {
      const newQty = rows[0].quantity + quantity;
      await q('UPDATE cart_items SET quantity = ?, unit_price_cents = ?, currency = ?, notes = ? WHERE id = ?', [newQty, unitPriceCents, currency, notes, rows[0].id]);
      return true;
    }
  }
  try {
    await q('INSERT INTO cart_items (cart_id, menu_item_id, quantity, unit_price_cents, currency, notes) VALUES ($1, $2, $3, $4, $5, $6)', [cartId, menuItemId, quantity, unitPriceCents, currency, notes]);
  } catch (e) {
    await q('INSERT INTO cart_items (cart_id, menu_item_id, quantity, unit_price_cents, currency, notes) VALUES (?, ?, ?, ?, ?, ?)', [cartId, menuItemId, quantity, unitPriceCents, currency, notes]);
  }
  return true;
}

// PUBLIC_INTERFACE
async function getOrderOwner(orderId) {
  /** Returns user_id for an order id. */
  const q = getQuery();
  try {
    const { rows } = await q('SELECT user_id FROM orders WHERE id = $1', [orderId]);
    return rows?.[0]?.user_id || null;
  } catch (_) {
    const { rows } = await q('SELECT user_id FROM orders WHERE id = ?', [orderId]);
    return Array.isArray(rows) ? rows[0]?.user_id || null : null;
  }
}

module.exports = {
  findUserByEmail,
  createUser,
  getActiveCart,
  addItemToCart,
  getOrderOwner,
};

