const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Like = require('../models/Like');

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private (author, admin)
exports.createPost = async (req, res, next) => {
      try {
            const { title, content, tags, status } = req.body;

            const postData = {
                  title,
                  content,
                  author: req.user.id,
                  tags: tags || [],
                  status: status || 'published'
            };

            // Handle file upload if present
            if (req.file) {
                  postData.image = `/uploads/${req.file.filename}`;
            }

            const post = await Post.create(postData);
            await post.populate('author', 'username avatar');

            // Emit socket event for new post
            if (req.app.get('io')) {
                  req.app.get('io').emit('newPost', post);
            }

            res.status(201).json({
                  success: true,
                  message: 'Post created successfully',
                  data: post
            });
      } catch (error) {
            next(error);
      }
};

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
exports.getAllPosts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      author,
      tags,
      status, // إزالة القيمة الافتراضية هنا
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = {};

    // Filter by status (only if provided)
    if (status && status !== 'all') {
      query.status = status;
    }

    // إذا كان المستخدم يطلب منشوراته الخاصة، عرض جميع الحالات
    if (author && author === req.user?.id) {
      // لا نطبق أي فلتر على الحالة للمستخدمين الذين يشاهدون منشوراتهم الخاصة
    } else if (!status) {
      // إذا لم يتم تحديد حالة وعرض للعامة، افترض المنشورات المنشورة فقط
      query.status = 'published';
    }

    // باقي الكود كما هو...
    // Search in title and content
    if (search) {
      query.$text = { $search: search };
    }

    // Filter by author
    if (author) {
      query.author = author;
    }

    // Filter by tags
    if (tags) {
      query.tags = { $in: tags.split(',') };
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions = { [sortBy]: sortOrder };

    const posts = await Post.find(query)
      .populate('author', 'username avatar')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sortOptions);

    const count = await Post.countDocuments(query);

    res.status(200).json({
      success: true,
      data: posts,
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

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Public
exports.getPostById = async (req, res, next) => {
      try {
            const post = await Post.findById(req.params.id)
                  .populate('author', 'username avatar bio');

            if (!post) {
                  return res.status(404).json({
                        success: false,
                        message: 'Post not found'
                  });
            }

            // Increment view count
            // post.views += 1;
            // await post.save();

            res.status(200).json({
                  success: true,
                  data: post
            });
      } catch (error) {
            next(error);
      }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private (author of post or admin)
exports.updatePost = async (req, res, next) => {
      try {
            let post = await Post.findById(req.params.id);

            if (!post) {
                  return res.status(404).json({
                        success: false,
                        message: 'Post not found'
                  });
            }

            // Check if user is author or admin
            if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
                  return res.status(403).json({
                        success: false,
                        message: 'Not authorized to update this post'
                  });
            }

            const { title, content, tags, status } = req.body;

            const updateFields = {};
            if (title) updateFields.title = title;
            if (content) updateFields.content = content;
            if (tags) updateFields.tags = tags;
            if (status) updateFields.status = status;

            // Handle file upload if present
            if (req.file) {
                  updateFields.image = `/uploads/${req.file.filename}`;
            }

            post = await Post.findByIdAndUpdate(
                  req.params.id,
                  updateFields,
                  { new: true, runValidators: true }
            ).populate('author', 'username avatar');

            res.status(200).json({
                  success: true,
                  message: 'Post updated successfully',
                  data: post
            });
      } catch (error) {
            next(error);
      }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private (author of post or admin)
exports.deletePost = async (req, res, next) => {
      try {
            const post = await Post.findById(req.params.id);

            if (!post) {
                  return res.status(404).json({
                        success: false,
                        message: 'Post not found'
                  });
            }

            // Check if user is author or admin
            if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
                  return res.status(403).json({
                        success: false,
                        message: 'Not authorized to delete this post'
                  });
            }

            // Delete associated comments and likes
            await Comment.deleteMany({ post: req.params.id });
            await Like.deleteMany({ targetType: 'Post', targetId: req.params.id });

            await Post.findByIdAndDelete(req.params.id);
                   if (req.app.get('io')) {
                        req.app.get('io').emit('postDeleted', {
                        postId: req.params.id,
                        deletedBy: req.user.id,
                        timestamp: new Date()
                        });
                  }
            res.status(200).json({
                  success: true,
                  message: 'Post deleted successfully',
                  data: {}
            });
      } catch (error) {
            next(error);
      }
};


// @desc    Get author's posts for dashboard
// @route   GET /api/posts/author/dashboard
// @access  Private (author, admin)
exports.getAuthorDashboardPosts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 100,
      status
    } = req.query;

    const query = {
      author: req.user.id // فقط منشورات المستخدم الحالي
    };

    // Filter by status if provided
    if (status && status !== 'all') {
      query.status = status;
    }

    const posts = await Post.find(query)
      .populate('author', 'username avatar')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Post.countDocuments(query);

    res.status(200).json({
      success: true,
      data: posts,
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

