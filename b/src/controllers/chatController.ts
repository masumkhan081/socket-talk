// abc
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';
import { GroupInvitation } from '../models/GroupInvitation';
import { Notification } from '../models/Notification';
import { ApiResponse, AuthenticatedRequest, DashboardStats } from '../types';
import {
  CreateConversationInput,
  CreateGroupInput,
  UpdateGroupInput,
  SendMessageInput,
  InviteToGroupInput,
  RespondToInvitationInput,
  AddGroupAdminInput,
  RemoveFromGroupInput,
  SearchUsersInput
} from '../validation/chat';

export const getConversations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const conversations = await Conversation.find({
      participants: req.userId
    })
    .populate('participants', 'username profileImage isOnline lastSeen')
    .populate('lastMessage', 'content messageType createdAt sender')
    .populate('createdBy', 'username profileImage')
    .sort({ lastActivity: -1 });

    const response: ApiResponse = {
      success: true,
      message: 'Conversations retrieved successfully',
      data: { conversations }
    };

    return res.json(response);
  } catch (error) {
    console.error('Get conversations error:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
      error: 'Failed to retrieve conversations'
    };

    return res.status(500).json(response);
  }
};

export const createConversation = async (req: AuthenticatedRequest<{}, {}, CreateConversationInput>, res: Response) => {
  try {
    const { participantId } = req.body;

    // Check if participant exists
    const participant = await User.findById(participantId);
    if (!participant) {
      const response: ApiResponse = {
        success: false,
        message: 'User not found',
        error: 'The user you are trying to chat with does not exist'
      };
      return res.status(404).json(response);
    }

    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      participants: { $all: [req.userId, participantId] },
      isGroup: false
    });

    if (existingConversation) {
      const response: ApiResponse = {
        success: true,
        message: 'Conversation already exists',
        data: { conversation: existingConversation }
      };
      return res.json(response);
    }

    // Create new conversation
    const conversation = new Conversation({
      participants: [req.userId, participantId],
      isGroup: false,
      createdBy: req.userId
    });

    await conversation.save();
    await conversation.populate('participants', 'username profileImage isOnline lastSeen');

    const response: ApiResponse = {
      success: true,
      message: 'Conversation created successfully',
      data: { conversation }
    };

    return res.status(201).json(response);
  } catch (error) {
    console.error('Create conversation error:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
      error: 'Failed to create conversation'
    };

    return res.status(500).json(response);
  }
};

export const createGroup = async (req: AuthenticatedRequest<{}, {}, CreateGroupInput>, res: Response) => {
  try {
    const { groupName, groupDescription, participants, groupIcon } = req.body;

    // Validate participants exist
    const validParticipants = await User.find({
      _id: { $in: participants }
    });

    if (validParticipants.length !== participants.length) {
      const response: ApiResponse = {
        success: false,
        message: 'Some participants not found',
        error: 'One or more selected users do not exist'
      };
      return res.status(404).json(response);
    }

    // Add creator to participants if not already included
    const allParticipants = [...new Set([req.userId!, ...participants])];

    const group = new Conversation({
      participants: allParticipants,
      isGroup: true,
      groupName,
      groupDescription,
      groupIcon,
      createdBy: req.userId,
      admins: [req.userId]
    });

    await group.save();
    await group.populate('participants', 'username profileImage isOnline lastSeen');
    await group.populate('createdBy', 'username profileImage');

    const response: ApiResponse = {
      success: true,
      message: 'Group created successfully',
      data: { group }
    };

    return res.status(201).json(response);
  } catch (error) {
    console.error('Create group error:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
      error: 'Failed to create group'
    };

    return res.status(500).json(response);
  }
};

export const updateGroup = async (req: AuthenticatedRequest<{ groupId: string }, {}, UpdateGroupInput>, res: Response) => {
  try {
    const { groupId } = req.params;
    const updates = req.body;

    const group = await Conversation.findOne({
      _id: groupId,
      isGroup: true,
      admins: req.userId
    });

    if (!group) {
      const response: ApiResponse = {
        success: false,
        message: 'Group not found or insufficient permissions',
        error: 'You can only update groups where you are an admin'
      };
      return res.status(404).json(response);
    }

    Object.assign(group, updates);
    await group.save();
    await group.populate('participants', 'username profileImage isOnline lastSeen');

    const response: ApiResponse = {
      success: true,
      message: 'Group updated successfully',
      data: { group }
    };

    return res.json(response);
  } catch (error) {
    console.error('Update group error:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
      error: 'Failed to update group'
    };

    return res.status(500).json(response);
  }
};

export const getMessages = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { conversationId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Check if user is part of the conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.userId
    });

    if (!conversation) {
      const response: ApiResponse = {
        success: false,
        message: 'Conversation not found',
        error: 'You are not part of this conversation'
      };
      return res.status(404).json(response);
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'username profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalMessages = await Message.countDocuments({ conversation: conversationId });

    const response: ApiResponse = {
      success: true,
      message: 'Messages retrieved successfully',
      data: {
        messages: messages.reverse(), // Reverse to show oldest first
        pagination: {
          page,
          limit,
          total: totalMessages,
          pages: Math.ceil(totalMessages / limit)
        }
      }
    };

    return res.json(response);
  } catch (error) {
    console.error('Get messages error:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
      error: 'Failed to retrieve messages'
    };

    return res.status(500).json(response);
  }
};

export const sendMessage = async (req: AuthenticatedRequest<{}, {}, SendMessageInput>, res: Response) => {
  try {
    const { conversationId, content, messageType, fileUrl, fileName } = req.body;

    // Check if user is part of the conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.userId
    });

    if (!conversation) {
      const response: ApiResponse = {
        success: false,
        message: 'Conversation not found',
        error: 'You are not part of this conversation'
      };
      return res.status(404).json(response);
    }

    const message = new Message({
      conversation: conversationId,
      sender: req.userId,
      content,
      messageType,
      fileUrl,
      fileName
    });

    await message.save();
    await message.populate('sender', 'username profileImage');

    // Update conversation's last message and activity
    conversation.lastMessage = message._id;
    conversation.lastActivity = new Date();
    await conversation.save();

    const response: ApiResponse = {
      success: true,
      message: 'Message sent successfully',
      data: { message }
    };

    return res.status(201).json(response);
  } catch (error) {
    console.error('Send message error:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
      error: 'Failed to send message'
    };

    return res.status(500).json(response);
  }
};

export const inviteToGroup = async (req: AuthenticatedRequest<{}, {}, InviteToGroupInput>, res: Response) => {
  try {
    const { groupId, inviteeId } = req.body;

    // Check if group exists and user is admin
    const group = await Conversation.findOne({
      _id: groupId,
      isGroup: true,
      admins: req.userId
    });

    if (!group) {
      const response: ApiResponse = {
        success: false,
        message: 'Group not found or insufficient permissions',
        error: 'You can only invite users to groups where you are an admin'
      };
      return res.status(404).json(response);
    }

    // Check if invitee exists
    const invitee = await User.findById(inviteeId);
    if (!invitee) {
      const response: ApiResponse = {
        success: false,
        message: 'User not found',
        error: 'The user you are trying to invite does not exist'
      };
      return res.status(404).json(response);
    }

    // Check if user is already a participant
    if (group.participants.includes(new mongoose.Types.ObjectId(inviteeId))) {
      const response: ApiResponse = {
        success: false,
        message: 'User already in group',
        error: 'This user is already a member of the group'
      };
      return res.status(400).json(response);
    }

    // Check if invitation already exists
    const existingInvitation = await GroupInvitation.findOne({
      group: groupId,
      invitee: inviteeId,
      status: 'pending'
    });

    if (existingInvitation) {
      const response: ApiResponse = {
        success: false,
        message: 'Invitation already sent',
        error: 'An invitation has already been sent to this user'
      };
      return res.status(400).json(response);
    }

    // Create invitation
    const invitation = new GroupInvitation({
      group: groupId,
      inviter: req.userId,
      invitee: inviteeId
    });

    await invitation.save();

    // Create notification
    const notification = new Notification({
      recipient: inviteeId,
      sender: req.userId,
      type: 'group_invitation',
      title: 'Group Invitation',
      message: `${req.user?.username} invited you to join "${group.groupName}"`,
      relatedId: invitation._id
    });

    await notification.save();

    const response: ApiResponse = {
      success: true,
      message: 'Invitation sent successfully',
      data: { invitation }
    };

    return res.status(201).json(response);
  } catch (error) {
    console.error('Invite to group error:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
      error: 'Failed to send invitation'
    };

    return res.status(500).json(response);
  }
};

export const respondToInvitation = async (req: AuthenticatedRequest<{}, {}, RespondToInvitationInput>, res: Response) => {
  try {
    const { invitationId, response: invitationResponse } = req.body;

    const invitation = await GroupInvitation.findOne({
      _id: invitationId,
      invitee: req.userId,
      status: 'pending'
    }).populate('group');

    if (!invitation) {
      const response: ApiResponse = {
        success: false,
        message: 'Invitation not found',
        error: 'Invalid or expired invitation'
      };
      return res.status(404).json(response);
    }

    invitation.status = invitationResponse;
    await invitation.save();

    if (invitationResponse === 'accepted') {
      // Add user to group
      await Conversation.findByIdAndUpdate(invitation.group._id, {
        $addToSet: { participants: req.userId }
      });
    }

    const response: ApiResponse = {
      success: true,
      message: `Invitation ${invitationResponse} successfully`,
      data: { invitation }
    };

    return res.json(response);
  } catch (error) {
    console.error('Respond to invitation error:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
      error: 'Failed to respond to invitation'
    };

    return res.status(500).json(response);
  }
};

export const leaveGroup = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { groupId } = req.params;

    const group = await Conversation.findOne({
      _id: groupId,
      isGroup: true,
      participants: req.userId
    });

    if (!group) {
      const response: ApiResponse = {
        success: false,
        message: 'Group not found',
        error: 'You are not a member of this group'
      };
      return res.status(404).json(response);
    }

    // Remove user from participants and admins
    group.participants = group.participants.filter(p => !p.equals(req.userId!));
    group.admins = group.admins.filter(a => !a.equals(req.userId!));

    // If no admins left, make the creator an admin
    if (group.admins.length === 0 && group.participants.length > 0) {
      group.admins.push(group.participants[0]);
    }

    await group.save();

    const response: ApiResponse = {
      success: true,
      message: 'Left group successfully'
    };

    return res.json(response);
  } catch (error) {
    console.error('Leave group error:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
      error: 'Failed to leave group'
    };

    return res.status(500).json(response);
  }
};

export const searchUsers = async (req: AuthenticatedRequest<{}, {}, {}, SearchUsersInput>, res: Response) => {
  try {
    const { query } = req.query;

    const users = await User.find({
      $and: [
        { _id: { $ne: req.userId } }, // Exclude current user
        {
          $or: [
            { username: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    })
    .select('username email profileImage isOnline lastSeen')
    .limit(20);

    const response: ApiResponse = {
      success: true,
      message: 'Users found successfully',
      data: { users }
    };

    return res.json(response);
  } catch (error) {
    console.error('Search users error:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
      error: 'Failed to search users'
    };

    return res.status(500).json(response);
  }
};

export const getDashboardStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const [
      totalConversations,
      totalGroups,
      totalGroupsAsAdmin,
      pendingInvitations
    ] = await Promise.all([
      Conversation.countDocuments({ participants: userId }),
      Conversation.countDocuments({ participants: userId, isGroup: true }),
      Conversation.countDocuments({ admins: userId, isGroup: true }),
      GroupInvitation.countDocuments({ invitee: userId, status: 'pending' })
    ]);

    const stats: DashboardStats = {
      totalPosts: 0, // Will be updated when we implement posts
      totalConversations,
      totalGroups,
      totalGroupsAsAdmin,
      totalComments: 0, // Will be updated when we implement posts
      pendingInvitations
    };

    const response: ApiResponse = {
      success: true,
      message: 'Dashboard stats retrieved successfully',
      data: { stats }
    };

    return res.json(response);
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
      error: 'Failed to retrieve dashboard stats'
    };

    return res.status(500).json(response);
  }
};
