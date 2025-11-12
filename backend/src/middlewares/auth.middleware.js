const jwt = require('jsonwebtoken');

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    let token = null;
    
    // Try to get token from Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }
    
    // Try to verify token with stays backend secret first
    let decoded = null;
    const staysSecret = process.env.JWT_SECRET || 'stays-secret-key-change-in-production';
    // Try to get main backend secret from environment, or use stays secret as fallback
    // Note: Set MAIN_BACKEND_JWT_SECRET in .env to match travooz_backend's JWT_SECRET
    const mainBackendSecret = process.env.MAIN_BACKEND_JWT_SECRET || staysSecret;
    
    try {
      decoded = jwt.verify(token, staysSecret);
    } catch (staysError) {
      // If verification with stays secret fails, try with main backend secret
      // This allows tokens from travooz_backend to work with travooz_stay_backend
      // Only try main backend secret if it's different from stays secret
      if (mainBackendSecret !== staysSecret) {
        try {
          decoded = jwt.verify(token, mainBackendSecret);
        } catch (mainError) {
          // Both secrets failed, throw the original error
          throw staysError;
        }
      } else {
        // Secrets are the same, so verification already failed
        throw staysError;
      }
    }
    
    // Attach user info to request (just the decoded JWT payload, like original)
    req.user = decoded;
    
    // Ensure userId and id are both available for compatibility
    // Some code expects userId, others expect id
    if (req.user && !req.user.userId && req.user.id) {
      req.user.userId = req.user.id;
    }
    if (req.user && !req.user.id && req.user.userId) {
      req.user.id = req.user.userId;
    }
    if (req.user && !req.user.userId && !req.user.id && req.user.user_id) {
      req.user.userId = req.user.user_id;
      req.user.id = req.user.user_id;
    }
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const staysSecret = process.env.JWT_SECRET || 'stays-secret-key-change-in-production';
      const mainBackendSecret = process.env.MAIN_BACKEND_JWT_SECRET || process.env.JWT_SECRET;
      
      let decoded = null;
      try {
        decoded = jwt.verify(token, staysSecret);
      } catch (staysError) {
        try {
          decoded = jwt.verify(token, mainBackendSecret);
        } catch (mainError) {
          // Both failed, continue without authentication
        }
      }
      
      if (decoded) {
        req.user = decoded;
      }
    }
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Wrapper for authenticateToken (for compatibility with old restaurant routes)
const authenticateToken = (req, res, next) => {
  // The old system expects req.user.id, but our authenticate sets req.user.userId
  authenticate(req, res, () => {
    // Map userId to id for compatibility
    if (req.user && req.user.userId && !req.user.id) {
      req.user.id = req.user.userId;
    }
    next();
  });
};

module.exports = {
  authenticate,
  optionalAuth,
  authenticateToken
};

