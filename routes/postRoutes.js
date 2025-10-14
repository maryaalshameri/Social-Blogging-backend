const express = require('express');
const router = express.Router();
const {
      createPost,
      getAllPosts,
      getPostById,
      updatePost,
      deletePost
} = require('../controllers/postController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
      createPostValidation,
      validate
} = require('../middleware/validation');

// Public routes
router.get('/', getAllPosts);
router.get('/:id', getPostById);

// Private routes (author and admin only)
router.post(
      '/',
      authenticate,
      authorize('author', 'admin'),
      upload.single('image'),
      createPostValidation,
      validate,
      createPost
);

router.put(
      '/:id',
      authenticate,
      authorize('author', 'admin'),
      upload.single('image'),
      updatePost
);

router.delete(
      '/:id',
      authenticate,
      authorize('author', 'admin'),
      deletePost
);

// إضافة هذا المسار بعد المسارات العامة
// router.get(
//   '/author/dashboard',
//   authenticate,
//   authorize('author', 'admin'),
//   getAuthorDashboardPosts
// );

module.exports = router;

