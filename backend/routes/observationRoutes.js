const express = require('express');
const observationController = require('../controllers/observationController');
const protected = require('../controllers/authController').protect;

const router = express.Router();

router.post('/', protected, observationController.addObservation);
router.patch('/:id', protected, observationController.updateObservation);
router.delete('/:id', protected, observationController.deleteObservation);
router.get('/', protected, observationController.getAllObservations);
router.get('/:id', protected, observationController.getObservation);

module.exports = router;
