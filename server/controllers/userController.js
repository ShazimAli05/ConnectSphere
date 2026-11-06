const User = require('../models/User');

// @desc    Search users by name or username
// @route   GET /api/users/search?q=query
// @access  Private
const searchUsers = async (req, res, next) => {
  try {
    const query = req.query.q || '';
    const currentUserId = req.user._id;

    if (!query.trim()) {
      // Return recent active users if query is empty
      const users = await User.find({ _id: { $ne: currentUserId }, isSuspended: false })
        .select('name username avatar bio status customStatus lastSeen role')
        .limit(20)
        .sort({ updatedAt: -1 });
      return res.status(200).json({ success: true, count: users.length, users });
    }

    const regex = new RegExp(query, 'i');
    const users = await User.find({
      _id: { $ne: currentUserId },
      isSuspended: false,
      $or: [{ name: regex }, { username: regex }, { email: regex }],
    })
      .select('name username avatar bio status customStatus lastSeen role')
      .limit(30);

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      'name username avatar bio status customStatus lastSeen role createdAt'
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, username, bio, avatar, status, customStatus } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Check if new username is taken
    if (username && username.toLowerCase() !== user.username) {
      const existing = await User.findOne({ username: username.toLowerCase() });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Username is already taken by another account.',
        });
      }
      user.username = username.toLowerCase();
    }

    if (name) user.name = name.trim();
    if (bio !== undefined) user.bio = bio;
    if (avatar) user.avatar = avatar;
    if (status) user.status = status;
    if (customStatus !== undefined) user.customStatus = customStatus;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change user password
// @route   PUT /api/users/password
// @access  Private
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new passwords.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active users for directory
// @route   GET /api/users
// @access  Private
const getAllUsers = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;
    const users = await User.find({ _id: { $ne: currentUserId }, isSuspended: false })
      .select('name username avatar bio status customStatus lastSeen role')
      .sort({ name: 1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchUsers,
  getUserById,
  updateProfile,
  updatePassword,
  getAllUsers,
};
