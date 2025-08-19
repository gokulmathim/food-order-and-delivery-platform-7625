const express = require('express');
const healthController = require('../controllers/health');

const authRoutes = require('./auth');
const restaurantsRoutes = require('./restaurants');
const cartRoutes = require('./cart');
const ordersRoutes = require('./orders');
const paymentsRoutes = require('./payments');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: Service health
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: Health endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service health check passed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Service is healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                   example: development
 */
router.get('/', healthController.check.bind(healthController));

// Mount API groups
router.use('/auth', authRoutes);
router.use('/restaurants', restaurantsRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', ordersRoutes);
router.use('/payments', paymentsRoutes);

module.exports = router;
