const express = require('express');
const healthController = require('../controllers/health');
const AuthController = require('../controllers/auth');
const MenuController = require('../controllers/menu');
const CartController = require('../controllers/cart');
const OrdersController = require('../controllers/orders');
const PaymentsController = require('../controllers/payments');
const { authenticate } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Health
 *     description: Service health check
 *   - name: Auth
 *     description: User authentication and profile
 *   - name: Menu
 *     description: Restaurants and menus
 *   - name: Cart
 *     description: Shopping cart operations
 *   - name: Orders
 *     description: Order placement and history
 *   - name: Payments
 *     description: Payment processing
 */

/**
 * @swagger
 * /:
 *   get:
 *     tags: [Health]
 *     summary: Health endpoint
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

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: John Doe }
 *               email: { type: string, example: john@example.com }
 *               password: { type: string, example: Passw0rd! }
 *     responses:
 *       201:
 *         description: User registered
 */
router.post(
  '/auth/register',
  validateBody(['name', 'email', 'password']),
  (req, res) => AuthController.register(req, res)
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login user and get JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: john@example.com }
 *               password: { type: string, example: Passw0rd! }
 *     responses:
 *       200:
 *         description: Logged in
 */
router.post(
  '/auth/login',
  validateBody(['email', 'password']),
  (req, res) => AuthController.login(req, res)
);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 */
router.get('/auth/me', authenticate, (req, res) => AuthController.me(req, res));

/**
 * @swagger
 * /restaurants:
 *   get:
 *     tags: [Menu]
 *     summary: List restaurants
 *     responses:
 *       200:
 *         description: List of restaurants
 */
router.get('/restaurants', (req, res) => MenuController.listRestaurants(req, res));

/**
 * @swagger
 * /restaurants/{restaurantId}/menu:
 *   get:
 *     tags: [Menu]
 *     summary: List menu for a restaurant
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of menu items
 *       404:
 *         description: Restaurant not found
 */
router.get('/restaurants/:restaurantId/menu', (req, res) => MenuController.listMenu(req, res));

/**
 * @swagger
 * /cart:
 *   get:
 *     tags: [Cart]
 *     summary: Get current user's cart
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: User cart
 */
router.get('/cart', authenticate, (req, res) => CartController.getCart(req, res));

/**
 * @swagger
 * /cart:
 *   post:
 *     tags: [Cart]
 *     summary: Add item to cart
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [itemId, qty]
 *             properties:
 *               itemId: { type: string }
 *               qty: { type: number, example: 1 }
 *     responses:
 *       200:
 *         description: Item added
 */
router.post('/cart', authenticate, validateBody(['itemId']), (req, res) => CartController.addItem(req, res));

/**
 * @swagger
 * /cart/{itemId}:
 *   delete:
 *     tags: [Cart]
 *     summary: Remove item from cart
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Item removed
 */
router.delete('/cart/:itemId', authenticate, (req, res) => CartController.removeItem(req, res));

/**
 * @swagger
 * /cart/clear:
 *   post:
 *     tags: [Cart]
 *     summary: Clear cart
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Cart cleared
 */
router.post('/cart/clear', authenticate, (req, res) => CartController.clear(req, res));

/**
 * @swagger
 * /orders:
 *   post:
 *     tags: [Orders]
 *     summary: Place order from current cart
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Order placed
 *       400:
 *         description: Invalid cart or items
 */
router.post('/orders', authenticate, (req, res) => OrdersController.place(req, res));

/**
 * @swagger
 * /orders:
 *   get:
 *     tags: [Orders]
 *     summary: Get order history
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Orders history
 */
router.get('/orders', authenticate, (req, res) => OrdersController.history(req, res));

/**
 * @swagger
 * /orders/{orderId}:
 *   get:
 *     tags: [Orders]
 *     summary: Get specific order
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Order details
 *       404:
 *         description: Order not found
 */
router.get('/orders/:orderId', authenticate, (req, res) => OrdersController.getOne(req, res));

/**
 * @swagger
 * /payments:
 *   post:
 *     tags: [Payments]
 *     summary: Process payment for an order
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId]
 *             properties:
 *               orderId: { type: string }
 *               method: { type: string, example: card }
 *     responses:
 *       200:
 *         description: Payment processed
 *       400:
 *         description: Payment error
 */
router.post('/payments', authenticate, validateBody(['orderId']), (req, res) => PaymentsController.pay(req, res));

module.exports = router;
