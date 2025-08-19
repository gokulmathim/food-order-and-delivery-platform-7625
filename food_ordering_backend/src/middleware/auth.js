'use strict';

const jwt = require('jsonwebtoken');

const { JWT_SECRET = 'change_me_please' } = process.env;

/**
// PUBLIC_INTERFACE
 */
function authRequired(req, res, next) {
  /** Middleware to enforce JWT auth via Authorization: Bearer <token>. */
  const header = req.headers['authorization'] || '';
  const [, token] = header.split(' ');
  if (!token) {
    return res.status(401).json({ message: 'Missing bearer token' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

/**
// PUBLIC_INTERFACE
 */
function optionalAuth(req, _res, next) {
  /** Attach req.user if valid token present, otherwise continue. */
  const header = req.headers['authorization'] || '';
  const [, token] = header.split(' ');
  if (!token) {
    return next();
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
  } catch (_) {
    // ignore invalid tokens
  }
  return next();
}

module.exports = { authRequired, optionalAuth };
