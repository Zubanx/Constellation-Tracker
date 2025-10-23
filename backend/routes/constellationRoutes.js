const express = require('express');
const constellationController = require('../controllers/constellationController');

const router = express.Router();

router.get('/', constellationController.getAll);
router.get('/:id', constellationController.getOne);

module.exports = router;
