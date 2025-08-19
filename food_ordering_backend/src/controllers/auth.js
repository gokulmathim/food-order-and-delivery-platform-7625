'use strict';

const authService = require('../services/auth');

class AuthController {
  // PUBLIC_INTERFACE
  async register(req, res) {
    /** Register endpoint: body {email, password, full_name, phone} returns {token, user}. */
    try {
      const { email, password, full_name, phone } = req.body || {};
      if (!email || !password) {
        return res.status(400).json({ message: 'email and password required' });
      }
      const result = await authService.register({ email, password, full_name, phone });
      return res.status(201).json(result);
    } catch (e) {
      return res.status(e.status || 500).json({ message: e.message || 'Registration failed' });
    }
  }

  // PUBLIC_INTERFACE
  async login(req, res) {
    /** Login endpoint: body {email, password} returns {token, user}. */
    try {
      const { email, password } = req.body || {};
      if (!email || !password) {
        return res.status(400).json({ message: 'email and password required' });
      }
      const result = await authService.login({ email, password });
      return res.status(200).json(result);
    } catch (e) {
      return res.status(e.status || 500).json({ message: e.message || 'Login failed' });
    }
  }

  // PUBLIC_INTERFACE
  async me(req, res) {
    /** Return current user info from JWT. */
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    return res.json({ user: req.user });
  }
}

module.exports = new AuthController();
