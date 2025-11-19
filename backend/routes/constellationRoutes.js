const express = require('express');
const constellationController = require('../controllers/constellationController');
const authProtect = require('../controllers/authController').protect;

const router = express.Router();

router.get('/', constellationController.getAll);
router.get('/seen', authProtect, constellationController.getAllSeenConstellations);
router.get('/:id', constellationController.getOne);


module.exports = router;
