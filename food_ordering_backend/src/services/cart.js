'use strict';

const { getCart, setCart, getMenuItem } = require('../data/store');

class CartService {
  // PUBLIC_INTERFACE
  getUserCart(userId) {
    /** Get current user's cart items */
    return getCart(userId);
  }

  // PUBLIC_INTERFACE
  addItem(userId, itemId, qty = 1) {
    /** Add or increase an item in the cart */
    const item = getMenuItem(itemId);
    if (!item) {
      const e = new Error('Item not found');
      e.code = 'NOT_FOUND';
      throw e;
    }
    const cart = getCart(userId).slice();
    const existing = cart.find(ci => ci.itemId === itemId);
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ itemId, qty });
    }
    setCart(userId, cart);
    return cart;
  }

  // PUBLIC_INTERFACE
  removeItem(userId, itemId) {
    /** Remove an item from the cart */
    const cart = getCart(userId).slice();
    const filtered = cart.filter(ci => ci.itemId !== itemId);
    setCart(userId, filtered);
    return filtered;
  }

  // PUBLIC_INTERFACE
  clear(userId) {
    /** Clear a user's cart */
    setCart(userId, []);
    return [];
  }
}

module.exports = new CartService();
