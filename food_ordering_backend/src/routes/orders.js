'use strict';

const express = require('express');
const controller = require('../controllers/orders');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Orders
 */

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: List orders
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: offset
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Orders list
 */
router.get('/', authRequired, controller.list.bind(controller));

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Place order from active cart
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               delivery_address: { type: string }
 *               delivery_lat: { type: number }
 *               delivery_lng: { type: number }
 *     responses:
 *       201:
 *         description: Order created
 */
router.post('/', authRequired, controller.place.bind(controller));

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order details
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Order details
 *       404:
 *         description: Not found
 */
router.get('/:id', authRequired, controller.get.bind(controller));

module.exports = router;
