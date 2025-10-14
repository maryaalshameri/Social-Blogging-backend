const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
      user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
      },
      targetType: {
            type: String,
            enum: ['Post', 'Comment'],
            required: true
      },
      targetId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'targetType'
      },
      reactionType: {
            type: String,
            enum: ['like', 'love', 'haha', 'wow', 'sad', 'angry'],
            default: 'like'
      }
}, {
      timestamps: true
});

// Ensure one reaction per user per target
likeSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });
likeSchema.index({ targetType: 1, targetId: 1 });

module.exports = mongoose.model('Like', likeSchema);

