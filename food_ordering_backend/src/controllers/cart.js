'use strict';

const cartService = require('../services/cart');

class CartController {
  // PUBLIC_INTERFACE
  async get(req, res) {
    /** Get active cart with items and totals. Auth required. */
    try {
      const data = await cartService.getCartWithItems(req.user.id);
      return res.json(data);
    } catch (e) {
      return res.status(e.status || 500).json({ message: e.message || 'Failed to load cart' });
    }
  }

  // PUBLIC_INTERFACE
  async add(req, res) {
    /** Add item to cart. Body: {menu_item_id, quantity, notes}. */
    try {
      const { menu_item_id, quantity, notes } = req.body || {};
      const data = await cartService.addItem(req.user.id, { menu_item_id, quantity, notes });
      return res.status(201).json(data);
    } catch (e) {
      return res.status(e.status || 500).json({ message: e.message || 'Failed to add item' });
    }
  }

  // PUBLIC_INTERFACE
  async update(req, res) {
    /** Update cart item. Body: {quantity?, notes?}. */
    try {
      const { id } = req.params;
      const { quantity, notes } = req.body || {};
      const data = await cartService.updateItem(req.user.id, Number(id), { quantity, notes });
      return res.json(data);
    } catch (e) {
      return res.status(e.status || 500).json({ message: e.message || 'Failed to update item' });
    }
  }

  // PUBLIC_INTERFACE
  async remove(req, res) {
    /** Remove cart item. */
    try {
      const { id } = req.params;
      const data = await cartService.removeItem(req.user.id, Number(id));
      return res.json(data);
    } catch (e) {
      return res.status(e.status || 500).json({ message: e.message || 'Failed to remove item' });
    }
  }

  // PUBLIC_INTERFACE
  async clear(req, res) {
    /** Clear cart. */
    try {
      const data = await cartService.clear(req.user.id);
      return res.json(data);
    } catch (e) {
      return res.status(e.status || 500).json({ message: e.message || 'Failed to clear cart' });
    }
  }
}

module.exports = new CartController();
