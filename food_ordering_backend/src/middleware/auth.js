'use strict';

const jwt = require('jsonwebtoken');
const config = require('../config');
const { unauthorized, forbidden } = require('../utils/response');

/**
 * Authenticate using Bearer JWT.
 */
function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return unauthorized(res, 'Missing or invalid Authorization header');
  }
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = { id: payload.sub, email: payload.email, name: payload.name };
    return next();
  } catch (e) {
    return unauthorized(res, 'Invalid or expired token');
  }
}

/**
 * Require specific roles - placeholder for future role-based access.
 */
function requireRole(role) {
  return function (req, res, next) {
    // In this mock, no roles are implemented.
    return forbidden(res, 'Role-based access control not implemented');
  };
}

module.exports = {
  authenticate,
  requireRole,
};
