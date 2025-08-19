'use strict';

const cartService = require('../services/cart');
const { ok } = require('../utils/response');

class CartController {
  // PUBLIC_INTERFACE
  getCart(req, res) {
    /** Get current user's cart items */
    const items = cartService.getUserCart(req.user.id);
    return ok(res, items);
  }

  // PUBLIC_INTERFACE
  addItem(req, res) {
    /** Add an item to cart */
    const { itemId, qty } = req.body;
    const items = cartService.addItem(req.user.id, itemId, qty || 1);
    return ok(res, items, 'Item added to cart');
  }

  // PUBLIC_INTERFACE
  removeItem(req, res) {
    /** Remove item from cart */
    const { itemId } = req.params;
    const items = cartService.removeItem(req.user.id, itemId);
    return ok(res, items, 'Item removed from cart');
  }

  // PUBLIC_INTERFACE
  clear(req, res) {
    /** Clear cart */
    const items = cartService.clear(req.user.id);
    return ok(res, items, 'Cart cleared');
  }
}

module.exports = new CartController();
