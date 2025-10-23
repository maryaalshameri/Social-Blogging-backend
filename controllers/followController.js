// controllers/followController.js
const User = require('../models/User');
const Post = require('../models/Post');

// في ملف followController.js
exports.followUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const followerId = req.user.id;

    if (targetUserId === followerId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself'
      });
    }

    const targetUser = await User.findById(targetUserId);
    const followerUser = await User.findById(followerId);

    if (!targetUser || !followerUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // التحقق إذا كان المستخدم يتابع بالفعل
    const isAlreadyFollowing = targetUser.followers.includes(followerId);
    
    if (isAlreadyFollowing) {
      return res.status(400).json({
        success: false,
        message: 'You are already following this user'
      });
    }

    // تحديث المتابَع (إضافة المتابِع إلى قائمة المتابعين)
    targetUser.followers.push(followerId);
    targetUser.followersCount = targetUser.followers.length;
    await targetUser.save();

    // تحديث المتابِع (إضافة المتابَع إلى قائمة المتابَعين)
    followerUser.following.push(targetUserId);
    followerUser.followingCount = followerUser.following.length;
    await followerUser.save();

    // استخدام خدمة الإشعارات إذا كانت متاحة
    const io = req.app.get('io');
    if (io) {
      // بث حدث المتابعة
      io.emit('userFollowed', {
        followerId,
        targetUserId,
        follower: {
          _id: followerUser._id,
          username: followerUser.username,
          avatar: followerUser.avatar
        },
        targetUser: {
          _id: targetUser._id,
          username: targetUser.username,
          avatar: targetUser.avatar
        },
        timestamp: new Date()
      });

      // بث تحديث الإحصائيات للمستخدم المستهدف
      io.emit('followStatsUpdate', {
        userId: targetUserId,
        followersCount: targetUser.followersCount,
        followingCount: targetUser.followingCount
      });

      // بث تحديث الإحصائيات للمستخدم المتابِع
      io.emit('followStatsUpdate', {
        userId: followerId,
        followersCount: followerUser.followersCount,
        followingCount: followerUser.followingCount
      });

      // إرسال إشعار للمستخدم المتابَع
      io.to(`user_${targetUserId}`).emit('newFollower', {
        follower: {
          _id: followerUser._id,
          username: followerUser.username,
          avatar: followerUser.avatar
        },
        timestamp: new Date()
      });
    }

    res.status(200).json({
      success: true,
      message: 'User followed successfully',
      data: {
        followersCount: targetUser.followersCount,
        followingCount: targetUser.followingCount
      }
    });

  } catch (error) {
    next(error);
  }
};

exports.unfollowUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const followerId = req.user.id;

    const targetUser = await User.findById(targetUserId);
    const followerUser = await User.findById(followerId);

    if (!targetUser || !followerUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // التحقق إذا كان المستخدم يتابع بالفعل
    const isFollowing = targetUser.followers.includes(followerId);
    
    if (!isFollowing) {
      return res.status(400).json({
        success: false,
        message: 'You are not following this user'
      });
    }

    // تحديث المتابَع (إزالة المتابِع من قائمة المتابعين)
    targetUser.followers = targetUser.followers.filter(
      id => id.toString() !== followerId
    );
    targetUser.followersCount = targetUser.followers.length;
    await targetUser.save();

    // تحديث المتابِع (إزالة المتابَع من قائمة المتابَعين)
    followerUser.following = followerUser.following.filter(
      id => id.toString() !== targetUserId
    );
    followerUser.followingCount = followerUser.following.length;
    await followerUser.save();

    // استخدام خدمة الإشعارات إذا كانت متاحة
    const io = req.app.get('io');
    if (io) {
      // بث حدث إلغاء المتابعة
      io.emit('userUnfollowed', {
        followerId,
        targetUserId,
        follower: {
          _id: followerUser._id,
          username: followerUser.username,
          avatar: followerUser.avatar
        },
        targetUser: {
          _id: targetUser._id,
          username: targetUser.username,
          avatar: targetUser.avatar
        },
        timestamp: new Date()
      });

      // بث تحديث الإحصائيات للمستخدم المستهدف
      io.emit('followStatsUpdate', {
        userId: targetUserId,
        followersCount: targetUser.followersCount,
        followingCount: targetUser.followingCount
      });

      // بث تحديث الإحصائيات للمستخدم المتابِع
      io.emit('followStatsUpdate', {
        userId: followerId,
        followersCount: followerUser.followersCount,
        followingCount: followerUser.followingCount
      });
    }

    res.status(200).json({
      success: true,
      message: 'User unfollowed successfully',
      data: {
        followersCount: targetUser.followersCount,
        followingCount: targetUser.followingCount
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
    
    const user = await User.findById(userId).select('followersCount followingCount');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const postsCount = await Post.countDocuments({ 
      author: userId, 
      status: 'published' 
    });

    res.status(200).json({
      success: true,
      data: {
        followersCount: user.followersCount || 0,
        followingCount: user.followingCount || 0,
        postsCount
      }
    });
  } catch (error) {
    next(error);
  }
};