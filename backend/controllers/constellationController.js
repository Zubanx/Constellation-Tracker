const Constellation = require('../models/Constellation');
const { get } = require('mongoose');
const Observation = require('../models/Observation');

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
  console.log('ID: ', req.params.id);
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

exports.getAllSeenConstellations = async (req, res, next) => {
  try {
    const { hemisphere, difficulty } = req.query;

    // Build filter
    const filter = {};
    if (hemisphere) filter.hemisphere = hemisphere;
    if (difficulty) filter.difficulty = difficulty;

    const constellations = await Constellation.find(filter).sort({ name: 1 });

    // Get user's observed constellation IDs
    const observations = await Observation.find(
      { userId: req.user.id },
      { constellationId: 1 }
    );
    const observedIds = new Set(
      observations.map((obs) => obs.constellationId.toString())
    );

    // Add 'seen' status to each constellation
    const constellationsWithStatus = constellations.map((constellation) => ({
      ...constellation.toObject(),
      seen: observedIds.has(constellation._id.toString()),
    }));

    res.json({ constellations: constellationsWithStatus });
  } catch (error) {
    console.error('Error fetching constellations:', error);
    res.status(500).json({ error: 'Failed to fetch constellations' });
  }
};
