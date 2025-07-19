import mongoose, { Schema } from 'mongoose';
import { INotification } from '../types';

const notificationSchema = new Schema<INotification>({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['group_invitation', 'message', 'post_like', 'post_comment', 'comment_reply'],
    required: true
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    maxlength: [100, 'Title must be less than 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    maxlength: [500, 'Message must be less than 500 characters']
  },
  relatedId: {
    type: Schema.Types.ObjectId,
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better performance
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ sender: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ createdAt: -1 });

// Compound index for efficient queries
notificationSchema.index({ recipient: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
