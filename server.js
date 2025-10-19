require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const path = require('path');
const Post = require('./models/Post'); // تأكد من استيراد نموذج Post
const Comment = require('./models/Comment'); // تأكد من استيراد نموذج Comment
const Like = require('./models/Like');
// Initialize express
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
const NotificationService = require('./services/notificationService');
const notificationService = new NotificationService(io);


app.set('notificationService', notificationService);

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Make io accessible to routes
app.set('io', io);


// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api', require('./routes/likeRoutes'));
app.use('/api/reader', require('./routes/readerRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Social Blogging Platform API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      posts: '/api/posts',
      comments: '/api/posts/:postId/comments',
      likes: '/api/posts/:postId/like or /api/comments/:commentId/like'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join a room (e.g., for specific post updates)
  socket.on('joinPost', (postId) => {
    socket.join(`post_${postId}`);
    console.log(`Client ${socket.id} joined post_${postId}`);
  });

  // Leave a room
  socket.on('leavePost', (postId) => {
    socket.leave(`post_${postId}`);
    console.log(`Client ${socket.id} left post_${postId}`);
  });
// Join user room when they connect
  socket.on('joinUserRoom', (userId) => {
  socket.join(`user_${userId}`);
  console.log(`User ${userId} joined their notification room`);
});

  // Handle user typing
  socket.on('userTyping', (data) => {
    socket.to(`post_${data.postId}`).emit('userTyping', {
      username: data.username,
      isTyping: data.isTyping
    });
  });

  // Handle post likes
  socket.on('likePost', async (data) => {
    try {
      // تحديث الإعجاب في قاعدة البيانات
      const post = await Post.findById(data.postId);
      if (!post) {
        console.error('Post not found:', data.postId);
        return;
      }
      
      // بث الحدث لجميع المستخدمين المتصلين
      io.emit('postLiked', {
        postId: data.postId,
        userId: data.userId,
        likesCount: post.likesCount
      });
      
      console.log(`Post ${data.postId} liked by user ${data.userId}`);
    } catch (error) {
      console.error('Error handling likePost:', error);
    }
  });

  // Handle post unlikes
  socket.on('unlikePost', async (data) => {
    try {
      // تحديث الإعجاب في قاعدة البيانات
      const post = await Post.findById(data.postId);
      if (!post) {
        console.error('Post not found:', data.postId);
        return;
      }
      
      // بث الحدث لجميع المستخدمين المتصلين
      io.emit('postUnliked', {
        postId: data.postId,
        userId: data.userId,
        likesCount: post.likesCount
      });
      
      console.log(`Post ${data.postId} unliked by user ${data.userId}`);
    } catch (error) {
      console.error('Error handling unlikePost:', error);
    }
  });

  // Handle new comments
  socket.on('addComment', async (data) => {
  try {
    // تأكد من وجود التعليق في قاعدة البيانات
    const comment = await Comment.findById(data.comment._id).populate('author', 'username avatar');
    if (!comment) {
      console.error('Comment not found:', data.comment._id);
      return;
    }
    
    // بث الحدث لجميع المستخدمين في غرفة المنشور فقط
    io.to(`post_${data.postId}`).emit('commentAdded', {
      postId: data.postId,
      comment: comment
    });
    
    console.log(`New comment added to post ${data.postId}`);
  } catch (error) {
    console.error('Error handling addComment:', error);
  }
});

socket.on('deleteComment', async (data) => {
  try {
    // بث الحدث لجميع المستخدمين في غرفة المنشور فقط
    io.to(`post_${data.postId}`).emit('commentDeleted', {
      postId: data.postId,
      commentId: data.commentId
    });
    
    console.log(`Comment ${data.commentId} deleted from post ${data.postId}`);
  } catch (error) {
    console.error('Error handling deleteComment:', error);
  }
});





socket.on('deletePost', async (data) => {
    try {
      // بث حدث حذف المنشور لجميع المستخدمين المتصلين
      io.emit('postDeleted', {
        postId: data.postId,
        deletedBy: data.deletedBy,
        timestamp: new Date()
      });
      
      console.log(`Post ${data.postId} deleted by user ${data.deletedBy}`);
    } catch (error) {
      console.error('Error handling deletePost:', error);
    }
  });


  // Handle comment likes
socket.on('likeComment', async (data) => {
    try {
      const comment = await Comment.findById(data.commentId);
      if (!comment) {
        console.error('Comment not found:', data.commentId);
        return;
      }
      
      // بث الحدث لجميع المستخدمين المتصلين
      io.emit('commentLiked', {
        commentId: data.commentId,
        userId: data.userId,
        likesCount: comment.likesCount
      });
      
      console.log(`Comment ${data.commentId} liked by user ${data.userId}`);
    } catch (error) {
      console.error('Error handling likeComment:', error);
    }
  });

  // Handle comment unlikes - إضافة هذا الجزء
  socket.on('unlikeComment', async (data) => {
    try {
      const comment = await Comment.findById(data.commentId);
      if (!comment) {
        console.error('Comment not found:', data.commentId);
        return;
      }
      
      // بث الحدث لجميع المستخدمين المتصلين
      io.emit('commentUnliked', {
        commentId: data.commentId,
        userId: data.userId,
        likesCount: comment.likesCount
      });
      
      console.log(`Comment ${data.commentId} unliked by user ${data.userId}`);
    } catch (error) {
      console.error('Error handling unlikeComment:', error);
    }
  });
  // Handle notification events
  socket.on('markNotificationAsRead', async (data) => {
  try {
    // يمكنك تنفيذ المنطق هنا أو استخدام الكونترولر
    console.log('Mark notification as read:', data);
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
});
// Handle post views
socket.on('viewPost', async (data) => {
  try {
    const post = await Post.findById(data.postId)
    if (!post) {
      console.error('Post not found:', data.postId)
      return
    }
    
    // زيادة عدد المشاهدات مرة واحدة فقط
    post.views += 1
    await post.save()
    
    // بث تحديث عدد المشاهدات لجميع المستخدمين في الغرفة
    io.to(`post_${data.postId}`).emit('postViewed', {
      postId: data.postId,
      views: post.views
    })
    
    console.log(`Post ${data.postId} viewed by user ${data.userId}, views: ${post.views}`)
  } catch (error) {
    console.error('Error handling viewPost:', error)
  }
})


socket.on('followUser', async (data) => {
  try {
    const { targetUserId, followerId } = data;
    
    // بث الحدث للمستخدم المتابَع
    io.to(`user_${targetUserId}`).emit('userFollowed', {
      followerId,
      targetUserId,
      timestamp: new Date()
    });
    
    // بث الحدث لجميع المتصلين لتحديث الإحصائيات
    io.emit('userFollowed', {
      followerId,
      targetUserId,
      timestamp: new Date()
    });
    
    console.log(`User ${followerId} followed user ${targetUserId}`);
  } catch (error) {
    console.error('Error handling followUser:', error);
  }
});

socket.on('unfollowUser', async (data) => {
  try {
    const { targetUserId, followerId } = data;
    
    // بث الحدث للمستخدم المتابَع
    io.to(`user_${targetUserId}`).emit('userUnfollowed', {
      followerId,
      targetUserId,
      timestamp: new Date()
    });
    
    // بث الحدث لجميع المتصلين لتحديث الإحصائيات
    io.emit('userUnfollowed', {
      followerId,
      targetUserId,
      timestamp: new Date()
    });
    
    console.log(`User ${followerId} unfollowed user ${targetUserId}`);
  } catch (error) {
    console.error('Error handling unfollowUser:', error);
  }
});
  // Disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});



// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`Socket.io listening for real-time connections`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});





