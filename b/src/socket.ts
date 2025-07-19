import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifySocketToken } from './utils/jwt';
import { User } from './models/User';
import { Message } from './models/Message';
import { Conversation } from './models/Conversation';
import { SocketUser, SocketEvents } from './types';

// Extend Socket interface
interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

export const initializeSocket = (server: HttpServer) => {
   const io = new Server(server, {
      cors: {
         origin: process.env.CLIENT_URL || 'http://localhost:3000',
         methods: ['GET', 'POST'],
         credentials: true
      }
   });

   // Connected users map
   const connectedUsers = new Map<string, SocketUser>();

   // Socket authentication middleware
   io.use(async (socket, next) => {
      try {
         const token = socket.handshake.auth.token;
         if (!token) {
            return next(new Error('Authentication token required'));
         }

         const decoded = verifySocketToken(token);
         if (!decoded) {
            return next(new Error('Invalid token'));
         }

         const user = await User.findById(decoded.userId).select('-password');
         if (!user) {
            return next(new Error('User not found'));
         }

         socket.userId = decoded.userId;
         socket.user = user;
         next();
      } catch (error) {
         next(new Error('Authentication failed'));
      }
   });

   // Socket connection handling
   io.on('connection', async (socket: AuthenticatedSocket) => {
      console.log(`User connected: ${socket.user?.username} (${socket.userId})`);

      // Add user to connected users
      connectedUsers.set(socket.userId!, {
         userId: socket.userId!,
         socketId: socket.id,
         username: socket.user!.username,
         profileImage: socket.user!.profileImage,
         lastSeen: new Date()
      });

      // Update user online status
      await User.findByIdAndUpdate(socket.userId, {
         isOnline: true,
         lastSeen: new Date()
      });

      // Join user to their conversation rooms
      const conversations = await Conversation.find({
         participants: socket.userId
      }).select('_id');

      conversations.forEach(conversation => {
         socket.join(conversation._id.toString());
      });

      // Emit user online status to all connected users
      socket.broadcast.emit('user_online', {
         userId: socket.userId,
         username: socket.user?.username,
         isOnline: true
      });

      // Handle joining a conversation
      socket.on('join_conversation', (conversationId: string) => {
         socket.join(conversationId);
         console.log(`User ${socket.user?.username} joined conversation ${conversationId}`);
      });

      // Handle leaving a conversation
      socket.on('leave_conversation', (conversationId: string) => {
         socket.leave(conversationId);
         console.log(`User ${socket.user?.username} left conversation ${conversationId}`);
      });

      // Handle sending a message
      socket.on('send_message', async (data: SocketEvents['send_message']) => {
         try {
            const { conversationId, content, messageType = 'text', fileUrl, fileName, fileSize } = data;

            // Verify user is part of the conversation
            const conversation = await Conversation.findOne({
               _id: conversationId,
               participants: socket.userId
            });

            if (!conversation) {
               socket.emit('error', { message: 'Conversation not found or access denied' });
               return;
            }

            // Create and save the message
            const message = new Message({
               conversation: conversationId,
               sender: socket.userId,
               content,
               messageType,
               fileUrl,
               fileName,
               fileSize
            });

            await message.save();
            await message.populate('sender', 'username profileImage');

            // Update conversation's last message
            conversation.lastMessage = message._id;
            conversation.updatedAt = new Date();
            await conversation.save();

            // Emit message to all participants in the conversation
            io.to(conversationId).emit('new_message', {
               message: {
                  _id: message._id,
                  conversation: message.conversation,
                  sender: message.sender,
                  content: message.content,
                  messageType: message.messageType,
                  fileUrl: message.fileUrl,
                  fileName: message.fileName,
                  fileSize: message.fileSize,
                  createdAt: message.createdAt,
                  updatedAt: message.updatedAt
               }
            });

            console.log(`Message sent in conversation ${conversationId} by ${socket.user?.username}`);
         } catch (error) {
            console.error('Send message error:', error);
            socket.emit('error', { message: 'Failed to send message' });
         }
      });

      // Handle typing indicators
      socket.on('typing_start', (data: SocketEvents['typing_start']) => {
         socket.to(data.conversationId).emit('user_typing', {
            userId: socket.userId,
            username: socket.user?.username,
            conversationId: data.conversationId
         });
      });

      socket.on('typing_stop', (data: SocketEvents['typing_stop']) => {
         socket.to(data.conversationId).emit('user_stopped_typing', {
            userId: socket.userId,
            conversationId: data.conversationId
         });
      });

      // Handle message read receipts
      socket.on('mark_messages_read', async (data: SocketEvents['mark_messages_read']) => {
         try {
            const { conversationId, messageIds } = data;

            // Update read receipts for the messages
            await Message.updateMany(
               {
                  _id: { $in: messageIds },
                  conversation: conversationId,
                  sender: { $ne: socket.userId }
               },
               {
                  $addToSet: {
                     readBy: {
                        user: socket.userId,
                        readAt: new Date()
                     }
                  }
               }
            );

            // Emit read receipt to other participants
            socket.to(conversationId).emit('messages_read', {
               userId: socket.userId,
               username: socket.user?.username,
               conversationId,
               messageIds
            });
         } catch (error) {
            console.error('Mark messages read error:', error);
         }
      });

      // Handle user disconnect
      socket.on('disconnect', async () => {
         console.log(`User disconnected: ${socket.user?.username} (${socket.userId})`);

         // Remove user from connected users
         connectedUsers.delete(socket.userId!);

         // Update user offline status
         await User.findByIdAndUpdate(socket.userId, {
            isOnline: false,
            lastSeen: new Date()
         });

         // Emit user offline status to all connected users
         socket.broadcast.emit('user_offline', {
            userId: socket.userId,
            username: socket.user?.username,
            isOnline: false,
            lastSeen: new Date()
         });
      });

      // Handle errors
      socket.on('error', (error) => {
         console.error('Socket error:', error);
      });
   });

   return { io, connectedUsers };
};
