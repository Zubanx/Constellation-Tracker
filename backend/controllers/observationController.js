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


    // Validate constellation ID
    const constId = parseInt(constellationId);
    if (isNaN(constId) || constId < 1 || constId > 88) {
      return res.status(400).json({
        status: 'failed',
        message: 'Constellation ID must be a number between 1 and 88',
      });
    }

    // Create observation
    const observation = new Observation({
      userId: req.user.id,
      constellationId: constId,  // Store as number
      photoUrl,
      cloudinaryPublicId,
      location,
      notes,
      observationDate: observationDate || new Date(),
    });

    await observation.save();

    console.log('✅ Observation created:', observation);

    // ✅ Don't populate - constellationId is just a number
    // Return the observation as-is
    res.status(201).json({
      observation,
      firstTime: false, // You can add logic to check if this is user's first observation
    });
  } catch (error) {
    console.error('Error creating observation:', error);
    res.status(500).json({ 
      error: 'Failed to create observation',
      message: error.message 
    });
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
    
    // If filtering by constellation, parse to number
    if (constellationId) {
      filter.constellationId = parseInt(constellationId);
    }

    // ✅ Don't populate - constellationId is just a number
    const observations = await Observation.find(filter)
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 });

    console.log(`📊 Found ${observations.length} observations for user ${req.user.id}`);

    res.json({ observations });
  } catch (error) {
    console.error('Error fetching observations:', error);
    res.status(500).json({ error: 'Failed to fetch observations' });
  }
};

exports.getObservation = async (req, res, next) => {
  try {
    // ✅ Don't populate - constellationId is just a number
    const observation = await Observation.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

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

    // ✅ Don't populate - constellationId is just a number
    const observation = await Observation.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { notes, location },
      { new: true, runValidators: true }
    );

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
      try {
        await cloudinary.uploader.destroy(observation.cloudinaryPublicId);
        console.log(`🗑️ Deleted image from Cloudinary: ${observation.cloudinaryPublicId}`);
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError);
        // Continue with observation deletion even if Cloudinary fails
      }
    }

    await observation.deleteOne();

    console.log(`✅ Observation deleted: ${req.params.id}`);

    res.json({ message: 'Observation deleted successfully' });
  } catch (error) {
    console.error('Error deleting observation:', error);
    res.status(500).json({ error: 'Failed to delete observation' });
  }
};

// Get observations by constellation numeric ID
exports.getObservationsByConstellation = async (req, res, next) => {
  try {
    const constellationId = parseInt(req.params.constellationId);
    
    if (isNaN(constellationId) || constellationId < 1 || constellationId > 88) {
      return res.status(400).json({
        error: 'Invalid constellation ID',
        message: 'Constellation ID must be between 1 and 88',
      });
    }

    const observations = await Observation.find({
      userId: req.user.id,
      constellationId: constellationId,
    }).sort({ observationDate: -1 });

    res.json({ observations });
  } catch (error) {
    console.error('Error fetching observations by constellation:', error);
    res.status(500).json({ error: 'Failed to fetch observations' });
  }
};

module.exports = exports;