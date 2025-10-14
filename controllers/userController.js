const User = require('../models/User');
const Post = require('../models/Post'); // إضافة هذا
const Comment = require('../models/Comment'); // إضافة هذا
const Like = require('../models/Like'); // إضافة هذا

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public
exports.getUserById = async (req, res, next) => {
      try {
            const user = await User.findById(req.params.id)
                  .select('-password')
                  .populate('followers', 'username avatar')
                  .populate('following', 'username avatar');

            if (!user) {
                  return res.status(404).json({
                        success: false,
                        message: 'User not found'
                  });
            }

            res.status(200).json({
                  success: true,
                  data: user
            });
      } catch (error) {
            next(error);
      }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
exports.updateUser = async (req, res, next) => {
      try {
            // Check if user is updating their own profile or is admin
            if (req.user.id !== req.params.id && req.user.role !== 'admin') {
                  return res.status(403).json({
                        success: false,
                        message: 'Not authorized to update this profile'
                  });
            }

            const { username, bio, avatar } = req.body;

            const updateFields = {};
            if (username) updateFields.username = username;
            if (bio !== undefined) updateFields.bio = bio;
            if (avatar !== undefined) updateFields.avatar = avatar;

            // Handle file upload if present
            if (req.file) {
                  updateFields.avatar = `/uploads/${req.file.filename}`;
            }

            const user = await User.findByIdAndUpdate(
                  req.params.id,
                  updateFields,
                  { new: true, runValidators: true }
            ).select('-password');

            if (!user) {
                  return res.status(404).json({
                        success: false,
                        message: 'User not found'
                  });
            }

            res.status(200).json({
                  success: true,
                  message: 'Profile updated successfully',
                  data: user
            });
      } catch (error) {
            next(error);
      }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Public
exports.getAllUsers = async (req, res, next) => {
      try {
            const { page = 1, limit = 10, role, search } = req.query;

            const query = {};
            if (role) query.role = role;
            if (search) {
                  query.$or = [
                        { username: { $regex: search, $options: 'i' } },
                        { email: { $regex: search, $options: 'i' } }
                  ];
            }

            const users = await User.find(query)
                  .select('-password')
                  .limit(limit * 1)
                  .skip((page - 1) * limit)
                  .sort({ createdAt: -1 });

            const count = await User.countDocuments(query);

            res.status(200).json({
                  success: true,
                  data: users,
                  pagination: {
                        total: count,
                        page: parseInt(page),
                        pages: Math.ceil(count / limit)
                  }
            });
      } catch (error) {
            next(error);
      }
};


// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (admin only)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // منع المستخدم من حذف نفسه
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    // حذف جميع منشورات المستخدم
    await Post.deleteMany({ author: user._id });
    
    // حذف جميع تعليقات المستخدم
    await Comment.deleteMany({ author: user._id });
    
    // حذف جميع الإعجابات الخاصة بالمستخدم
    await Like.deleteMany({ user: user._id });

    // حذف المستخدم
    await User.findByIdAndDelete(user._id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};