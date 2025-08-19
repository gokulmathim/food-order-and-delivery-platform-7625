'use strict';

const express = require('express');
const controller = require('../controllers/cart');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Cart management
 */

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get active cart
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Active cart with items
 */
router.get('/', authRequired, controller.get.bind(controller));

/**
 * @swagger
 * /cart/items:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [menu_item_id, quantity]
 *             properties:
 *               menu_item_id: { type: integer }
 *               quantity: { type: integer, minimum: 1 }
 *               notes: { type: string }
 *     responses:
 *       201:
 *         description: Item added
 */
router.post('/items', authRequired, controller.add.bind(controller));

/**
 * @swagger
 * /cart/items/{id}:
 *   patch:
 *     summary: Update cart item
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: integer }
 *         required: true
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity: { type: integer, minimum: 0 }
 *               notes: { type: string }
 *     responses:
 *       200:
 *         description: Updated cart
 */
router.patch('/items/:id', authRequired, controller.update.bind(controller));

/**
 * @swagger
 * /cart/items/{id}:
 *   delete:
 *     summary: Remove cart item
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: integer }
 *         required: true
 *     responses:
 *       200:
 *         description: Item removed
 */
router.delete('/items/:id', authRequired, controller.remove.bind(controller));

/**
 * @swagger
 * /cart/clear:
 *   post:
 *     summary: Clear cart
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Cart cleared
 */
router.post('/clear', authRequired, controller.clear.bind(controller));

module.exports = router;
