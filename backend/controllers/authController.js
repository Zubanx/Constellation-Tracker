const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, passwordConfirm } = req.body;

    if (!firstName || !lastName || !email || !password || !passwordConfirm) {
      return res.status(400).json({
        status: 'failed',
        message: 'Please provide first name, last name, email, password, and password confirmation',
      });
    }

    // Generate confirmation token
    const confirmationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(confirmationToken)
      .digest('hex');

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
      passwordConfirm,
      emailConfirmed: false,
      emailConfirmToken: hashedToken,
      emailConfirmExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    // Send confirmation email
    try {
      await sendEmail.confirmationEmail(email, confirmationToken);
    } catch (emailErr) {
      console.error('Failed to send confirmation email:', emailErr);
      // Optionally delete user if email fails (security)
      await User.findByIdAndDelete(newUser._id);
      return res.status(500).json({
        status: 'failed',
        message:
          'There was an error sending the confirmation email. Please try again later.',
      });
    }

    res.status(201).json({
      status: 'success',
      message:
        'Registration successful! Please check your email to confirm your account.',
    });
  } catch (error) {
    res.status(400).json({
      status: 'failed',
      message: error.message || 'Something went wrong during signup',
    });
  }
};

exports.confirmEmail = async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      emailConfirmToken: hashedToken,
      emailConfirmExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        status: 'failed',
        message: 'Token is invalid or has expired. Please request a new one.',
      });
    }

    user.emailConfirmed = true;
    user.emailConfirmToken = undefined;
    user.emailConfirmExpires = undefined;
    await user.save({ validateBeforeSave: false });

    createSendToken(user, 200, res);
  } catch (error) {
    res.status(500).json({
      status: 'failed',
      message: 'Server error during email confirmation',
    });
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return res.status(400).json({
      status: 'failed',
      message: 'Please provide email and password',
    });
  }

  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
    '+password'
  );

  if (!user || !(await user.correctPassword(password, user.password))) {
    return res.status(401).json({
      status: 'failed',
      message: 'Incorrect email or password',
    });
  }

  // 3) Check if email is confirmed
  if (!user.emailConfirmed) {
    return res.status(401).json({
      status: 'failed',
      message: 'Please confirm your email before logging in',
    });
  }

  // 4) All good → send token
  createSendToken(user, 200, res);
};

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.status(401).json({
      status: 'failed',
      message: 'You are not logged in. Please log in to get access.',
    });
  }

  try {
    // Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'failed',
        message: 'The user belonging to this token no longer exists.',
      });
    }

    // Check if user changed password after token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        status: 'failed',
        message: 'User recently changed password! Please log in again.',
      });
    }

    // Grant access
    req.user = currentUser;
    next();
  } catch (err) {
    return res.status(401).json({
      status: 'failed',
      message: 'Invalid or expired token',
    });
  }
};

exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      status: 'failed',
      message: 'Please provide your email address',
    });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({
        status: 'failed',
        message: 'There is no user with that email address',
      });
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    try {
      await sendEmail.passwordResetEmail(user.email, resetToken);
      res.status(200).json({
        status: 'success',
        message: 'Password reset link sent to your email',
      });
    } catch (emailErr) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        status: 'failed',
        message: 'There was an error sending the email. Try again later!',
      });
    }
  } catch (err) {
    res.status(500).json({
      status: 'failed',
      message: 'Server error',
    });
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        status: 'failed',
        message: 'Token is invalid or has expired',
      });
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    createSendToken(user, 200, res);
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err.message || 'Password reset failed',
    });
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    if (
      !(await user.correctPassword(req.body.currentPassword, user.password))
    ) {
      return res.status(401).json({
        status: 'failed',
        message: 'Your current password is incorrect',
      });
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    createSendToken(user, 200, res);
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err.message || 'Could not update password',
    });
  }
};
