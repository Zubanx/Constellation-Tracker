const mongoose = require('mongoose');

const constellationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  abbreviation: String,
  hemisphere: {
    type: String,
    enum: ['Northern', 'Southern', 'Both']
  },
  visibilityMonths: [String], // ['January', 'February', ...]
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard']
  },
  description: String,
  referenceImageUrl: String,
  brightestStar: String,
  mythology: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Constellation', constellationSchema);