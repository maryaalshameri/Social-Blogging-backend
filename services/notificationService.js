// services/notificationService.js
const Notification = require('../models/Notification');

class NotificationService {
  constructor(io) {
    this.io = io;
  }

  // إنشاء إشعار جديد وإرساله عبر Socket.io
  async createAndEmitNotification(notificationData) {
    try {
      const notification = await Notification.create(notificationData);
      
      const populatedNotification = await Notification.findById(notification._id)
        .populate('relatedPost', 'title slug')
        .populate('relatedUser', 'username avatar')
        .populate('relatedComment', 'content');

      // إرسال الإشعار للمستخدم المحدد عبر Socket.io
      if (this.io) {
        this.io.to(`user_${notificationData.user}`).emit('newNotification', populatedNotification);
        
        // تحديث عدد الإشعارات غير المقروءة
        const unreadCount = await Notification.countDocuments({ 
          user: notificationData.user, 
          read: false 
        });
        
        this.io.to(`user_${notificationData.user}`).emit('unreadCountUpdate', { unreadCount });
      }

      return populatedNotification;
    } catch (error) {
      console.error('Error creating and emitting notification:', error);
      return null;
    }
  }

  // إشعار عند الإعجاب على منشور
  async notifyPostLike({ postId, postAuthorId, likedByUserId, likedByUsername, postTitle }) {
    if (postAuthorId.toString() === likedByUserId.toString()) return; // لا ترسل إشعار للمستخدم نفسه

    const notification = await this.createAndEmitNotification({
      user: postAuthorId,
      type: 'like',
      title: 'New Like',
      message: `${likedByUsername} liked your post "${postTitle}"`,
      relatedPost: postId,
      relatedUser: likedByUserId
    });

    return notification;
  }

  // إشعار عند التعليق على منشور
  async notifyPostComment({ postId, postAuthorId, commentAuthorId, commentAuthorUsername, postTitle, commentContent }) {
    if (postAuthorId.toString() === commentAuthorId.toString()) return;

    const notification = await this.createAndEmitNotification({
      user: postAuthorId,
      type: 'comment',
      title: 'New Comment',
      message: `${commentAuthorUsername} commented on your post "${postTitle}": ${commentContent.substring(0, 100)}...`,
      relatedPost: postId,
      relatedComment: commentAuthorId,
      relatedUser: commentAuthorId
    });

    return notification;
  }

  // إشعار عند الرد على تعليق
  async notifyCommentReply({ commentId, commentAuthorId, replyAuthorId, replyAuthorUsername, postTitle, replyContent }) {
    if (commentAuthorId.toString() === replyAuthorId.toString()) return;

    const notification = await this.createAndEmitNotification({
      user: commentAuthorId,
      type: 'comment_reply',
      title: 'Comment Reply',
      message: `${replyAuthorUsername} replied to your comment on "${postTitle}": ${replyContent.substring(0, 100)}...`,
      relatedPost: commentId, // يمكن تعديل هذا حسب الهيكل
      relatedComment: commentId,
      relatedUser: replyAuthorId
    });

    return notification;
  }

  // إشعار عند نشر منشور جديد (للمتابعين)
  async notifyNewPostToFollowers({ postId, authorId, authorUsername, postTitle, followerIds }) {
    const notifications = [];
    
    for (const followerId of followerIds) {
      if (followerId.toString() !== authorId.toString()) {
        const notification = await this.createAndEmitNotification({
          user: followerId,
          type: 'post_published',
          title: 'New Post',
          message: `${authorUsername} published a new post: "${postTitle}"`,
          relatedPost: postId,
          relatedUser: authorId
        });
        
        if (notification) notifications.push(notification);
      }
    }

    return notifications;
  }

  // إشعارات النظام
  async notifySystemMessage({ userId, title, message, data = {} }) {
    const notification = await this.createAndEmitNotification({
      user: userId,
      type: 'system',
      title,
      message,
      data
    });

    return notification;
  }
}

module.exports = NotificationService;