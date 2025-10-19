const { body, param, query, validationResult } = require('express-validator');

// Middleware to check validation results
exports.validate = (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
            return res.status(400).json({
                  success: false,
                  message: 'Validation failed',
                  errors: errors.array()
            });
      }
      next();
};

// Validation rules for user signup
exports.signupValidation = [
      body('username')
            .trim()
            .isLength({ min: 3 })
            .withMessage('Username must be at least 3 characters'),
      body('email')
            .trim()
            .isEmail()
            .withMessage('Please provide a valid email'),
      body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters'),
      body('role')
            .optional()
            .isIn(['reader', 'author', 'admin'])
            .withMessage('Invalid role')
];

// Validation rules for user login
exports.loginValidation = [
      body('email')
            .trim()
            .isEmail()
            .withMessage('Please provide a valid email'),
      body('password')
            .notEmpty()
            .withMessage('Password is required')
];

exports.forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];

exports.resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

// Validation rules for creating post
exports.createPostValidation = [
      body('title')
            .trim()
            .notEmpty()
            .withMessage('Post title is required')
            .isLength({ max: 200 })
            .withMessage('Title cannot exceed 200 characters'),
      body('content')
            .trim()
            .notEmpty()
            .withMessage('Post content is required'),
      body('tags')
            .optional()
            .isArray()
            .withMessage('Tags must be an array'),
      body('status')
            .optional()
            .isIn(['draft', 'published', 'archived'])
            .withMessage('Invalid status')
];

// Validation rules for creating comment
exports.createCommentValidation = [
      body('content')
            .trim()
            .notEmpty()
            .withMessage('Comment content is required')
            .isLength({ max: 1000 })
            .withMessage('Comment cannot exceed 1000 characters')
];


// exports.validate = (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({
//       success: false,
//       message: 'Validation failed',
//       errors: errors.array()
//     });
//   }
//   next();
// };

