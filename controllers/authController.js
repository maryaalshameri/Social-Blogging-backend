const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
const generateToken = (id) => {
      return jwt.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: '30d'
      });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res, next) => {
      try {
            const { username, email, password, role } = req.body;

            // Check if user already exists
            const existingUser = await User.findOne({
                  $or: [{ email }, { username }]
            });

            if (existingUser) {
                  return res.status(400).json({
                        success: false,
                        message: 'User with this email or username already exists'
                  });
            }

            // Create user
            const user = await User.create({
                  username,
                  email,
                  password,
                  role: role || 'reader'
            });

            // Generate token
            const token = generateToken(user._id);

            res.status(201).json({
                  success: true,
                  message: 'User registered successfully',
                  data: {
                        user: {
                              id: user._id,
                              username: user.username,
                              email: user.email,
                              role: user.role
                        },
                        token
                  }
            });
      } catch (error) {
            next(error);
      }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
      try {
            const { email, password } = req.body;

            // Check if user exists and get password field
            const user = await User.findOne({ email }).select('+password');

            if (!user) {
                  return res.status(401).json({
                        success: false,
                        message: 'Invalid credentials'
                  });
            }

            // Check if password matches
            const isPasswordMatch = await user.comparePassword(password);

            if (!isPasswordMatch) {
                  return res.status(401).json({
                        success: false,
                        message: 'Invalid credentials'
                  });
            }

            // Generate token
            const token = generateToken(user._id);

            res.status(200).json({
                  success: true,
                  message: 'Login successful',
                  data: {
                        user: {
                              id: user._id,
                              username: user.username,
                              email: user.email,
                              role: user.role
                        },
                        token
                  }
            });
      } catch (error) {
            next(error);
      }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
      try {
            const user = await User.findById(req.user.id);

            res.status(200).json({
                  success: true,
                  data: user
            });
      } catch (error) {
            next(error);
      }
};

