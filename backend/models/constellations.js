const mongoose = require('mongoose')

const constellationSchema = new mongoose.Schema({
    constellation: {
        type: String,
        required: true
    },
    brightestStar: {
        type: String,
        required: true
    },
    magnitude: {
        type: Number,
        required: true
    },
    hemisphere: {
        type: String,
        required: true
    },
    meaning: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Constellation', constellationSchema)