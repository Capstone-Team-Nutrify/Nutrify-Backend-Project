export const handleResponse = (h, status = 'success', data = null, message = '', code = 200) => {
  return h.response({
    status,
    data,
    message
  }).code(code);
};

export const errorHandler = (request, h, err) => {
  console.error('Error:', err);
  
  let statusCode = err.statusCode || 500;
  let responseMessage = err.message || 'An unexpected error occurred';
  
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    responseMessage = 'Invalid token';
    return h.response({
      status: 'error',
      message: responseMessage
    }).code(statusCode).unstate('jwt');
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    responseMessage = 'Token expired';
    return h.response({
      status: 'error',
      message: responseMessage
    }).code(statusCode).unstate('jwt');
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors).map(e => e.message);
    responseMessage = messages.join(', ');
  } else if (err.isBoom) {
    statusCode = err.output.statusCode;
    responseMessage = err.output.payload.message;
  }

  return h.response({
    status: 'error',
    message: responseMessage
  }).code(statusCode);
};

export const notFoundHandler = (request, h) => {
  return h.response({
    status: 'error',
    message: 'Route not found'
  }).code(404).takeover();
};
