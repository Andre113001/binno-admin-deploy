const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');

router.get('/fetch/name', historyController.readChangeName);
router.get('/fetch/class', historyController.readChangeClass);

module.exports = router;