const express = require('express');
const userConstellationController = require('../controllers/userConstellationController');

const router = express.Router();

router.post('/add/:id', userConstellationController.addUserConstellation);
router.patch('/edit/:id', userConstellationController.editUserConstellation);
router.delete('/delete/:id', userConstellationController.deleteUserConstellation);

module.exports = router;
