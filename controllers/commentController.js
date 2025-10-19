const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Like = require('../models/Like');

// @desc    Create a comment on a post
// @route   POST /api/posts/:postId/comments
// @access  Private
exports.createComment = async (req, res, next) => {
      try {
            const { content, parentComment } = req.body;
            const { postId } = req.params;

            // Check if post exists
            const post = await Post.findById(postId);
            if (!post) {
                  return res.status(404).json({
                        success: false,
                        message: 'Post not found'
                  });
            }

            const comment = await Comment.create({
                  content,
                  author: req.user.id,
                  post: postId,
                  parentComment: parentComment || null
            });

            await comment.populate('author', 'username avatar');

            // Update post comments count
            post.commentsCount += 1;
            await post.save();

            // Emit socket events for real-time updates
            const io = req.app.get('io');
            if (io) {
                  // حدث التعليق الجديد للإشعارات
                  io.emit('newComment', {
                        comment: comment,
                        postId: postId,
                        userId: req.user.id
                  });

                  // حدث إضافة التعليق في الوقت الحقيقي
                  io.emit('commentAdded', {
                        postId: postId,
                        comment: comment
                  });

                  console.log(`Socket: New comment added to post ${postId} by user ${req.user.id}`);
                  
            }
             const notificationService = req.app.get('notificationService');
                  if (notificationService) {
                    await notificationService.notifyPostComment({
                      postId,
                      postAuthorId: post.author,
                      commentAuthorId: req.user.id,
                      commentAuthorUsername: req.user.username,
                      postTitle: post.title,
                      commentContent: content
                    });
                  }
            res.status(201).json({
                  success: true,
                  message: 'Comment added successfully',
                  data: comment
            });
      } catch (error) {
            next(error);
      }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private (author of comment or admin)
exports.deleteComment = async (req, res, next) => {
      try {
            const comment = await Comment.findById(req.params.id);

            if (!comment) {
                  return res.status(404).json({
                        success: false,
                        message: 'Comment not found'
                  });
            }

            // Check if user is author or admin
            if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
                  return res.status(403).json({
                        success: false,
                        message: 'Not authorized to delete this comment'
                  });
            }

            const postId = comment.post;

            // Delete associated likes
            await Like.deleteMany({ targetType: 'Comment', targetId: req.params.id });

            // Delete child comments if any
            await Comment.deleteMany({ parentComment: req.params.id });

            await Comment.findByIdAndDelete(req.params.id);

            // Update post comments count
            const post = await Post.findById(postId);
            if (post) {
                  post.commentsCount = Math.max(0, post.commentsCount - 1);
                  await post.save();

                  // Emit socket event for real-time update
                  const io = req.app.get('io');
                  if (io) {
                        io.emit('commentDeleted', {
                              postId: postId,
                              commentId: req.params.id
                        });

                        console.log(`Socket: Comment ${req.params.id} deleted from post ${postId}`);
                  }
            }

            res.status(200).json({
                  success: true,
                  message: 'Comment deleted successfully',
                  data: {}
            });
      } catch (error) {
            next(error);
      }
};

// @desc    Get comments for a post
// @route   GET /api/posts/:postId/comments
// @access  Public
exports.getCommentsByPost = async (req, res, next) => {
      try {
            const { postId } = req.params;
            const { page = 1, limit = 20, sortBy = 'createdAt', order = 'desc' } = req.query;

            // Check if post exists
            const post = await Post.findById(postId);
            if (!post) {
                  return res.status(404).json({
                        success: false,
                        message: 'Post not found'
                  });
            }

            const sortOrder = order === 'asc' ? 1 : -1;
            const sortOptions = { [sortBy]: sortOrder };

            const comments = await Comment.find({ post: postId, parentComment: null })
                  .populate('author', 'username avatar')
                  .limit(limit * 1)
                  .skip((page - 1) * limit)
                  .sort(sortOptions);

            const count = await Comment.countDocuments({ post: postId, parentComment: null });

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

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private (author of comment or admin)
// exports.deleteComment = async (req, res, next) => {
//       try {
//             const comment = await Comment.findById(req.params.id);

//             if (!comment) {
//                   return res.status(404).json({
//                         success: false,
//                         message: 'Comment not found'
//                   });
//             }

//             // Check if user is author or admin
//             if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
//                   return res.status(403).json({
//                         success: false,
//                         message: 'Not authorized to delete this comment'
//                   });
//             }

//             const postId = comment.post;

//             // Delete associated likes
//             await Like.deleteMany({ targetType: 'Comment', targetId: req.params.id });

//             // Delete child comments if any
//             await Comment.deleteMany({ parentComment: req.params.id });

//             await Comment.findByIdAndDelete(req.params.id);

//             // Update post comments count
//             const post = await Post.findById(postId);
//             if (post) {
//                   post.commentsCount = Math.max(0, post.commentsCount - 1);
//                   await post.save();
//             }

//             res.status(200).json({
//                   success: true,
//                   message: 'Comment deleted successfully',
//                   data: {}
//             });
//       } catch (error) {
//             next(error);
//       }
// };

// @desc    Get comments by author's posts
// @route   GET /api/comments/author/:authorId
// @access  Private
exports.getCommentsByAuthorPosts = async (req, res, next) => {
  try {
    const { authorId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // الحصول على منشورات المؤلف أولاً
    const authorPosts = await Post.find({ author: authorId }).select('_id');
    const postIds = authorPosts.map(post => post._id);

    const comments = await Comment.find({ post: { $in: postIds } })
      .populate('author', 'username avatar')
      .populate('post', 'title')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Comment.countDocuments({ post: { $in: postIds } });

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



exports.getAllComments = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, sortBy = 'createdAt', order = 'desc' } = req.query;

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions = { [sortBy]: sortOrder };

    const comments = await Comment.find()
      .populate('author', 'username avatar')
      .populate('post', 'title author')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sortOptions);

    const count = await Comment.countDocuments();

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

// @desc    Get comments by author's posts
// @route   GET /api/comments/author/:authorId
// @access  Private
exports.getCommentsByAuthorPosts = async (req, res, next) => {
  try {
    const { authorId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // الحصول على منشورات المؤلف أولاً
    const authorPosts = await Post.find({ author: authorId }).select('_id');
    const postIds = authorPosts.map(post => post._id);

    // إذا لم يكن لدى المؤلف منشورات
    if (postIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        pagination: {
          total: 0,
          page: parseInt(page),
          pages: 0
        }
      });
    }

    const comments = await Comment.find({ post: { $in: postIds } })
      .populate('author', 'username avatar')
      .populate('post', 'title')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Comment.countDocuments({ post: { $in: postIds } });

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

// @desc    Get all comments for admin
// @route   GET /api/comments
// @access  Private (admin only)
exports.getAllComments = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      search, 
      author, 
      post, 
      sortBy = 'createdAt', 
      order = 'desc' 
    } = req.query;

    const query = {};

    // Search in content
    if (search) {
      query.content = { $regex: search, $options: 'i' };
    }

    // Filter by author
    if (author) {
      query.author = author;
    }

    // Filter by post
    if (post) {
      query.post = post;
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions = { [sortBy]: sortOrder };

    const comments = await Comment.find(query)
      .populate('author', 'username avatar')
      .populate('post', 'title')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sortOptions);

    const count = await Comment.countDocuments(query);

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





// @desc    Update a comment
// @route   PUT /api/comments/:id
// @access  Private (author of comment or admin)
exports.updateComment = async (req, res, next) => {
  try {
    const { content, isApproved } = req.body;
    const commentId = req.params.id;

    // Find the comment
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user is author or admin
    if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this comment'
      });
    }

    // Prepare update fields
    const updateFields = {};
    if (content !== undefined) updateFields.content = content;
    if (isApproved !== undefined) updateFields.isApproved = isApproved;

    // Update the comment
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      updateFields,
      { new: true, runValidators: true }
    ).populate('author', 'username avatar')
     .populate('post', 'title');

    res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      data: updatedComment
    });
  } catch (error) {
    next(error);
  }
};
