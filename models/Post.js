const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
      title: {
            type: String,
            required: [true, 'Post title is required'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters']
      },
      content: {
            type: String,
            required: [true, 'Post content is required']
      },
      author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
      },
      image: {
            type: String,
            default: ''
      },
      tags: [{
            type: String,
            trim: true
      }],
      status: {
            type: String,
            enum: ['draft', 'published', 'archived'],
            default: 'published'
      },
      views: {
            type: Number,
            default: 0
      },
      likesCount: {
            type: Number,
            default: 0
      },
      commentsCount: {
            type: Number,
            default: 0
      }
}, {
      timestamps: true
});

// Index for search and filtering
postSchema.index({ title: 'text', content: 'text', tags: 'text' });
postSchema.index({ createdAt: -1 });
postSchema.index({ author: 1 });

module.exports = mongoose.model('Post', postSchema);

