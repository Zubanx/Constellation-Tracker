const Constellation = require('../models/constellationModel');
const { get } = require('mongoose');

exports.getAll = async (req, res, next) => {
  try {
    const constellations = await Constellation.find();
    res.status(200).json({
      status: 'success',
      data: {
        constellations,
      },
    });
  } catch (error) {
    res.status(401).json({
      status: 'failed',
      error,
    });
  }
};

exports.getOne = async (req, res, next) => {
  let constellation;
  console.log('ID: ', req.params.id)
  try {
    constellation = await Constellation.findById(req.params.id);
    if (!constellation) {
      return res.status(404).json({
        status: 'failed',
        message: 'Cannot find Constellation',
      });
    }
    res.status(200).json({
      status: 'success',
      data: {
        constellation,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'failed',
      error,
    });
  }
};
