const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Report = require('../models/Report');

// @desc    Get system overview statistics & analytics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const suspendedUsers = await User.countDocuments({ isSuspended: true });

    // Active in last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeUsers = await User.countDocuments({
      $or: [{ lastSeen: { $gte: oneDayAgo } }, { status: { $ne: 'offline' } }],
    });

    const totalConversations = await Conversation.countDocuments();
    const totalGroups = await Conversation.countDocuments({ isGroup: true });
    const totalDirectChats = await Conversation.countDocuments({ isGroup: false });
    const totalMessages = await Message.countDocuments();
    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'pending' });

    // Recent 5 registered users
    const recentUsers = await User.find()
      .select('name username email avatar role isSuspended createdAt lastSeen')
      .sort({ createdAt: -1 })
      .limit(5);

    // Breakdown of message types
    const messageTypes = await Message.aggregate([
      { $group: { _id: '$messageType', count: { $sum: 1 } } },
    ]);

    // Daily activity trend (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activityTrend = await Message.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          messages: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        suspendedUsers,
        totalConversations,
        totalGroups,
        totalDirectChats,
        totalMessages,
        totalReports,
        pendingReports,
        recentUsers,
        messageTypes,
        activityTrend,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user list with filters & pagination
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsersList = async (req, res, next) => {
  try {
    const { search, role, status, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ name: regex }, { username: regex }, { email: regex }];
    }

    if (role && role !== 'all') {
      filter.role = role;
    }

    if (status === 'suspended') {
      filter.isSuspended = true;
    } else if (status === 'active') {
      filter.isSuspended = false;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Suspend or Reactivate user account
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isSuspended } = req.body;

    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot suspend your own administrative account.',
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.isSuspended = Boolean(isSuspended);
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account has been ${user.isSuspended ? 'suspended' : 'reactivated'}.`,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role (promote/demote admin)
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified.' });
    }

    if (id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot change your own role.' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}.`,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get moderation reports
// @route   GET /api/admin/reports
// @access  Private/Admin
const getReportsList = async (req, res, next) => {
  try {
    const reports = await Report.find()
      .populate('reporter', 'name username avatar')
      .populate('reportedUser', 'name username avatar isSuspended')
      .populate('resolvedBy', 'name username')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update moderation report status
// @route   PUT /api/admin/reports/:id
// @access  Private/Admin
const updateReportStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes } = req.body;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    if (status) report.status = status;
    if (resolutionNotes) report.resolutionNotes = resolutionNotes;
    report.resolvedBy = req.user._id;

    await report.save();

    res.status(200).json({
      success: true,
      message: 'Report updated successfully.',
      report,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getUsersList,
  toggleUserStatus,
  updateUserRole,
  getReportsList,
  updateReportStatus,
};
