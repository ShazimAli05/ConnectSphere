const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { JWT_SECRET } = require('../utils/tokenUtils');

/**
 * Socket.IO Manager
 * Handles real-time messaging, typing indicators, read receipts, and user presence
 */
const initSocketServer = (io) => {
  // Map of userId -> Set of socketIds (supports multi-device/multi-tab per user)
  const userSocketMap = new Map();

  // Socket middleware for JWT authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      if (user.isSuspended) {
        return next(new Error('Authentication error: Account suspended'));
      }

      socket.user = user;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();

    // 1. Register socket in multi-device map
    if (!userSocketMap.has(userId)) {
      userSocketMap.set(userId, new Set());
    }
    userSocketMap.get(userId).add(socket.id);

    // Update user status to online in database
    await User.findByIdAndUpdate(userId, { status: 'available', lastSeen: new Date() });

    // Inform client that socket is authenticated and ready
    socket.emit('connected', {
      userId,
      socketId: socket.id,
      timestamp: new Date(),
    });

    // Broadcast user online event to all clients
    io.emit('user_online', {
      userId,
      status: 'available',
      lastSeen: new Date(),
    });

    // Send the current list of online user IDs to the newly connected socket
    const onlineUserIds = Array.from(userSocketMap.keys());
    socket.emit('online_users_list', onlineUserIds);

    // 2. Room management: join active conversation room
    socket.on('join_conversation', async (conversationId) => {
      if (!conversationId) return;

      try {
        // Verify user is actually a participant of this conversation
        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: socket.user._id,
        });

        if (conversation) {
          socket.join(`conversation:${conversationId}`);
        }
      } catch (err) {
        console.error('[Socket] join_conversation error:', err.message);
      }
    });

    socket.on('leave_conversation', (conversationId) => {
      if (conversationId) {
        socket.leave(`conversation:${conversationId}`);
      }
    });

    // 3. Real-Time Typing Indicators
    socket.on('typing', ({ conversationId }) => {
      if (!conversationId) return;
      socket.to(`conversation:${conversationId}`).emit('typing', {
        conversationId,
        user: {
          _id: socket.user._id,
          name: socket.user.name,
          username: socket.user.username,
        },
      });
    });

    socket.on('stop_typing', ({ conversationId }) => {
      if (!conversationId) return;
      socket.to(`conversation:${conversationId}`).emit('stop_typing', {
        conversationId,
        userId: socket.user._id,
      });
    });

    // 4. Real-Time Message Broadcast (when created via socket or REST)
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, content, messageType, attachments, replyTo } = data;
        if (!conversationId) return;

        // Verify conversation membership
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        const isMember = conversation.participants.some(
          (p) => p.toString() === userId
        );
        if (!isMember) return;

        // Create message in database
        const message = await Message.create({
          sender: socket.user._id,
          conversation: conversationId,
          content: content || '',
          messageType: messageType || 'text',
          attachments: attachments || [],
          replyTo: replyTo || null,
          readBy: [{ user: socket.user._id, readAt: new Date() }],
        });

        // Update conversation lastMessage & unread counters
        conversation.lastMessage = message._id;
        conversation.participants.forEach((pId) => {
          const pidStr = pId.toString();
          if (pidStr !== userId) {
            const count = conversation.unreadCounts?.get?.(pidStr) || 0;
            conversation.unreadCounts.set(pidStr, count + 1);
          }
        });
        await conversation.save();

        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'name username avatar')
          .populate({
            path: 'replyTo',
            select: 'content sender messageType attachments',
            populate: { path: 'sender', select: 'name username' },
          })
          .populate('reactions.user', 'name username avatar');

        // Broadcast to all sockets in conversation room
        io.to(`conversation:${conversationId}`).emit('new_message', {
          conversationId,
          message: populatedMessage,
        });

        // Send notifications / updates to other participants who might not have room open
        conversation.participants.forEach((pId) => {
          const recipientIdStr = pId.toString();
          if (recipientIdStr !== userId && userSocketMap.has(recipientIdStr)) {
            userSocketMap.get(recipientIdStr).forEach((sId) => {
              io.to(sId).emit('notification_received', {
                conversationId,
                message: populatedMessage,
                sender: {
                  _id: socket.user._id,
                  name: socket.user.name,
                  avatar: socket.user.avatar,
                },
              });
            });
          }
        });
      } catch (err) {
        console.error('[Socket] send_message error:', err.message);
      }
    });

    // 5. Read Receipts
    socket.on('mark_as_read', async ({ conversationId, messageIds }) => {
      try {
        if (!conversationId) return;

        // Update conversation unread counter for current user
        const conversation = await Conversation.findById(conversationId);
        if (conversation && conversation.unreadCounts) {
          conversation.unreadCounts.set(userId, 0);
          await conversation.save();
        }

        // Mark messages as read by this user
        if (Array.isArray(messageIds) && messageIds.length > 0) {
          await Message.updateMany(
            {
              _id: { $in: messageIds },
              'readBy.user': { $ne: socket.user._id },
            },
            {
              $push: {
                readBy: {
                  user: socket.user._id,
                  readAt: new Date(),
                },
              },
            }
          );
        }

        // Broadcast read event to conversation room
        io.to(`conversation:${conversationId}`).emit('message_read', {
          conversationId,
          userId,
          readAt: new Date(),
          messageIds,
        });
      } catch (err) {
        console.error('[Socket] mark_as_read error:', err.message);
      }
    });

    // 6. Real-time message update / delete broadcast
    socket.on('message_updated', ({ conversationId, message }) => {
      if (conversationId && message) {
        io.to(`conversation:${conversationId}`).emit('message_updated', {
          conversationId,
          message,
        });
      }
    });

    socket.on('message_deleted', ({ conversationId, messageId }) => {
      if (conversationId && messageId) {
        io.to(`conversation:${conversationId}`).emit('message_deleted', {
          conversationId,
          messageId,
        });
      }
    });

    // 7. Disconnection & presence cleanup
    socket.on('disconnect', async () => {
      if (userSocketMap.has(userId)) {
        const userSockets = userSocketMap.get(userId);
        userSockets.delete(socket.id);

        // If no more open sockets for this user, mark as offline
        if (userSockets.size === 0) {
          userSocketMap.delete(userId);
          const now = new Date();
          await User.findByIdAndUpdate(userId, {
            status: 'offline',
            lastSeen: now,
          });

          // Broadcast offline event to all clients
          io.emit('user_offline', {
            userId,
            lastSeen: now,
          });
        }
      }
    });
  });

  return {
    getOnlineUsers: () => Array.from(userSocketMap.keys()),
    isUserOnline: (userId) => userSocketMap.has(userId.toString()),
  };
};

module.exports = initSocketServer;
