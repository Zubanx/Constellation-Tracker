const mongoose = require('mongoose');

const userConstellationSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    constellationId: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    dateFound: {
        type: Date,
        default: Date.now,
        required: true
    },
    notes: {
        type: Number,
        required: false
    }
})

module.exports = mongoose.model('userConstellation', userConstellationSchema);