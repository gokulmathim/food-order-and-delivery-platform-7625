'use strict';

const { getQuery } = require('../db');

class MenuService {
  // PUBLIC_INTERFACE
  async listRestaurants({ city, search, limit = 50, offset = 0 } = {}) {
    /** List restaurants with optional city and name search. */
    const q = getQuery();
    const params = [];
    let where = [];
    if (city) {
      params.push(city);
      where.push(`city = $${params.length}`);
    }
    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      where.push(`LOWER(name) LIKE $${params.length}`);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const sql = `SELECT id, name, description, cuisine_type, logo_url, city, rating, is_open
                 FROM restaurants
                 ${whereSql}
                 ORDER BY rating DESC, name ASC
                 LIMIT ${Number(limit)} OFFSET ${Number(offset)}`;
    try {
      const { rows } = await q(sql, params);
      return rows;
    } catch (_) {
      // MySQL fallback
      const myParams = [];
      let myWhere = [];
      if (city) {
        myParams.push(city);
        myWhere.push('city = ?');
      }
      if (search) {
        myParams.push(`%${search.toLowerCase()}%`);
        myWhere.push('LOWER(name) LIKE ?');
      }
      const myWhereSql = myWhere.length ? `WHERE ${myWhere.join(' AND ')}` : '';
      const { rows } = await q(
        `SELECT id, name, description, cuisine_type, logo_url, city, rating, is_open
         FROM restaurants
         ${myWhereSql}
         ORDER BY rating DESC, name ASC
         LIMIT ${Number(limit)} OFFSET ${Number(offset)}`,
        myParams
      );
      return rows;
    }
  }

  // PUBLIC_INTERFACE
  async getRestaurantMenu(restaurantId) {
    /** Returns categories and items for a restaurant. */
    const q = getQuery();
    // categories
    let categories = [];
    try {
      const { rows } = await q(
        'SELECT id, name, description, position FROM categories WHERE restaurant_id = $1 ORDER BY position ASC, id ASC',
        [restaurantId]
      );
      categories = rows;
    } catch (_) {
      const { rows } = await q(
        'SELECT id, name, description, position FROM categories WHERE restaurant_id = ? ORDER BY position ASC, id ASC',
        [restaurantId]
      );
      categories = rows;
    }
    // items
    let items = [];
    try {
      const { rows } = await q(
        'SELECT id, category_id, name, description, image_url, price_cents, currency, is_available FROM menu_items WHERE restaurant_id = $1 ORDER BY id ASC',
        [restaurantId]
      );
      items = rows;
    } catch (_) {
      const { rows } = await q(
        'SELECT id, category_id, name, description, image_url, price_cents, currency, is_available FROM menu_items WHERE restaurant_id = ? ORDER BY id ASC',
        [restaurantId]
      );
      items = rows;
    }
    return { categories, items };
  }

  // PUBLIC_INTERFACE
  async getMenuItem(menuItemId) {
    /** Return a menu item row minimal fields. */
    const q = getQuery();
    try {
      const { rows } = await q(
        'SELECT id, restaurant_id, name, price_cents, currency, is_available FROM menu_items WHERE id = $1 LIMIT 1',
        [menuItemId]
      );
      return rows?.[0] || null;
    } catch (_) {
      const { rows } = await q(
        'SELECT id, restaurant_id, name, price_cents, currency, is_available FROM menu_items WHERE id = ? LIMIT 1',
        [menuItemId]
      );
      return Array.isArray(rows) ? rows[0] || null : null;
    }
  }
}

module.exports = new MenuService();
