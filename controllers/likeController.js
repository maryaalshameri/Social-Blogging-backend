const Like = require('../models/Like');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

// @desc    Like a post
// @route   POST /api/posts/:postId/like
// @access  Private
exports.likePost = async (req, res, next) => {
      try {
            const { postId } = req.params;
            const { reactionType = 'like' } = req.body;

            // Check if post exists
            const post = await Post.findById(postId);
            if (!post) {
                  return res.status(404).json({
                        success: false,
                        message: 'Post not found'
                  });
            }

            // Check if user already liked the post
            const existingLike = await Like.findOne({
                  user: req.user.id,
                  targetType: 'Post',
                  targetId: postId
            });

            if (existingLike) {
                  // Update reaction type if different
                  if (existingLike.reactionType !== reactionType) {
                        existingLike.reactionType = reactionType;
                        await existingLike.save();

                        return res.status(200).json({
                              success: true,
                              message: 'Reaction updated successfully',
                              data: existingLike
                        });
                  }

                  return res.status(400).json({
                        success: false,
                        message: 'You have already liked this post'
                  });
            }

            // Create new like
            const like = await Like.create({
                  user: req.user.id,
                  targetType: 'Post',
                  targetId: postId,
                  reactionType
            });

            // Update post likes count
            post.likesCount += 1;
            await post.save();

            // Emit socket event for new like
            if (req.app.get('io')) {
                  req.app.get('io').emit('newLike', {
                        type: 'Post',
                        targetId: postId,
                        userId: req.user.id,
                        reactionType
                  });
            }

            res.status(201).json({
                  success: true,
                  message: 'Post liked successfully',
                  data: like
            });
      } catch (error) {
            next(error);
      }
};

// @desc    Unlike a post
// @route   DELETE /api/posts/:postId/like
// @access  Private
exports.unlikePost = async (req, res, next) => {
      try {
            const { postId } = req.params;

            const like = await Like.findOneAndDelete({
                  user: req.user.id,
                  targetType: 'Post',
                  targetId: postId
            });

            if (!like) {
                  return res.status(404).json({
                        success: false,
                        message: 'Like not found'
                  });
            }

            // Update post likes count
            const post = await Post.findById(postId);
            if (post) {
                  post.likesCount = Math.max(0, post.likesCount - 1);
                  await post.save();
            }

            res.status(200).json({
                  success: true,
                  message: 'Post unliked successfully',
                  data: {}
            });
      } catch (error) {
            next(error);
      }
};

// @desc    Like a comment
// @route   POST /api/comments/:commentId/like
// @access  Private
exports.likeComment = async (req, res, next) => {
      try {
            const { commentId } = req.params;
            const { reactionType = 'like' } = req.body;

            // Check if comment exists
            const comment = await Comment.findById(commentId);
            if (!comment) {
                  return res.status(404).json({
                        success: false,
                        message: 'Comment not found'
                  });
            }

            // Check if user already liked the comment
            const existingLike = await Like.findOne({
                  user: req.user.id,
                  targetType: 'Comment',
                  targetId: commentId
            });

            if (existingLike) {
                  // Update reaction type if different
                  if (existingLike.reactionType !== reactionType) {
                        existingLike.reactionType = reactionType;
                        await existingLike.save();

                        return res.status(200).json({
                              success: true,
                              message: 'Reaction updated successfully',
                              data: existingLike
                        });
                  }

                  return res.status(400).json({
                        success: false,
                        message: 'You have already liked this comment'
                  });
            }

            // Create new like
            const like = await Like.create({
                  user: req.user.id,
                  targetType: 'Comment',
                  targetId: commentId,
                  reactionType
            });

            // Update comment likes count
            comment.likesCount += 1;
            await comment.save();

            // Emit socket event for new like
            if (req.app.get('io')) {
                  req.app.get('io').emit('newLike', {
                        type: 'Comment',
                        targetId: commentId,
                        userId: req.user.id,
                        reactionType
                  });
            }

            res.status(201).json({
                  success: true,
                  message: 'Comment liked successfully',
                  data: like
            });
      } catch (error) {
            next(error);
      }
};

// @desc    Unlike a comment
// @route   DELETE /api/comments/:commentId/like
// @access  Private
exports.unlikeComment = async (req, res, next) => {
      try {
            const { commentId } = req.params;

            const like = await Like.findOneAndDelete({
                  user: req.user.id,
                  targetType: 'Comment',
                  targetId: commentId
            });

            if (!like) {
                  return res.status(404).json({
                        success: false,
                        message: 'Like not found'
                  });
            }

            // Update comment likes count
            const comment = await Comment.findById(commentId);
            if (comment) {
                  comment.likesCount = Math.max(0, comment.likesCount - 1);
                  await comment.save();
            }

            res.status(200).json({
                  success: true,
                  message: 'Comment unliked successfully',
                  data: {}
            });
      } catch (error) {
            next(error);
      }
};

