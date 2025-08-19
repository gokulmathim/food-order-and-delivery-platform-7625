'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { findUserByEmail, createUser } = require('../db/queries');

const {
  JWT_SECRET = 'change_me_please',
  JWT_EXPIRES_IN = '7d',
} = process.env;

class AuthService {
  // PUBLIC_INTERFACE
  async register({ email, password, full_name, phone }) {
    /** Register a user with email/password. Returns {token, user}. */
    const existing = await findUserByEmail(email);
    if (existing) {
      const err = new Error('Email already in use');
      err.status = 409;
      throw err;
    }
    const hashed = await bcrypt.hash(password, 10);
    const id = await createUser({
      email,
      hashed_password: hashed,
      full_name: full_name || null,
      phone: phone || null,
    });
    // fetch back minimal info if id not returned
    const created = id
      ? { id, email, full_name: full_name || null, phone: phone || null, role: 'customer' }
      : await findUserByEmail(email);

    const token = this._signToken({
      id: created.id,
      email: created.email,
      role: created.role || 'customer',
    });
    return { token, user: { id: created.id, email: created.email, full_name: created.full_name, role: created.role || 'customer' } };
  }

  // PUBLIC_INTERFACE
  async login({ email, password }) {
    /** Login with email/password. Returns {token, user}. */
    const user = await findUserByEmail(email);
    if (!user) {
      const err = new Error('Invalid credentials');
      err.status = 401;
      throw err;
    }
    const ok = await bcrypt.compare(password, user.hashed_password);
    if (!ok) {
      const err = new Error('Invalid credentials');
      err.status = 401;
      throw err;
    }
    const token = this._signToken({ id: user.id, email: user.email, role: user.role || 'customer' });
    return { token, user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role || 'customer' } };
  }

  _signToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }
}

module.exports = new AuthService();
