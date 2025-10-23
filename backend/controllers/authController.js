const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
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

    token = signToken(newUser._id);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser,
      },
    });
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
        message: 'Incorrect email or password',
      });
    }

    const token = signToken(user._id);

    res.status(200).json({
      status: 'success',
      token,
    });
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
      message: 'Failed on the  catch',
      error,
    });
  }
  req.user = freshUser;
  next();
};
