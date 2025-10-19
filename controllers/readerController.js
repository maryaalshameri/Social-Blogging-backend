const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const User = require('../models/User');
const mongoose = require('mongoose');
// @desc    Get reader's liked posts
// @route   GET /api/reader/my-likes
// @access  Private
exports.getMyLikedPosts = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      sortBy = 'createdAt', 
      order = 'desc' 
    } = req.query;

    const userId = req.user.id;

    // البحث عن جميع الإعجابات الخاصة بالمستخدم على المنشورات
    const likes = await Like.find({
      user: userId,
      targetType: 'Post'
    })
    .populate({
      path: 'targetId',
      populate: {
        path: 'author',
        select: 'username avatar'
      }
    })
    .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    // استخراج المنشورات من الإعجابات
    const likedPosts = likes
      .filter(like => like.targetId) // تصفية المنشورات المحذوفة
      .map(like => like.targetId);

    const count = await Like.countDocuments({
      user: userId,
      targetType: 'Post'
    });

    res.status(200).json({
      success: true,
      data: likedPosts,
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

// @desc    Get reader's comments
// @route   GET /api/reader/my-comments
// @access  Private
exports.getMyComments = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      sortBy = 'createdAt', 
      order = 'desc' 
    } = req.query;

    const userId = req.user.id;

    const comments = await Comment.find({ author: userId })
      .populate('author', 'username avatar')
      .populate('post', 'title')
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Comment.countDocuments({ author: userId });

    res.status(200).json({
      success: true,
      data: comments,
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

// @desc    Get reader stats
// @route   GET /api/reader/stats
// @access  Private
exports.getReaderStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // عدد المنشورات المعجبة بها
    const likedPostsCount = await Like.countDocuments({
      user: userId,
      targetType: 'Post'
    });

    // عدد التعليقات
    const commentsCount = await Comment.countDocuments({ author: userId });

    // عدد الإعجابات على تعليقات المستخدم
    const commentLikesCount = await Like.countDocuments({
      targetType: 'Comment',
      targetId: { 
        $in: await Comment.find({ author: userId }).distinct('_id') 
      }
    });

    // عدد المتابعين
    const followingCount = await User.countDocuments({ followers: userId });

    // عدد الإعجابات لهذا الشهر
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const likesThisMonth = await Like.countDocuments({
      user: userId,
      targetType: 'Post',
      createdAt: { $gte: startOfMonth }
    });

    // الفئة الأكثر تفاعلاً (بناءً على الإعجابات)
    const topCategoryAggregation = await Like.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(userId),
          targetType: 'Post'
        }
      },
      {
        $lookup: {
          from: 'posts',
          localField: 'targetId',
          foreignField: '_id',
          as: 'post'
        }
      },
      {
        $unwind: '$post'
      },
      {
        $unwind: '$post.tags'
      },
      {
        $group: {
          _id: '$post.tags',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 1
      }
    ]);

    const topCategory = topCategoryAggregation.length > 0 
      ? topCategoryAggregation[0]._id 
      : 'None';

    // عدد المناقشات النشطة (منشورات مختلفة علق عليها)
    const activeDiscussions = await Comment.aggregate([
      {
        $match: { author: mongoose.Types.ObjectId(userId) }
      },
      {
        $group: {
          _id: '$post'
        }
      },
      {
        $count: 'uniquePosts'
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalLikes: likedPostsCount,
        totalComments: commentsCount,
        commentLikes: commentLikesCount,
        following: followingCount,
        thisMonth: likesThisMonth,
        topCategory: topCategory,
        activeDiscussions: activeDiscussions.length > 0 ? activeDiscussions[0].uniquePosts : 0
      }
    });
  } catch (error) {
    next(error);
  }
};