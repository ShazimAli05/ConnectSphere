const crypto = require('crypto');
const User = require('../models/User');
const { generateToken, setTokenCookie, clearTokenCookie } = require('../utils/tokenUtils');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, username, email, password, avatar, bio } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, username, email, and password.',
      });
    }

    // Check if email already registered
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email address is already in use.',
      });
    }

    // Check if username already taken
    const existingUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username is already taken. Please choose another.',
      });
    }

    // Default avatar if not provided
    const userAvatar =
      avatar ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0284c7,2563eb,4f46e5`;

    const user = await User.create({
      name,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      avatar: userAvatar,
      bio: bio || 'Hey there! I am using ConnectSphere.',
      status: 'available',
    });

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { loginIdentifier, password, rememberMe } = req.body;

    if (!loginIdentifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email or username and password.',
      });
    }

    // Find user by either email or username (case-insensitive)
    const normalizedIdentifier = loginIdentifier.toLowerCase().trim();
    const user = await User.findOne({
      $or: [{ email: normalizedIdentifier }, { username: normalizedIdentifier }],
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email/username and password.',
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended by an administrator. Please reach out to support.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email/username and password.',
      });
    }

    // Update lastSeen & status
    user.lastSeen = new Date();
    user.status = 'available';
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);
    if (rememberMe) {
      setTokenCookie(res, token);
    } else {
      setTokenCookie(res, token);
    }

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user & clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        lastSeen: new Date(),
        status: 'offline',
      });
    }

    clearTokenCookie(res);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently authenticated user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({
      success: true,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password request
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email address.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Return 200 to prevent email enumeration attack
      return res.status(200).json({
        success: true,
        message: 'If an account exists with that email, a password reset link has been dispatched.',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour expiry
    await user.save({ validateBeforeSave: false });

    // In a live production environment with SMTP, an email is dispatched.
    // For local portfolio testing, we also return the resetToken directly in response for instant developer testing.
    res.status(200).json({
      success: true,
      message: 'Password reset token generated successfully.',
      resetToken, // Provided for instant demo/testing convenience
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the reset token and your new password.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token is invalid or has expired.',
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    const authToken = generateToken(user._id);
    setTokenCookie(res, authToken);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You are now logged in.',
      token: authToken,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
};
