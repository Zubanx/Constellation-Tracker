const userConstellation = require('../models/userConstellationModel');
const { get } = require('mongoose');

exports.addUserConstellation = async (req, res, next) => {
  // addUserConstellation
  // Needs constellationId, imageUrl
  // Date isn't needed, defaults to date.now
  // Notes isn't needed, defaults to ''
};

exports.editUserConstellation = async (req, res, next) => {
  // editUserConstellation
  // Can edit constellation, image, date, notes
  // Confirms that userId of userConstellation is equal to the user
};

exports.deleteUserConstellation = async (req, res, next) => {
  // deleteUserConstellation
  // Needs id of userConstellation to delete
  // Confirms that userId of userConstellation is equal to the user
};
