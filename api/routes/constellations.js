const express = require('express')
const {route} = require("express/lib/application");
const router = express.Router()
const Constellation = require('../models/constellations')
const {get} = require("mongoose");

// Getting ALL
router.get('/', async (req, res) => {
    try {
        const constellations = await Constellation.find()
        res.json(constellations)
    } catch (err) {
        res.status(500).json({ message: err.message})
    }
})

// Getting One
router.get('/:id', getConstellation, (req, res) => {
    res.json(res.constellation)
})

async function getConstellation(req, res, next) {
    let constellation
    try {
        constellation = await Constellation.findById(req.params.id)
        if (constellation == null) {
            return res.status(404).json({ message: 'Cannot find Constellation'})
        }
    } catch (err) {
        return res.status(500).json({message: err.message})
    }

    res.constellation = constellation
    next()
}

module.exports = router