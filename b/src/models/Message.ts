// abc
import mongoose, { Schema } from 'mongoose';
import { IMessage } from '../types';

const messageSchema = new Schema<IMessage>({
  conversation: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    maxlength: [1000, 'Message must be less than 1000 characters']
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  fileUrl: {
    type: String,
    default: null
  },
  fileName: {
    type: String,
    maxlength: [255, 'File name must be less than 255 characters'],
    default: null
  },
  fileSize: {
    type: Number,
    default: null
  },
  readBy: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for better performance
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ createdAt: -1 });

// Validation for file messages
messageSchema.pre('save', function(next) {
  if (this.messageType === 'image' || this.messageType === 'file') {
    if (!this.fileUrl) {
      return next(new Error('File URL is required for file messages'));
    }
  }
  next();
});

// Automatically mark message as read by sender
messageSchema.pre('save', function(next) {
  if (this.isNew) {
    this.readBy.push({
      user: this.sender,
      readAt: new Date()
    });
  }
  next();
});

export const Message = mongoose.model<IMessage>('Message', messageSchema);
