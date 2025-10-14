const express = require('express');
const router = express.Router();
const {
      likePost,
      unlikePost,
      likeComment,
      unlikeComment
} = require('../controllers/likeController');
const { authenticate } = require('../middleware/auth');

// Like/Unlike posts
router.post('/posts/:postId/like', authenticate, likePost);
router.delete('/posts/:postId/like', authenticate, unlikePost);

// Like/Unlike comments
router.post('/comments/:commentId/like', authenticate, likeComment);
router.delete('/comments/:commentId/like', authenticate, unlikeComment);

module.exports = router;

