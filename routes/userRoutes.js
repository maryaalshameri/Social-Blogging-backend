const express = require('express');
const router = express.Router();
const {
      getUserById,
      updateUser,
      getAllUsers,
      deleteUser 
} = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth'); 
const upload = require('../middleware/upload');

// Public routes
router.get('/', getAllUsers);
router.get('/:id', getUserById);

// Private routes
router.put('/:id', authenticate, upload.single('avatar'), updateUser);
router.delete('/:id', authenticate, authorize('admin'), deleteUser); 

module.exports = router;