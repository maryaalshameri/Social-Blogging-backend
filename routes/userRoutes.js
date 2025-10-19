const express = require('express');
const router = express.Router();
const {
  getUserById,
  updateUser,
  getAllUsers,
  deleteUser 
} = require('../controllers/userController');

const {
  followUser,
  unfollowUser,
  getFollowStatus,
  getUserStats 
} = require('../controllers/followController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.get('/:id/stats',getUserStats);

// Private routes
router.put('/:id', authenticate, upload.single('avatar'), updateUser);
router.delete('/:id', authenticate, authorize('admin'), deleteUser);

// Follow routes
router.post('/:id/follow', authenticate, followUser);
router.delete('/:id/follow', authenticate, unfollowUser);
router.get('/:id/follow-status', authenticate, getFollowStatus);

module.exports = router;