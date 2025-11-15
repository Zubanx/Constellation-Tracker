const express = require('express');
const constellationController = require('../controllers/constellationController');
const protected = require('../controllers/authController').protect;

const router = express.Router();

router.get('/', constellationController.getAll);
router.get('/seen', protected, constellationController.getAllSeenConstellations);
router.get('/:id', constellationController.getOne);


module.exports = router;
