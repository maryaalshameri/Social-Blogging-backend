// controllers/notificationController.js
const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getUserNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const query = { user: req.user.id };
    if (unreadOnly === 'true') {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .populate('relatedPost', 'title slug')
      .populate('relatedUser', 'username avatar')
      .populate('relatedComment', 'content')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      user: req.user.id, 
      read: false 
    });

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        unreadCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${req.user.id}`).emit('notificationRead', {
        notificationId: notification._id,
        unreadCount: await Notification.countDocuments({ 
          user: req.user.id, 
          read: false 
        })
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, read: false },
      { read: true }
    );

    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${req.user.id}`).emit('allNotificationsRead');
    }

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    const unreadCount = await Notification.countDocuments({ 
      user: req.user.id, 
      read: false 
    });

    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${req.user.id}`).emit('notificationDeleted', {
        notificationId: notification._id,
        unreadCount
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get notification stats
// @route   GET /api/notifications/stats
// @access  Private
exports.getNotificationStats = async (req, res, next) => {
  try {
    const total = await Notification.countDocuments({ user: req.user.id });
    const unread = await Notification.countDocuments({ 
      user: req.user.id, 
      read: false 
    });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayCount = await Notification.countDocuments({
      user: req.user.id,
      createdAt: { $gte: today }
    });

    res.status(200).json({
      success: true,
      data: {
        total,
        unread,
        today: todayCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// Utility function to create notifications (for use in other controllers)
exports.createNotification = async (data) => {
  try {
    const notification = await Notification.create(data);
    
    // Populate for socket emission
    const populatedNotification = await Notification.findById(notification._id)
      .populate('relatedPost', 'title slug')
      .populate('relatedUser', 'username avatar')
      .populate('relatedComment', 'content');

    return populatedNotification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};