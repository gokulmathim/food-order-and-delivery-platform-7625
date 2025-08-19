'use strict';

const { badRequest } = require('../utils/response');

/**
 * Simple validator factory for expected fields in req.body.
 */
function validateBody(requiredFields = []) {
  return function (req, res, next) {
    const errors = [];
    for (const field of requiredFields) {
      if (typeof field === 'string') {
        if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
          errors.push({ field, message: 'is required' });
        }
      } else if (typeof field === 'object' && field.name) {
        const value = req.body[field.name];
        if (value === undefined || value === null || value === '') {
          errors.push({ field: field.name, message: 'is required' });
        } else if (field.type && typeof value !== field.type) {
          errors.push({ field: field.name, message: `must be ${field.type}` });
        }
      }
    }
    if (errors.length > 0) return badRequest(res, 'Validation failed', errors);
    return next();
  };
}

module.exports = {
  validateBody,
};
