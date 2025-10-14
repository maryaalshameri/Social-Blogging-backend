const express = require('express');
const router = express.Router();
const {
      signup,
      login,
      getMe
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const {
      signupValidation,
      loginValidation,
      validate
} = require('../middleware/validation');

// Public routes
router.post('/signup', signupValidation, validate, signup);
router.post('/login', loginValidation, validate, login);

// Private routes
router.get('/me', authenticate, getMe);

module.exports = router;

