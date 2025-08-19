'use strict';

/**
 * Helper for consistent API responses.
 */
function ok(res, data = null, message = 'OK') {
  return res.status(200).json({ status: 'success', message, data });
}

function created(res, data = null, message = 'Created') {
  return res.status(201).json({ status: 'success', message, data });
}

function noContent(res) {
  return res.status(204).send();
}

function badRequest(res, message = 'Bad Request', details = null) {
  return res.status(400).json({ status: 'error', message, details });
}

function unauthorized(res, message = 'Unauthorized') {
  return res.status(401).json({ status: 'error', message });
}

function forbidden(res, message = 'Forbidden') {
  return res.status(403).json({ status: 'error', message });
}

function notFound(res, message = 'Not Found') {
  return res.status(404).json({ status: 'error', message });
}

function serverError(res, message = 'Internal Server Error') {
  return res.status(500).json({ status: 'error', message });
}

module.exports = {
  ok,
  created,
  noContent,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  serverError,
};
