'use strict';

const ordersService = require('../services/orders');

class OrdersController {
  // PUBLIC_INTERFACE
  async place(req, res) {
    /** Place order from active cart. Body: {delivery_address?, delivery_lat?, delivery_lng?}. */
    try {
      const { delivery_address, delivery_lat, delivery_lng } = req.body || {};
      const order = await ordersService.placeOrder(req.user.id, { delivery_address, delivery_lat, delivery_lng });
      return res.status(201).json({ order });
    } catch (e) {
      return res.status(e.status || 500).json({ message: e.message || 'Failed to place order' });
    }
  }

  // PUBLIC_INTERFACE
  async list(req, res) {
    /** List orders for user. */
    try {
      const { limit, offset } = req.query || {};
      const orders = await ordersService.listOrders(req.user.id, { limit: limit ? Number(limit) : undefined, offset: offset ? Number(offset) : undefined });
      return res.json({ orders });
    } catch (e) {
      return res.status(500).json({ message: e.message || 'Failed to list orders' });
    }
  }

  // PUBLIC_INTERFACE
  async get(req, res) {
    /** Get single order with items. */
    try {
      const { id } = req.params;
      const order = await ordersService.getOrder(req.user.id, Number(id));
      if (!order) return res.status(404).json({ message: 'Order not found' });
      return res.json({ order });
    } catch (e) {
      return res.status(500).json({ message: e.message || 'Failed to fetch order' });
    }
  }
}

module.exports = new OrdersController();
