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
  try {
    // Convert the URL param (string) to a Number
    const id = parseInt(req.params.id, 10);

    // Validate that it's a valid number
    if (isNaN(id)) {
      return res.status(400).json({
        status: 'failed',
        message: 'Invalid constellation ID. Must be a number.',
      });
    }

    const constellation = await Constellation.findOne({ id });

    if (!constellation) {
      return res.status(404).json({
        status: 'failed',
        message: 'Constellation not found',
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
      error: error.message,
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
