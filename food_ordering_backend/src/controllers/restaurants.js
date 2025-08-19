'use strict';

const menuService = require('../services/menu');

class RestaurantsController {
  // PUBLIC_INTERFACE
  async list(req, res) {
    /** List restaurants with optional filters: city, search, limit, offset. */
    try {
      const { city, search, limit, offset } = req.query || {};
      const rows = await menuService.listRestaurants({
        city,
        search,
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined,
      });
      return res.json({ restaurants: rows });
    } catch (e) {
      return res.status(500).json({ message: e.message || 'Failed to list restaurants' });
    }
  }

  // PUBLIC_INTERFACE
  async menu(req, res) {
    /** Get menu for a restaurant: returns categories and items. */
    try {
      const { id } = req.params;
      const data = await menuService.getRestaurantMenu(Number(id));
      return res.json(data);
    } catch (e) {
      return res.status(500).json({ message: e.message || 'Failed to fetch menu' });
    }
  }
}

module.exports = new RestaurantsController();
