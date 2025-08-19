'use strict';

const express = require('express');
const controller = require('../controllers/restaurants');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Restaurants
 *   description: Restaurants and menus
 */

/**
 * @swagger
 * /restaurants:
 *   get:
 *     summary: List restaurants
 *     tags: [Restaurants]
 *     parameters:
 *       - in: query
 *         name: city
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: offset
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: List of restaurants
 */
router.get('/', controller.list.bind(controller));

/**
 * @swagger
 * /restaurants/{id}/menu:
 *   get:
 *     summary: Restaurant menu
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Categories and items
 *       404:
 *         description: Not found
 */
router.get('/:id/menu', controller.menu.bind(controller));

module.exports = router;
