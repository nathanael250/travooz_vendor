// Response utility functions
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const sendError = (res, message = 'Error', statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message
  });
};

const sendValidationError = (res, errors) => {
  return res.status(400).json({
    success: false,
    message: 'Validation error',
    errors
  });
};

const sendUnauthorized = (res, message = 'Unauthorized') => {
  return res.status(401).json({
    success: false,
    message
  });
};

const sendNotFound = (res, message = 'Not found') => {
  return res.status(404).json({
    success: false,
    message
  });
};

const sendForbidden = (res, message = 'Forbidden') => {
  return res.status(403).json({
    success: false,
    message
  });
};

module.exports = {
  sendSuccess,
  sendError,
  sendValidationError,
  sendUnauthorized,
  sendNotFound,
  sendForbidden
};
