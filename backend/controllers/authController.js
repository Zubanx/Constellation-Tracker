const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

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
      message: 'failed',
      error,
    });
  }
};

exports.login = async (req, res, next) => {
  const { username, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: 'failed',
      message: 'Please provide a valid username and password',
    });
  }
  try {
    const user = await User.findOne({ username }).select('+password');

    if (!user || !user.correctPassword(password, user.password)) {
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
