'use strict';

const menuService = require('../services/menu');
const { ok, notFound } = require('../utils/response');

class MenuController {
  // PUBLIC_INTERFACE
  listRestaurants(req, res) {
    /** List all restaurants */
    const data = menuService.listRestaurants();
    return ok(res, data);
  }

  // PUBLIC_INTERFACE
  listMenu(req, res) {
    /** List menu items for a restaurant */
    const { restaurantId } = req.params;
    try {
      const data = menuService.listMenu(restaurantId);
      return ok(res, data);
    } catch (e) {
      if (e.code === 'NOT_FOUND') return notFound(res, e.message);
      throw e;
    }
  }
}

module.exports = new MenuController();
