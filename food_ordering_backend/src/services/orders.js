'use strict';

const {
  getCart,
  setCart,
  getMenuItem,
  createOrder,
  listOrdersByUser,
  getOrderById,
  updateOrderStatus,
} = require('../data/store');

class OrdersService {
  // PUBLIC_INTERFACE
  placeOrder(userId) {
    /** Convert cart to order and clear cart */
    const cart = getCart(userId);
    if (!cart || cart.length === 0) {
      const e = new Error('Cart is empty');
      e.code = 'CART_EMPTY';
      throw e;
    }
    const detailedItems = cart.map(ci => {
      const item = getMenuItem(ci.itemId);
      if (!item) {
        const er = new Error(`Menu item not found: ${ci.itemId}`);
        er.code = 'INVALID_ITEM';
        throw er;
      }
      return {
        itemId: item.id,
        name: item.name,
        price: item.price,
        qty: ci.qty,
        restaurantId: item.restaurantId,
      };
    });
    const restaurantId = detailedItems[0].restaurantId;
    const mixedRestaurant = detailedItems.some(i => i.restaurantId !== restaurantId);
    if (mixedRestaurant) {
      const e = new Error('All items in the order must be from the same restaurant');
      e.code = 'MIXED_RESTAURANT';
      throw e;
    }
    const total = detailedItems.reduce((sum, i) => sum + i.price * i.qty, 0);
    const order = createOrder({
      userId,
      items: detailedItems.map(({ restaurantId, ...rest }) => rest),
      total: parseFloat(total.toFixed(2)),
      restaurantId,
    });
    setCart(userId, []);
    return order;
  }

  // PUBLIC_INTERFACE
  getHistory(userId) {
    /** Get all orders for a user */
    return listOrdersByUser(userId);
  }

  // PUBLIC_INTERFACE
  getOrder(userId, orderId) {
    /** Get an order if it belongs to the user */
    const ord = getOrderById(orderId);
    if (!ord) return null;
    if (ord.userId !== userId) return null;
    return ord;
  }

  // PUBLIC_INTERFACE
  updateStatus(orderId, status) {
    /** Update order status (used by admin/restaurant in real app) */
    return updateOrderStatus(orderId, status);
  }
}

module.exports = new OrdersService();
