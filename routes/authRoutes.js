// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  getMe,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const {
  signupValidation,
  loginValidation,
  forgotPasswordValidation,  
  resetPasswordValidation,   
  validate
} = require('../middleware/validation');

// Public routes
router.post('/signup', signupValidation, validate, signup);
router.post('/login', loginValidation, validate, login);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/forgot-password', forgotPasswordValidation, validate, forgotPassword);
router.post('/reset-password', resetPasswordValidation, validate, resetPassword);

// Private routes
router.get('/me', authenticate, getMe);

module.exports = router;