// controllers/followController.js
const User = require('../models/User');
const Post = require('../models/Post');

exports.followUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    if (targetUserId === currentUserId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself'
      });
    }

    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(targetUserId)
    ]);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // التحقق إذا كان المستخدم يتابع بالفعل
    const isAlreadyFollowing = currentUser.following.includes(targetUserId);
    
    if (isAlreadyFollowing) {
      return res.status(400).json({
        success: false,
        message: 'You are already following this user'
      });
    }

    // إضافة المتابعة
    await Promise.all([
      User.findByIdAndUpdate(currentUserId, {
        $addToSet: { following: targetUserId }
      }),
      User.findByIdAndUpdate(targetUserId, {
        $addToSet: { followers: currentUserId }
      })
    ]);

    // إرسال إشعار في الوقت الحقيقي
    if (req.app.get('io')) {
      req.app.get('io').to(`user_${targetUserId}`).emit('newFollower', {
        followerId: currentUserId,
        followerUsername: req.user.username,
        timestamp: new Date()
      });
    }

    // الحصول على العدد المحدث
    const updatedTargetUser = await User.findById(targetUserId);
    
    res.status(200).json({
      success: true,
      message: `You are now following ${targetUser.username}`,
      data: {
        isFollowing: true,
        followersCount: updatedTargetUser.followers.length
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.unfollowUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(targetUserId)
    ]);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isFollowing = currentUser.following.includes(targetUserId);
    
    if (!isFollowing) {
      return res.status(400).json({
        success: false,
        message: 'You are not following this user'
      });
    }

    await Promise.all([
      User.findByIdAndUpdate(currentUserId, {
        $pull: { following: targetUserId }
      }),
      User.findByIdAndUpdate(targetUserId, {
        $pull: { followers: currentUserId }
      })
    ]);

    // الحصول على العدد المحدث
    const updatedTargetUser = await User.findById(targetUserId);

    res.status(200).json({
      success: true,
      message: `You have unfollowed ${targetUser.username}`,
      data: {
        isFollowing: false,
        followersCount: updatedTargetUser.followers.length
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getFollowStatus = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    const currentUser = await User.findById(currentUserId);
    const isFollowing = currentUser.following.includes(targetUserId);

    res.status(200).json({
      success: true,
      data: { isFollowing }
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserStats = async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    const [user, postsCount] = await Promise.all([
      User.findById(userId).select('followers following'),
      Post.countDocuments({ author: userId, status: 'published' })
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        followersCount: user.followers.length,
        followingCount: user.following.length,
        postsCount
      }
    });
  } catch (error) {
    next(error);
  }
};

