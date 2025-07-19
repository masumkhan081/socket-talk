// abc
import mongoose, { Schema } from 'mongoose';
import { IGroupInvitation } from '../types';

const groupInvitationSchema = new Schema<IGroupInvitation>({
  group: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  inviter: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  invitee: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Indexes for better performance
groupInvitationSchema.index({ group: 1 });
groupInvitationSchema.index({ invitee: 1, status: 1 });
groupInvitationSchema.index({ inviter: 1 });
groupInvitationSchema.index({ createdAt: -1 });

// Compound index to prevent duplicate invitations
groupInvitationSchema.index({ group: 1, invitee: 1 }, { unique: true });

// Validation to prevent self-invitation
groupInvitationSchema.pre('save', function(next) {
  if (this.inviter.equals(this.invitee)) {
    return next(new Error('Cannot invite yourself to a group'));
  }
  next();
});

export const GroupInvitation = mongoose.model<IGroupInvitation>('GroupInvitation', groupInvitationSchema);
