'use strict';
/**
 * In-memory store to simulate database.
 * This can be replaced with a real DB adapter in the future.
 */

const crypto = require('crypto');

function genId(prefix) {
  const id = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
  return `${prefix}_${id}`;
}

// Mock restaurants and menus
const restaurants = [
  { id: 'rest_1', name: 'Spice Villa', cuisine: 'Indian' },
  { id: 'rest_2', name: 'Pasta Palace', cuisine: 'Italian' },
];

const menuItems = [
  { id: 'item_1', restaurantId: 'rest_1', name: 'Butter Chicken', price: 12.99, description: 'Creamy tomato sauce with tender chicken.' },
  { id: 'item_2', restaurantId: 'rest_1', name: 'Paneer Tikka', price: 9.49, description: 'Grilled cottage cheese cubes with spices.' },
  { id: 'item_3', restaurantId: 'rest_2', name: 'Spaghetti Carbonara', price: 13.5, description: 'Classic pasta with eggs, cheese, and pancetta.' },
  { id: 'item_4', restaurantId: 'rest_2', name: 'Margherita Pizza', price: 10.99, description: 'Tomato, mozzarella, and basil.' },
];

// Users: { id, email, passwordHash, name }
const users = [];

// Carts: Map userId -> [{ itemId, qty }]
const carts = new Map();

// Orders: { id, userId, items: [{itemId, qty, price}], total, status, restaurantId, createdAt }
const orders = [];

// Payments: { id, orderId, amount, status, providerRef, createdAt }
const payments = [];

// PUBLIC_INTERFACE
function resetStore() {
  /** Reset the in-memory store. Mainly used in tests/development. */
  users.length = 0;
  carts.clear();
  orders.length = 0;
  payments.length = 0;
}

// PUBLIC_INTERFACE
function addUser(user) {
  /** Add a user to store. Expects {id,email,passwordHash,name} */
  users.push(user);
  return user;
}

// PUBLIC_INTERFACE
function findUserByEmail(email) {
  /** Find a user by email */
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

// PUBLIC_INTERFACE
function findUserById(id) {
  /** Find a user by id */
  return users.find(u => u.id === id);
}

// PUBLIC_INTERFACE
function listRestaurants() {
  /** List all restaurants */
  return restaurants.slice();
}

// PUBLIC_INTERFACE
function getRestaurantById(id) {
  /** Get a single restaurant */
  return restaurants.find(r => r.id === id);
}

// PUBLIC_INTERFACE
function listMenuByRestaurant(restaurantId) {
  /** List menu items for a restaurant */
  return menuItems.filter(m => m.restaurantId === restaurantId);
}

// PUBLIC_INTERFACE
function getMenuItem(itemId) {
  /** Get a menu item by id */
  return menuItems.find(m => m.id === itemId);
}

// PUBLIC_INTERFACE
function getCart(userId) {
  /** Get cart items for a user */
  return carts.get(userId) || [];
}

// PUBLIC_INTERFACE
function setCart(userId, items) {
  /** Set cart items for a user */
  carts.set(userId, items);
  return items;
}

// PUBLIC_INTERFACE
function createOrder({ userId, items, total, restaurantId }) {
  /** Create a new order record */
  const id = genId('ord');
  const order = {
    id,
    userId,
    items,
    total,
    restaurantId,
    status: 'pending', // pending -> confirmed -> preparing -> out_for_delivery -> delivered / cancelled
    createdAt: new Date().toISOString(),
  };
  orders.push(order);
  return order;
}

// PUBLIC_INTERFACE
function listOrdersByUser(userId) {
  /** List all orders for a user */
  return orders.filter(o => o.userId === userId);
}

// PUBLIC_INTERFACE
function getOrderById(orderId) {
  /** Get order by id */
  return orders.find(o => o.id === orderId);
}

// PUBLIC_INTERFACE
function updateOrderStatus(orderId, status) {
  /** Update order status */
  const ord = orders.find(o => o.id === orderId);
  if (!ord) return null;
  ord.status = status;
  return ord;
}

// PUBLIC_INTERFACE
function createPayment({ orderId, amount, status, providerRef }) {
  /** Create payment record */
  const id = genId('pay');
  const payment = {
    id,
    orderId,
    amount,
    status,
    providerRef,
    createdAt: new Date().toISOString(),
  };
  payments.push(payment);
  return payment;
}

// PUBLIC_INTERFACE
function listPaymentsByOrder(orderId) {
  /** List payments for an order */
  return payments.filter(p => p.orderId === orderId);
}

module.exports = {
  resetStore,
  addUser,
  findUserByEmail,
  findUserById,
  listRestaurants,
  getRestaurantById,
  listMenuByRestaurant,
  getMenuItem,
  getCart,
  setCart,
  createOrder,
  listOrdersByUser,
  getOrderById,
  updateOrderStatus,
  createPayment,
  listPaymentsByOrder,
};
