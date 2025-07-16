// Global error handling middleware
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    // Mongoose validation error
    const errors = Object.values(err.errors).map(el => el.message);
    err.message = `Invalid input data: ${errors.join('. ')}`;
    err.statusCode = 400;
  } else if (err.code === 11000) {
    // Duplicate field error
    const field = Object.keys(err.keyValue)[0];
    err.message = `${field} already exists. Please use another value.`;
    err.statusCode = 400;
  } else if (err.name === 'JsonWebTokenError') {
    err.message = 'Invalid token. Please log in again.';
    err.statusCode = 401;
  } else if (err.name === 'TokenExpiredError') {
    err.message = 'Your token has expired. Please log in again.';
    err.statusCode = 401;
  }

  // Send error response
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
};