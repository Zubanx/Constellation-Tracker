const router = require('express').Router();
const progressController = require('../controllers/progressController');
const protected = require('../controllers/authController').protect;

router.get('/', protected, progressController.getUserProgress);

module.exports = router;