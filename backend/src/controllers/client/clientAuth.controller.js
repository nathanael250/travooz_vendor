const clientAuthService = require('../../services/client/clientAuth.service');

const handleError = (res, error, fallbackMessage = 'An unexpected error occurred') => {
  console.error('Client auth error:', error);
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: error.message || fallbackMessage
  });
};

const registerClient = async (req, res) => {
  try {
    const result = await clientAuthService.registerClient(req.body);
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: result
    });
  } catch (error) {
    handleError(res, error, 'Unable to create client account');
  }
};

const loginClient = async (req, res) => {
  try {
    const result = await clientAuthService.loginClient(req.body);
    res.json({
      success: true,
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    handleError(res, error, 'Unable to login');
  }
};

const getClientProfile = async (req, res) => {
  try {
    const clientId = req.user?.clientId || req.user?.id || req.user?.userId;
    const profile = await clientAuthService.getClientProfile(clientId);
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    handleError(res, error, 'Unable to fetch client profile');
  }
};

module.exports = {
  registerClient,
  loginClient,
  getClientProfile
};

