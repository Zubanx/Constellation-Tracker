const User = require('../models/userModel');
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

  cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
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
    const newUser = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });

    createSendToken(newUser, 201, res);
  } catch (error) {
    res.status(401).json({
      status: 'failed',
      error,
    });
  }
};

exports.login = async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      status: 'failed',
      message: 'Please provide a valid username and password',
    });
  }
  try {
    const user = await User.findOne({ username }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: 'failed',
        message: 'Incorrect username or password',
      });
    }

    createSendToken(user, 200, res);
  } catch (error) {
    res.status(401).json({
      message: 'failed',
      error,
    });
  }
};

exports.protect = async (req, res, next) => {
  let token;
  let freshUser;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({
      status: 'failed',
      message: 'You are not logged in',
    });
  }
  try {
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    //check if user was deleted after the JWT token was created
    freshUser = await User.findById(decoded.id);

    if (!freshUser) {
      return res.status(401).json({
        status: 'failed',
        message: 'The user belonging to this token no longer exist',
      });
    }

    //check if user changed passwords after the JWT token was created

    if (freshUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        status: 'failed',
        message: 'User recently changed password! Please log in again',
      });
    }
  } catch (error) {
    return res.status(401).json({
      status: 'failed',
      error,
    });
  }
  req.user = freshUser;
  next();
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({
        status: 'failed',
        message: 'There is no user with that email address',
      });
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to :${resetURL}.\n If you didn't forget your password, please ignore this email.`;
    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10 min)',
        message,
      });
      res.status(200).json({
        status: 'success',
        message: 'Token sent to email',
      });
    } catch (error) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({
        status: 'failed',
        error,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 'failed',
      error,
    });
  }
};

exports.resetPasssword = async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  try {
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(404).json({
        status: 'failed',
        message: 'No user found with that token',
      });
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createSendToken(user, 200, res);
  } catch (error) {
    return res.status(500).json({
      status: 'failed',
      error,
    });
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    //get user from database
    const user = await User.findById(req.user.id).select('+password');
    //return if no user found or if password is incorrect, second function checks if passwords match
    if (
      !(await user.correctPassword(req.body.currentPassword, user.password))
    ) {
      return res.status(401).json({
        status: 'failed',
        message: 'Your current password is wrong',
      });
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;

    await user.save();

    createSendToken(user, 200, res);
  } catch (error) {
    return res.status(500).json({
      status: 'failed',
      error,
    });
  }
};
