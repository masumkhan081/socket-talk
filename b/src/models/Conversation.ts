import mongoose, { Schema } from 'mongoose';
import { IConversation } from '../types';

const conversationSchema = new Schema<IConversation>({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  isGroup: {
    type: Boolean,
    default: false
  },
  groupName: {
    type: String,
    trim: true,
    maxlength: [50, 'Group name must be less than 50 characters']
  },
  groupIcon: {
    type: String,
    default: null
  },
  groupDescription: {
    type: String,
    maxlength: [200, 'Group description must be less than 200 characters'],
    default: ''
  },
  admins: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastMessage: {
    type: Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better performance
conversationSchema.index({ participants: 1 });
conversationSchema.index({ isGroup: 1 });
conversationSchema.index({ lastActivity: -1 });
conversationSchema.index({ createdBy: 1 });

// Validation for group conversations
conversationSchema.pre('save', function(next) {
  if (this.isGroup) {
    if (!this.groupName) {
      return next(new Error('Group name is required for group conversations'));
    }
    if (this.participants.length < 2) {
      return next(new Error('Group conversations must have at least 2 participants'));
    }
    if (this.participants.length > 50) {
      return next(new Error('Group conversations cannot have more than 50 participants'));
    }
    // Ensure creator is an admin
    if (!this.admins.includes(this.createdBy)) {
      this.admins.push(this.createdBy);
    }
  } else {
    // One-to-one conversation validation
    if (this.participants.length !== 2) {
      return next(new Error('One-to-one conversations must have exactly 2 participants'));
    }
    // Clear group-specific fields
    this.groupName = undefined;
    this.groupIcon = undefined;
    this.groupDescription = undefined;
    this.admins = [];
  }
  next();
});

// Update lastActivity when conversation is modified
conversationSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.lastActivity = new Date();
  }
  next();
});

export const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema);
