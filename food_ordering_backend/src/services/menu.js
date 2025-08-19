'use strict';

const { listRestaurants, listMenuByRestaurant, getRestaurantById } = require('../data/store');

class MenuService {
  // PUBLIC_INTERFACE
  listRestaurants() {
    /** Return all restaurants */
    return listRestaurants();
  }

  // PUBLIC_INTERFACE
  listMenu(restaurantId) {
    /** Return menu items for a restaurant */
    const rest = getRestaurantById(restaurantId);
    if (!rest) {
      const e = new Error('Restaurant not found');
      e.code = 'NOT_FOUND';
      throw e;
    }
    return listMenuByRestaurant(restaurantId);
  }
}

module.exports = new MenuService();
