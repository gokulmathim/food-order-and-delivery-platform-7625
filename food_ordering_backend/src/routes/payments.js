'use strict';

const express = require('express');
const controller = require('../controllers/payments');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment intents and confirmation (mock)
 */

/**
 * @swagger
 * /payments/intents:
 *   post:
 *     summary: Create payment intent for an order
 *     tags: [Payments]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               order_id: { type: integer }
 *     responses:
 *       201:
 *         description: Payment intent created
 */
router.post('/intents', authRequired, controller.createIntent.bind(controller));

/**
 * @swagger
 * /payments/confirm:
 *   post:
 *     summary: Confirm payment
 *     tags: [Payments]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               order_id: { type: integer }
 *               client_secret: { type: string }
 *     responses:
 *       200:
 *         description: Payment confirmed
 */
router.post('/confirm', authRequired, controller.confirm.bind(controller));

module.exports = router;
