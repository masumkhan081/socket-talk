// abc
import mongoose, { Schema } from 'mongoose';
import { IPost } from '../types';

const postSchema = new Schema<IPost>({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
    maxlength: [2500, 'Post content must be less than 2500 characters'] // Allowing for 500 words approximately
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  dislikes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }]
}, {
  timestamps: true
});

// Indexes for better performance
postSchema.index({ author: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ likes: 1 });
postSchema.index({ dislikes: 1 });

// Validation for word count (approximately 500 words)
postSchema.pre('save', function(next) {
  const wordCount = this.content.trim().split(/\s+/).length;
  if (wordCount > 500) {
    return next(new Error('Post content must be less than 500 words'));
  }
  next();
});

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for dislike count
postSchema.virtual('dislikeCount').get(function() {
  return this.dislikes.length;
});

// Virtual for comment count
postSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Include virtuals in JSON
postSchema.set('toJSON', { virtuals: true });

export const Post = mongoose.model<IPost>('Post', postSchema);
