'use strict';

const authService = require('../services/auth');
const { ok, created, badRequest } = require('../utils/response');

class AuthController {
  /**
   * Register a new user
   */
  // PUBLIC_INTERFACE
  async register(req, res) {
    /** Register a new user with name, email, and password, returns token and user. */
    const { name, email, password } = req.body;
    try {
      const result = await authService.register({ name, email, password });
      return created(res, result, 'User registered');
    } catch (e) {
      if (e.code === 'EMAIL_EXISTS') return badRequest(res, e.message);
      return badRequest(res, 'Registration failed');
    }
  }

  /**
   * Login user
   */
  // PUBLIC_INTERFACE
  async login(req, res) {
    /** Login with email and password, returns token and user. */
    const { email, password } = req.body;
    try {
      const result = await authService.login({ email, password });
      return ok(res, result, 'Logged in');
    } catch (e) {
      return badRequest(res, 'Invalid email or password');
    }
  }

  /**
   * Get current user profile (from JWT)
   */
  // PUBLIC_INTERFACE
  async me(req, res) {
    /** Return the current authenticated user's info from token. */
    return ok(res, { user: req.user });
  }
}

module.exports = new AuthController();
