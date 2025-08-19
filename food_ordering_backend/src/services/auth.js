'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { addUser, findUserByEmail } = require('../data/store');

/**
 * Service for authentication flows.
 */
class AuthService {
  // PUBLIC_INTERFACE
  async register({ name, email, password }) {
    /** Register a new user with hashed password and return user & token. */
    const existing = findUserByEmail(email);
    if (existing) {
      const err = new Error('Email already registered');
      err.code = 'EMAIL_EXISTS';
      throw err;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const id = `usr_${Date.now()}`;
    const user = addUser({ id, name, email, passwordHash });
    const token = this._signToken(user);
    return { user: { id: user.id, name: user.name, email: user.email }, token };
  }

  // PUBLIC_INTERFACE
  async login({ email, password }) {
    /** Authenticate user by email/password and return token. */
    const user = findUserByEmail(email);
    if (!user) {
      const e = new Error('Invalid credentials');
      e.code = 'INVALID_CREDENTIALS';
      throw e;
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      const e = new Error('Invalid credentials');
      e.code = 'INVALID_CREDENTIALS';
      throw e;
    }
    const token = this._signToken(user);
    return { user: { id: user.id, name: user.name, email: user.email }, token };
  }

  _signToken(user) {
    return jwt.sign(
      { sub: user.id, email: user.email, name: user.name },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
  }
}

module.exports = new AuthService();
