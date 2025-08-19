'use strict';

const { getQuery } = require('../db');
const { getActiveCart, addItemToCart } = require('../db/queries');
const menuService = require('./menu');

class CartService {
  // PUBLIC_INTERFACE
  async getOrCreateActiveCart(userId) {
    /** Returns active cart row for user. */
    return getActiveCart(userId);
  }

  // PUBLIC_INTERFACE
  async getCartWithItems(userId) {
    /** Fetch active cart with items and totals. */
    const cart = await this.getOrCreateActiveCart(userId);
    const q = getQuery();
    let items = [];
    try {
      const { rows } = await q(
        `SELECT ci.id, ci.menu_item_id, mi.name, ci.quantity, ci.unit_price_cents, ci.currency, ci.notes
         FROM cart_items ci
         JOIN menu_items mi ON mi.id = ci.menu_item_id
         WHERE ci.cart_id = $1
         ORDER BY ci.id ASC`,
        [cart.id]
      );
      items = rows;
    } catch (_) {
      const { rows } = await q(
        `SELECT ci.id, ci.menu_item_id, mi.name, ci.quantity, ci.unit_price_cents, ci.currency, ci.notes
         FROM cart_items ci
         JOIN menu_items mi ON mi.id = ci.menu_item_id
         WHERE ci.cart_id = ?
         ORDER BY ci.id ASC`,
        [cart.id]
      );
      items = rows;
    }
    const total_cents = items.reduce((sum, it) => sum + it.quantity * it.unit_price_cents, 0);
    return { cart, items, total_cents, currency: items[0]?.currency || 'USD' };
  }

  // PUBLIC_INTERFACE
  async addItem(userId, { menu_item_id, quantity = 1, notes = null }) {
    /** Add item to user's active cart, using current menu price. */
    if (quantity <= 0) {
      const err = new Error('Quantity must be positive');
      err.status = 400;
      throw err;
    }
    const item = await menuService.getMenuItem(menu_item_id);
    if (!item || !item.is_available) {
      const err = new Error('Menu item not available');
      err.status = 404;
      throw err;
    }
    const cart = await this.getOrCreateActiveCart(userId);
    // set restaurant_id for cart if not set
    if (!cart.restaurant_id) {
      const q = getQuery();
      try {
        await q('UPDATE carts SET restaurant_id = $1 WHERE id = $2', [item.restaurant_id, cart.id]);
      } catch (_) {
        await q('UPDATE carts SET restaurant_id = ? WHERE id = ?', [item.restaurant_id, cart.id]);
      }
    }
    await addItemToCart(cart.id, item.id, quantity, item.price_cents, item.currency, notes);
    return this.getCartWithItems(userId);
  }

  // PUBLIC_INTERFACE
  async updateItem(userId, cart_item_id, { quantity, notes }) {
    /** Update quantity/notes for a specific cart_item. */
    const cart = await this.getOrCreateActiveCart(userId);
    const q = getQuery();
    if (quantity !== undefined) {
      if (quantity <= 0) {
        // delete instead
        return this.removeItem(userId, cart_item_id);
      }
      try {
        await q('UPDATE cart_items SET quantity = $1, notes = COALESCE($2, notes) WHERE id = $3 AND cart_id = $4', [quantity, notes || null, cart_item_id, cart.id]);
      } catch (_) {
        await q('UPDATE cart_items SET quantity = ?, notes = COALESCE(?, notes) WHERE id = ? AND cart_id = ?', [quantity, notes || null, cart_item_id, cart.id]);
      }
    } else if (notes !== undefined) {
      try {
        await q('UPDATE cart_items SET notes = $1 WHERE id = $2 AND cart_id = $3', [notes || null, cart_item_id, cart.id]);
      } catch (_) {
        await q('UPDATE cart_items SET notes = ? WHERE id = ? AND cart_id = ?', [notes || null, cart_item_id, cart.id]);
      }
    }
    return this.getCartWithItems(userId);
  }

  // PUBLIC_INTERFACE
  async removeItem(userId, cart_item_id) {
    /** Remove an item from cart. */
    const cart = await this.getOrCreateActiveCart(userId);
    const q = getQuery();
    try {
      await q('DELETE FROM cart_items WHERE id = $1 AND cart_id = $2', [cart_item_id, cart.id]);
    } catch (_) {
      await q('DELETE FROM cart_items WHERE id = ? AND cart_id = ?', [cart_item_id, cart.id]);
    }
    return this.getCartWithItems(userId);
  }

  // PUBLIC_INTERFACE
  async clear(userId) {
    /** Remove all items and reset restaurant binding for active cart. */
    const cart = await this.getOrCreateActiveCart(userId);
    const q = getQuery();
    try {
      await q('DELETE FROM cart_items WHERE cart_id = $1', [cart.id]);
      await q('UPDATE carts SET restaurant_id = NULL WHERE id = $1', [cart.id]);
    } catch (_) {
      await q('DELETE FROM cart_items WHERE cart_id = ?', [cart.id]);
      await q('UPDATE carts SET restaurant_id = NULL WHERE id = ?', [cart.id]);
    }
    return this.getCartWithItems(userId);
  }
}

module.exports = new CartService();
