// abc
import { Router } from 'express';
import {
  getConversations,
  createConversation,
  createGroup,
  updateGroup,
  getMessages,
  sendMessage,
  inviteToGroup,
  respondToInvitation,
  leaveGroup,
  searchUsers,
  getDashboardStats
} from '../controllers/chatController';
import { authenticateToken, requireEmailVerification } from '../middleware/auth';
import { validateRequest, validateQuery } from '../middleware/validation';
import {
  createConversationSchema,
  createGroupSchema,
  updateGroupSchema,
  sendMessageSchema,
  inviteToGroupSchema,
  respondToInvitationSchema,
  searchUsersSchema
} from '../validation/chat';

const router = Router();

// All chat routes require authentication and email verification
router.use(authenticateToken, requireEmailVerification);

// Conversation routes
router.get('/conversations', getConversations);
router.post('/conversations', validateRequest(createConversationSchema), createConversation);

// Group routes
router.post('/groups', validateRequest(createGroupSchema), createGroup);
router.patch('/groups/:groupId', validateRequest(updateGroupSchema), updateGroup);
router.post('/groups/invite', validateRequest(inviteToGroupSchema), inviteToGroup);
router.post('/groups/invitations/respond', validateRequest(respondToInvitationSchema), respondToInvitation);
router.delete('/groups/:groupId/leave', leaveGroup);

// Message routes
router.get('/conversations/:conversationId/messages', getMessages);
router.post('/messages', validateRequest(sendMessageSchema), sendMessage);

// User search
router.get('/users/search', validateQuery(searchUsersSchema), searchUsers);

// Dashboard stats
router.get('/dashboard/stats', getDashboardStats);

export default router;
