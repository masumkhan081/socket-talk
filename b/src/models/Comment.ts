// abc
import mongoose, { Schema } from 'mongoose';
import { IComment } from '../types';

const commentSchema = new Schema<IComment>({
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    maxlength: [1000, 'Comment must be less than 1000 characters']
  },
  parentComment: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  replies: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  dislikes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Indexes for better performance
commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ author: 1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ createdAt: -1 });

// Virtual for like count
commentSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for dislike count
commentSchema.virtual('dislikeCount').get(function() {
  return this.dislikes.length;
});

// Virtual for reply count
commentSchema.virtual('replyCount').get(function() {
  return this.replies.length;
});

// Include virtuals in JSON
commentSchema.set('toJSON', { virtuals: true });

// Add reply to parent comment when saving
commentSchema.post('save', async function() {
  if (this.parentComment) {
    await mongoose.model('Comment').findByIdAndUpdate(
      this.parentComment,
      { $addToSet: { replies: this._id } }
    );
  }
});

// Remove reply from parent comment when deleting
commentSchema.post('findOneAndDelete', async function(doc) {
  if (doc && doc.parentComment) {
    await mongoose.model('Comment').findByIdAndUpdate(
      doc.parentComment,
      { $pull: { replies: doc._id } }
    );
  }
});

export const Comment = mongoose.model<IComment>('Comment', commentSchema);
