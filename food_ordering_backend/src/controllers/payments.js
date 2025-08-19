'use strict';

const paymentsService = require('../services/payments');
const { ok, badRequest } = require('../utils/response');

class PaymentsController {
  // PUBLIC_INTERFACE
  pay(req, res) {
    /** Process payment for an order belonging to current user */
    const { orderId, method } = req.body;
    try {
      const result = paymentsService.processPayment({ userId: req.user.id, orderId, method });
      return ok(res, result, 'Payment succeeded');
    } catch (e) {
      if (e.code === 'NOT_FOUND') return badRequest(res, e.message);
      throw e;
    }
  }
}

module.exports = new PaymentsController();
