const express = require('express');
const router = express.Router();
const {
  createComment,
  getCommentsByPost,
  deleteComment,
  getAllComments,
  getCommentsByAuthorPosts,
  updateComment
} = require('../controllers/commentController');
const { authenticate, authorize } = require('../middleware/auth');
const {
  createCommentValidation,
  validate
} = require('../middleware/validation');

// 🔥 هذا هو المسار المطلوب - GET /api/comments
router.get('/', authenticate, authorize('admin'), getAllComments);

// المسار للحصول على تعليقات منشورات مؤلف معين
router.get('/author/:authorId', authenticate, getCommentsByAuthorPosts);

// إنشاء تعليق جديد على منشور معين
router.post(
  '/posts/:postId/comments',
  authenticate,
  createCommentValidation,
  validate,
  createComment
);

// الحصول على تعليقات منشور معين
router.get('/posts/:postId/comments', getCommentsByPost);
router.put('/:id', authenticate, updateComment);
// حذف تعليق
router.delete('/:id', authenticate, deleteComment);

module.exports = router;
