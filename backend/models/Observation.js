const mongoose = require('mongoose');

const observationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    constellationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Constellation',
      required: true,
    },
    photoUrl: {
      type: String,
      required: true,
    },
    cloudinaryPublicId: String,
    location: {
      type: String,
      required: true,
    },
    notes: String,
    observationDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
observationSchema.index({ userId: 1, constellationId: 1 });
observationSchema.index({ userId: 1, observationDate: -1 });

module.exports = mongoose.model('Observation', observationSchema);
