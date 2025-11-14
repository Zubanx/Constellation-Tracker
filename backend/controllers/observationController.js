const Observation = require('../models/Observation');
const Constellation = require('../models/Constellation');
const cloudinary = require('cloudinary').v2;

exports.addObservation = async (req, res, next) => {
  try {
    const {
      constellationId,
      photoUrl,
      cloudinaryPublicId,
      location,
      notes,
      observationDate,
    } = req.body;

    // Validate constellation exists
    const constellation = await Constellation.findById(constellationId);
    if (!constellation) {
      return res.status(404).json({ error: 'Constellation not found' });
    }

    // Check if user already observed this constellation
    const existing = await Observation.findOne({
      userId: req.user.id,
      constellationId,
    });

    // Create observation
    const observation = new Observation({
      userId: req.user.id,
      constellationId,
      photoUrl,
      cloudinaryPublicId,
      location,
      notes,
      observationDate: observationDate || new Date(),
    });

    await observation.save();

    // Populate constellation details
    await observation.populate('constellationId', 'name abbreviation');

    res.status(201).json({
      observation,
      firstTime: !existing, // True if this is their first time seeing this constellation
    });
  } catch (error) {
    console.error('Error creating observation:', error);
    res.status(500).json({ error: 'Failed to create observation' });
  }
};

exports.getAllObservations = async (req, res, next) => {
  try {
    const {
      constellationId,
      sortBy = 'observationDate',
      order = 'desc',
    } = req.query;

    const filter = { userId: req.user.id };
    if (constellationId) {
      filter.constellationId = constellationId;
    }

    const observations = await Observation.find(filter)
      .populate('constellationId', 'name abbreviation hemisphere')
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 });

    res.json({ observations });
  } catch (error) {
    console.error('Error fetching observations:', error);
    res.status(500).json({ error: 'Failed to fetch observations' });
  }
};

exports.getObservation = async (req, res, next) => {
  try {
    const observation = await Observation.findOne({
      _id: req.params.id,
      userId: req.user.id,
    }).populate('constellationId');

    if (!observation) {
      return res.status(404).json({ error: 'Observation not found' });
    }

    res.json({ observation });
  } catch (error) {
    console.error('Error fetching observation:', error);
    res.status(500).json({ error: 'Failed to fetch observation' });
  }
};

exports.updateObservation = async (req, res, next) => {
  try {
    const { notes, location } = req.body;

    const observation = await Observation.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { notes, location },
      { new: true, runValidators: true }
    ).populate('constellationId');

    if (!observation) {
      return res.status(404).json({ error: 'Observation not found' });
    }

    res.json({ observation });
  } catch (error) {
    console.error('Error updating observation:', error);
    res.status(500).json({ error: 'Failed to update observation' });
  }
};

exports.deleteObservation = async (req, res, next) => {
  try {
    const observation = await Observation.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!observation) {
      return res.status(404).json({ error: 'Observation not found' });
    }

    // Delete from Cloudinary
    if (observation.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(observation.cloudinaryPublicId);
    }

    await observation.deleteOne();

    res.json({ message: 'Observation deleted successfully' });
  } catch (error) {
    console.error('Error deleting observation:', error);
    res.status(500).json({ error: 'Failed to delete observation' });
  }
};
