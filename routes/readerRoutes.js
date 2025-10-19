const express = require('express');
const router = express.Router();
const {
  getMyLikedPosts,
  getMyComments,
  getReaderStats
} = require('../controllers/readerController');
const { authenticate } = require('../middleware/auth');

// جميع المسارات تتطلب مصادقة
router.get('/my-likes', authenticate, getMyLikedPosts);
router.get('/my-comments', authenticate, getMyComments);
router.get('/stats', authenticate, getReaderStats);

module.exports = router;