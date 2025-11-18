const mongoose = require('mongoose');

const constellationSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    latinName: {
      type: String,
      trim: true,
    },
    abbreviation: {
      type: String,
      uppercase: true,
      maxlength: 3,
      trim: true,
    },
    description: String,
    mythology: String,
    rightAscension: {
      type: Number,
      min: 0,
      max: 24,
    }, // in hours (approximate center)
    declination: {
      type: Number,
      min: -90,
      max: 90,
    }, // in degrees (approximate center)
    area: {
      type: Number,
      min: 0,
    }, // square degrees
    brightestStar: String,
    visibility: {
      type: String,
      enum: ['Northern hemisphere', 'Southern hemisphere', 'Both hemispheres'],
      default: 'Both hemispheres',
    },
    season: {
      type: String,
      enum: ['Spring', 'Summer', 'Fall', 'Winter', 'Year-round'],
      default: 'Year-round',
    },
    imageUrl: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Constellation', constellationSchema);
