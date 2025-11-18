const router = require('express').Router();
const progressController = require('../controllers/progressController');
const authProtect = require('../controllers/authController').authProtect;

router.get('/', authProtect, progressController.getUserProgress);

module.exports = router;
