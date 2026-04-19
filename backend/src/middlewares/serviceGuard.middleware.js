/**
 * Service Guard Middleware
 * 
 * Enforces that JWT tokens are scoped to the correct service.
 * Prevents cross-service token reuse and unauthorized access.
 * 
 * Usage:
 *   router.get('/dashboard', authenticate, serviceGuard('restaurant'), handler);
 */

const serviceGuard = (requiredService) => {
    return (req, res, next) => {
        // Ensure user is authenticated (should be set by authenticate middleware)
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Get service from token
        const tokenService = req.user.service;

        // Check if service is present in token
        if (!tokenService) {
            console.warn('⚠️ Token missing service information - invalidating token:', {
                userId: req.user.userId || req.user.id,
                email: req.user.email
            });
            // Return 401 to trigger frontend logout (frontend handles 401 by clearing tokens)
            return res.status(401).json({
                success: false,
                message: 'Token missing service information. Please log in again.',
                code: 'INVALID_TOKEN'
            });
        }

        // Check if service matches required service
        if (tokenService !== requiredService) {
            console.warn('⚠️ Service mismatch - invalidating token:', {
                tokenService,
                requiredService,
                userId: req.user.userId || req.user.id,
                email: req.user.email,
                path: req.path
            });
            // Return 401 to trigger frontend logout (frontend handles 401 by clearing tokens)
            return res.status(401).json({
                success: false,
                message: `Access denied. This endpoint requires ${requiredService} service, but your token is for ${tokenService}. Please log in to the correct service.`,
                code: 'SERVICE_MISMATCH'
            });
        }

        // Service matches - proceed
        next();
    };
};

module.exports = serviceGuard;





