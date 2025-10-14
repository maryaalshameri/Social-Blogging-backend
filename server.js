require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const path = require('path');
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

      // Handle user typing
      socket.on('userTyping', (data) => {
            socket.to(`post_${data.postId}`).emit('userTyping', {
                  username: data.username,
                  isTyping: data.isTyping
            });
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

