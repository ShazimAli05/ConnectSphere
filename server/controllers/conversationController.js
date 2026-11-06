const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get all conversations for the logged in user
// @route   GET /api/conversations
// @access  Private
const getUserConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate('participants', 'name username avatar bio status customStatus lastSeen')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'name username avatar',
        },
      })
      .populate('groupAdmin', 'name username avatar')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: conversations.length,
      conversations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get or create a direct 1-to-1 conversation
// @route   POST /api/conversations/direct
// @access  Private
const getOrCreateDirectConversation = async (req, res, next) => {
  try {
    const { recipientId } = req.body;
    const currentUserId = req.user._id;

    if (!recipientId) {
      return res.status(400).json({ success: false, message: 'Recipient ID is required.' });
    }

    if (recipientId === currentUserId.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot start a direct chat with yourself.' });
    }

    // Verify recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ success: false, message: 'Recipient user not found.' });
    }

    // Find existing direct conversation
    let conversation = await Conversation.findOne({
      isGroup: false,
      participants: { $all: [currentUserId, recipientId], $size: 2 },
    })
      .populate('participants', 'name username avatar bio status customStatus lastSeen')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name username avatar' },
      });

    if (!conversation) {
      // Create new direct conversation
      conversation = await Conversation.create({
        participants: [currentUserId, recipientId],
        isGroup: false,
        unreadCounts: {
          [currentUserId.toString()]: 0,
          [recipientId.toString()]: 0,
        },
      });

      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name username avatar bio status customStatus lastSeen');
    }

    res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new group conversation
// @route   POST /api/conversations/group
// @access  Private
const createGroupConversation = async (req, res, next) => {
  try {
    const { groupName, groupDescription, groupImage, memberIds } = req.body;
    const currentUserId = req.user._id;

    if (!groupName || !groupName.trim()) {
      return res.status(400).json({ success: false, message: 'Group name is required.' });
    }

    const members = Array.isArray(memberIds) ? memberIds : [];
    // Ensure current user is in participants
    const uniqueParticipants = Array.from(new Set([currentUserId.toString(), ...members]));

    if (uniqueParticipants.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'A group chat must have at least 2 participants.',
      });
    }

    const defaultGroupAvatar =
      groupImage ||
      `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(groupName)}&backgroundColor=0284c7,2563eb,4f46e5`;

    const unreadCounts = {};
    uniqueParticipants.forEach((p) => {
      unreadCounts[p] = 0;
    });

    const conversation = await Conversation.create({
      participants: uniqueParticipants,
      isGroup: true,
      groupName: groupName.trim(),
      groupDescription: groupDescription || '',
      groupImage: defaultGroupAvatar,
      groupAdmin: currentUserId,
      unreadCounts,
    });

    // Create a system message announcing group creation
    const systemMessage = await Message.create({
      sender: currentUserId,
      conversation: conversation._id,
      content: `${req.user.name} created the group "${groupName}".`,
      messageType: 'system',
    });

    conversation.lastMessage = systemMessage._id;
    await conversation.save();

    const populatedConversation = await Conversation.findById(conversation._id)
      .populate('participants', 'name username avatar bio status customStatus lastSeen')
      .populate('groupAdmin', 'name username avatar')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name username avatar' },
      });

    res.status(201).json({
      success: true,
      message: 'Group conversation created successfully.',
      conversation: populatedConversation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single conversation by ID
// @route   GET /api/conversations/:id
// @access  Private
const getConversationById = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate('participants', 'name username avatar bio status customStatus lastSeen')
      .populate('groupAdmin', 'name username avatar')
      .populate('groupModerators', 'name username avatar')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name username avatar' },
      });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    const isMember = conversation.participants.some(
      (p) => p._id.toString() === req.user._id.toString()
    );

    if (!isMember && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this conversation.',
      });
    }

    res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update group settings
// @route   PUT /api/conversations/:id
// @access  Private
const updateGroup = async (req, res, next) => {
  try {
    const { groupName, groupDescription, groupImage } = req.body;
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    if (!conversation.isGroup) {
      return res.status(400).json({ success: false, message: 'Only group conversations can be modified.' });
    }

    const isAdmin = conversation.groupAdmin.toString() === req.user._id.toString() || req.user.role === 'admin';
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: 'Only the group administrator can edit group details.' });
    }

    if (groupName) conversation.groupName = groupName.trim();
    if (groupDescription !== undefined) conversation.groupDescription = groupDescription.trim();
    if (groupImage) conversation.groupImage = groupImage;

    await conversation.save();

    const updated = await Conversation.findById(conversation._id)
      .populate('participants', 'name username avatar bio status customStatus lastSeen')
      .populate('groupAdmin', 'name username avatar');

    res.status(200).json({
      success: true,
      message: 'Group updated successfully.',
      conversation: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add members to group
// @route   POST /api/conversations/:id/members
// @access  Private
const addGroupMembers = async (req, res, next) => {
  try {
    const { memberIds } = req.body;
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation || !conversation.isGroup) {
      return res.status(404).json({ success: false, message: 'Group conversation not found.' });
    }

    const isAdmin = conversation.groupAdmin.toString() === req.user._id.toString() || req.user.role === 'admin';
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: 'Only the group administrator can add members.' });
    }

    const currentParticipants = conversation.participants.map((p) => p.toString());
    const newMembers = (Array.isArray(memberIds) ? memberIds : [memberIds]).filter(
      (id) => !currentParticipants.includes(id)
    );

    if (newMembers.length === 0) {
      return res.status(400).json({ success: false, message: 'Selected users are already members of this group.' });
    }

    conversation.participants.push(...newMembers);
    await conversation.save();

    const updated = await Conversation.findById(conversation._id)
      .populate('participants', 'name username avatar bio status customStatus lastSeen')
      .populate('groupAdmin', 'name username avatar');

    res.status(200).json({
      success: true,
      message: 'Members added successfully.',
      conversation: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from group or leave group
// @route   DELETE /api/conversations/:id/members/:memberId
// @access  Private
const removeGroupMember = async (req, res, next) => {
  try {
    const { id, memberId } = req.params;
    const conversation = await Conversation.findById(id);

    if (!conversation || !conversation.isGroup) {
      return res.status(404).json({ success: false, message: 'Group conversation not found.' });
    }

    const isSelfLeaving = req.user._id.toString() === memberId;
    const isAdmin = conversation.groupAdmin.toString() === req.user._id.toString() || req.user.role === 'admin';

    if (!isSelfLeaving && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only the group administrator can remove other members.',
      });
    }

    conversation.participants = conversation.participants.filter(
      (p) => p.toString() !== memberId
    );

    // If admin left and there are remaining members, reassign admin
    if (conversation.groupAdmin.toString() === memberId && conversation.participants.length > 0) {
      conversation.groupAdmin = conversation.participants[0];
    }

    await conversation.save();

    const updated = await Conversation.findById(conversation._id)
      .populate('participants', 'name username avatar bio status customStatus lastSeen')
      .populate('groupAdmin', 'name username avatar');

    res.status(200).json({
      success: true,
      message: isSelfLeaving ? 'You left the group.' : 'Member removed from group.',
      conversation: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a conversation
// @route   DELETE /api/conversations/:id
// @access  Private
const deleteConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );

    if (!isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this conversation.' });
    }

    // Delete messages associated with conversation
    await Message.deleteMany({ conversation: conversation._id });
    await Conversation.findByIdAndDelete(conversation._id);

    res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserConversations,
  getOrCreateDirectConversation,
  createGroupConversation,
  getConversationById,
  updateGroup,
  addGroupMembers,
  removeGroupMember,
  deleteConversation,
};
