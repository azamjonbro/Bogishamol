function notFoundHandler(req, res, next) {
 const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
 error.statusCode = 404;
 next(error);
}

function errorHandler(error, req, res, next) {
 // Mongoose duplicate key error (code 11000)
 if (error.code === 11000) {
  const field = Object.keys(error.keyPattern || {})[0] || 'field';
  return res.status(409).json({
   error: `Duplicate value for ${field}. This value already exists.`,
  });
 }

 // Mongoose validation error
 if (error.name === 'ValidationError') {
  const messages = Object.values(error.errors || {}).map((e) => e.message);
  return res.status(400).json({
   error: messages.length === 1 ? messages[0] : messages.join('; '),
  });
 }

 // Mongoose cast error (invalid ObjectId, etc.)
 if (error.name === 'CastError') {
  return res.status(400).json({
   error: `Invalid value for ${error.path || 'field'}: ${error.value}`,
  });
 }

 // JSON parse errors (malformed request body)
 if (error.type === 'entity.parse.failed') {
  return res.status(400).json({ error: 'Invalid JSON in request body.' });
 }

 // Express payload too large
 if (error.type === 'entity.too.large') {
  return res.status(413).json({ error: 'Request body too large.' });
 }

 const statusCode = error.statusCode || 500;

 if (statusCode >= 500) {
  console.error(error);
 }

 res.status(statusCode).json({
  error: statusCode >= 500 ? 'Internal server error' : error.message,
 });
}

module.exports = { notFoundHandler, errorHandler };
