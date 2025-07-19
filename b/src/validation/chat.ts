// abc
import { z } from 'zod';

export const createConversationSchema = z.object({
  participantId: z.string()
    .min(1, 'Participant ID is required')
});

export const createGroupSchema = z.object({
  groupName: z.string()
    .min(1, 'Group name is required')
    .max(50, 'Group name must be less than 50 characters'),
  groupDescription: z.string()
    .max(200, 'Group description must be less than 200 characters')
    .optional(),
  participants: z.array(z.string())
    .min(1, 'At least one participant is required')
    .max(50, 'Maximum 50 participants allowed'),
  groupIcon: z.string()
    .url('Please provide a valid image URL')
    .optional()
});

export const updateGroupSchema = z.object({
  groupName: z.string()
    .min(1, 'Group name is required')
    .max(50, 'Group name must be less than 50 characters')
    .optional(),
  groupDescription: z.string()
    .max(200, 'Group description must be less than 200 characters')
    .optional(),
  groupIcon: z.string()
    .url('Please provide a valid image URL')
    .optional()
});

export const sendMessageSchema = z.object({
  conversationId: z.string()
    .min(1, 'Conversation ID is required'),
  content: z.string()
    .min(1, 'Message content is required')
    .max(1000, 'Message must be less than 1000 characters'),
  messageType: z.enum(['text', 'image', 'file'])
    .default('text'),
  fileUrl: z.string()
    .url('Please provide a valid file URL')
    .optional(),
  fileName: z.string()
    .max(255, 'File name must be less than 255 characters')
    .optional()
});

export const inviteToGroupSchema = z.object({
  groupId: z.string()
    .min(1, 'Group ID is required'),
  inviteeId: z.string()
    .min(1, 'Invitee ID is required')
});

export const respondToInvitationSchema = z.object({
  invitationId: z.string()
    .min(1, 'Invitation ID is required'),
  response: z.enum(['accepted', 'rejected'])
});

export const addGroupAdminSchema = z.object({
  groupId: z.string()
    .min(1, 'Group ID is required'),
  userId: z.string()
    .min(1, 'User ID is required')
});

export const removeFromGroupSchema = z.object({
  groupId: z.string()
    .min(1, 'Group ID is required'),
  userId: z.string()
    .min(1, 'User ID is required')
});

export const searchUsersSchema = z.object({
  query: z.string()
    .min(1, 'Search query is required')
    .max(50, 'Search query must be less than 50 characters')
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type InviteToGroupInput = z.infer<typeof inviteToGroupSchema>;
export type RespondToInvitationInput = z.infer<typeof respondToInvitationSchema>;
export type AddGroupAdminInput = z.infer<typeof addGroupAdminSchema>;
export type RemoveFromGroupInput = z.infer<typeof removeFromGroupSchema>;
export type SearchUsersInput = z.infer<typeof searchUsersSchema>;
