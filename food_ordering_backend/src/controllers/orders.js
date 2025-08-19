'use strict';

const ordersService = require('../services/orders');
const { ok, badRequest, notFound } = require('../utils/response');

class OrdersController {
  // PUBLIC_INTERFACE
  place(req, res) {
    /** Place order from current cart */
    try {
      const order = ordersService.placeOrder(req.user.id);
      return ok(res, order, 'Order placed');
    } catch (e) {
      if (e.code === 'CART_EMPTY' || e.code === 'MIXED_RESTAURANT' || e.code === 'INVALID_ITEM') {
        return badRequest(res, e.message);
      }
      throw e;
    }
  }

  // PUBLIC_INTERFACE
  history(req, res) {
    /** Get order history for current user */
    const list = ordersService.getHistory(req.user.id);
    return ok(res, list);
  }

  // PUBLIC_INTERFACE
  getOne(req, res) {
    /** Get order by id for current user */
    const { orderId } = req.params;
    const ord = ordersService.getOrder(req.user.id, orderId);
    if (!ord) return notFound(res, 'Order not found');
    return ok(res, ord);
  }
}

module.exports = new OrdersController();
