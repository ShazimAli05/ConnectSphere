const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

// @desc    Get messages for a conversation with pagination
// @route   GET /api/messages/:conversationId
// @access  Private
const getMessagesByConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    const isMember = conversation.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!isMember && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to view these messages.' });
    }

    // Reset unread count for this user in this conversation
    if (conversation.unreadCounts && conversation.unreadCounts.get(req.user._id.toString()) > 0) {
      conversation.unreadCounts.set(req.user._id.toString(), 0);
      await conversation.save();
    }

    const totalMessages = await Message.countDocuments({
      conversation: conversationId,
      deletedFor: { $ne: req.user._id },
    });

    const messages = await Message.find({
      conversation: conversationId,
      deletedFor: { $ne: req.user._id },
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'name username avatar')
      .populate({
        path: 'replyTo',
        select: 'content sender messageType attachments',
        populate: { path: 'sender', select: 'name username' },
      })
      .populate('reactions.user', 'name username avatar');

    // Return messages in chronological order (oldest to newest)
    const reversedMessages = messages.reverse();

    res.status(200).json({
      success: true,
      count: reversedMessages.length,
      total: totalMessages,
      page,
      totalPages: Math.ceil(totalMessages / limit),
      messages: reversedMessages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a new message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, content, messageType, attachments, replyTo } = req.body;
    const senderId = req.user._id;

    if (!conversationId) {
      return res.status(400).json({ success: false, message: 'Conversation ID is required.' });
    }

    if ((!content || !content.trim()) && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ success: false, message: 'Message must have content or attachments.' });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    const isMember = conversation.participants.some(
      (p) => p.toString() === senderId.toString()
    );
    if (!isMember) {
      return res.status(403).json({ success: false, message: 'You are not a member of this conversation.' });
    }

    const message = await Message.create({
      sender: senderId,
      conversation: conversationId,
      content: content ? content.trim() : '',
      messageType: messageType || (attachments && attachments.length > 0 ? 'image' : 'text'),
      attachments: attachments || [],
      replyTo: replyTo || null,
      readBy: [{ user: senderId, readAt: new Date() }],
    });

    // Update conversation lastMessage & increment unreadCounts for other participants
    conversation.lastMessage = message._id;
    conversation.participants.forEach((pId) => {
      const pidStr = pId.toString();
      if (pidStr !== senderId.toString()) {
        const currentCount = conversation.unreadCounts?.get?.(pidStr) || 0;
        conversation.unreadCounts.set(pidStr, currentCount + 1);
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

    res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Edit a message
// @route   PUT /api/messages/:id
// @access  Private
const editMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only edit your own messages.' });
    }

    if (message.isDeleted) {
      return res.status(400).json({ success: false, message: 'Cannot edit a deleted message.' });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Message content cannot be empty.' });
    }

    message.content = content.trim();
    message.isEdited = true;
    await message.save();

    const populated = await Message.findById(message._id)
      .populate('sender', 'name username avatar')
      .populate({
        path: 'replyTo',
        select: 'content sender messageType attachments',
        populate: { path: 'sender', select: 'name username' },
      })
      .populate('reactions.user', 'name username avatar');

    res.status(200).json({
      success: true,
      message: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Private
const deleteMessage = async (req, res, next) => {
  try {
    const { deleteForEveryone } = req.query;
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }

    const isSender = message.sender.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (deleteForEveryone === 'true') {
      if (!isSender && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Only the sender or an admin can delete a message for everyone.',
        });
      }

      message.isDeleted = true;
      message.content = 'This message was deleted';
      message.attachments = [];
      await message.save();

      return res.status(200).json({
        success: true,
        messageId: message._id,
        isDeleted: true,
        message: 'Message deleted for everyone.',
      });
    }

    // Delete for current user only
    if (!message.deletedFor.includes(req.user._id)) {
      message.deletedFor.push(req.user._id);
      await message.save();
    }

    res.status(200).json({
      success: true,
      messageId: message._id,
      deletedForMe: true,
      message: 'Message deleted for you.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle emoji reaction on a message
// @route   POST /api/messages/:id/reactions
// @access  Private
const toggleReaction = async (req, res, next) => {
  try {
    const { emoji } = req.body;
    const userId = req.user._id;

    if (!emoji) {
      return res.status(400).json({ success: false, message: 'Emoji reaction is required.' });
    }

    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }

    // Check if user already reacted with this emoji
    const existingIndex = message.reactions.findIndex(
      (r) => r.user.toString() === userId.toString() && r.emoji === emoji
    );

    if (existingIndex > -1) {
      // Remove reaction
      message.reactions.splice(existingIndex, 1);
    } else {
      // Add reaction (or replace user's previous reaction)
      const userPrevReaction = message.reactions.findIndex(
        (r) => r.user.toString() === userId.toString()
      );
      if (userPrevReaction > -1) {
        message.reactions[userPrevReaction].emoji = emoji;
        message.reactions[userPrevReaction].createdAt = new Date();
      } else {
        message.reactions.push({ user: userId, emoji, createdAt: new Date() });
      }
    }

    await message.save();

    const populated = await Message.findById(message._id)
      .populate('sender', 'name username avatar')
      .populate('reactions.user', 'name username avatar');

    res.status(200).json({
      success: true,
      message: populated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMessagesByConversation,
  sendMessage,
  editMessage,
  deleteMessage,
  toggleReaction,
};
