const express = require('express');
const observationController = require('../controllers/observationController');
const authProtect = require('../controllers/authController').authProtect;

const router = express.Router();

router.post('/', authProtect, observationController.addObservation);
router.patch('/:id', authProtect, observationController.updateObservation);
router.delete('/:id', authProtect, observationController.deleteObservation);
router.get('/', authProtect, observationController.getAllObservations);
router.get('/:id', authProtect, observationController.getObservation);

module.exports = router;
