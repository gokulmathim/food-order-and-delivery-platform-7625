'use strict';
/**
 * Application configuration loader.
 * Reads environment variables and exposes typed configuration.
 * Note: Do not write .env here. The orchestrator will set envs.
 */
require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  host: process.env.HOST || '0.0.0.0',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  paymentProviderKey: process.env.PAYMENT_PROVIDER_KEY || 'mock-payment-key',
};

module.exports = config;
