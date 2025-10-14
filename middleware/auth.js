const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
exports.authenticate = async (req, res, next) => {
      try {
            // Get token from header
            const token = req.header('Authorization')?.replace('Bearer ', '');

            if (!token) {
                  return res.status(401).json({
                        success: false,
                        message: 'No authentication token, access denied'
                  });
            }

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token
            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                  return res.status(401).json({
                        success: false,
                        message: 'User not found, token invalid'
                  });
            }

            req.user = user;
            next();
      } catch (error) {
            res.status(401).json({
                  success: false,
                  message: 'Token is not valid',
                  error: error.message
            });
      }
};

// Check if user has required role
exports.authorize = (...roles) => {
      return (req, res, next) => {
            if (!roles.includes(req.user.role)) {
                  return res.status(403).json({
                        success: false,
                        message: `User role '${req.user.role}' is not authorized to access this route`
                  });
            }
            next();
      };
};

// Optional authentication (doesn't fail if no token)
exports.optionalAuth = async (req, res, next) => {
      try {
            const token = req.header('Authorization')?.replace('Bearer ', '');

            if (token) {
                  const decoded = jwt.verify(token, process.env.JWT_SECRET);
                  const user = await User.findById(decoded.id).select('-password');
                  if (user) {
                        req.user = user;
                  }
            }
            next();
      } catch (error) {
            next();
      }
};

