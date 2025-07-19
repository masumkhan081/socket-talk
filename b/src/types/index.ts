import { Request } from 'express';
import { Document, Types } from 'mongoose';

// Base API Response
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: Record<string, string>;
}

// Auth Types
export interface AuthenticatedRequest<P = any, ResBody = any, ReqBody = any, ReqQuery = any> extends Request<P, ResBody, ReqBody, ReqQuery> {
  userId?: string;
  user?: IUser;
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

// User Types
export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  profileImage?: string;
  bio?: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  isOnline: boolean;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(password: string): Promise<boolean>;
  generateEmailVerificationToken(): string;
  generatePasswordResetToken(): string;
}

// Chat Types
export interface IConversation extends Document {
  _id: Types.ObjectId;
  participants: Types.ObjectId[];
  isGroup: boolean;
  groupName?: string;
  groupIcon?: string;
  groupDescription?: string;
  admins: Types.ObjectId[];
  createdBy: Types.ObjectId;
  lastMessage?: Types.ObjectId;
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessage extends Document {
  _id: Types.ObjectId;
  conversation: Types.ObjectId;
  sender: Types.ObjectId;
  content: string;
  messageType: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  readBy: Array<{
    user: Types.ObjectId;
    readAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// Group Invitation Types
export interface IGroupInvitation extends Document {
  _id: Types.ObjectId;
  group: Types.ObjectId;
  inviter: Types.ObjectId;
  invitee: Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

// Post Types
export interface IPost extends Document {
  _id: Types.ObjectId;
  author: Types.ObjectId;
  content: string;
  likes: Types.ObjectId[];
  dislikes: Types.ObjectId[];
  comments: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IComment extends Document {
  _id: Types.ObjectId;
  post: Types.ObjectId;
  author: Types.ObjectId;
  content: string;
  parentComment?: Types.ObjectId;
  replies: Types.ObjectId[];
  likes: Types.ObjectId[];
  dislikes: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// Notification Types
export interface INotification extends Document {
  _id: Types.ObjectId;
  recipient: Types.ObjectId;
  sender: Types.ObjectId;
  type: 'group_invitation' | 'message' | 'post_like' | 'post_comment' | 'comment_reply';
  title: string;
  message: string;
  relatedId?: Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Socket Types
export interface ServerToClientEvents {
  message: (data: any) => void;
  notification: (data: any) => void;
  userOnline: (data: { userId: string; username: string }) => void;
  userOffline: (data: { userId: string }) => void;
  typing: (data: { conversationId: string; userId: string; username: string }) => void;
  stopTyping: (data: { conversationId: string; userId: string }) => void;
  groupInvitation: (data: any) => void;
  groupUpdate: (data: any) => void;
}

export interface ClientToServerEvents {
  joinRoom: (conversationId: string) => void;
  leaveRoom: (conversationId: string) => void;
  sendMessage: (data: any) => void;
  typing: (data: { conversationId: string }) => void;
  stopTyping: (data: { conversationId: string }) => void;
}

// Socket Events
export interface SocketEvents {
  send_message: {
    conversationId: string;
    content: string;
    messageType?: 'text' | 'image' | 'file';
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
  };
  typing_start: {
    conversationId: string;
  };
  typing_stop: {
    conversationId: string;
  };
  mark_messages_read: {
    conversationId: string;
    messageIds: string[];
  };
}

// Socket User
export interface SocketUser {
  userId: string;
  socketId: string;
  username: string;
  profileImage?: string;
  lastSeen: Date;
}

// Dashboard Stats
export interface DashboardStats {
  totalPosts: number;
  totalConversations: number;
  totalGroups: number;
  totalGroupsAsAdmin: number;
  totalComments: number;
  pendingInvitations: number;
}
