const express = require('express')
const router = express.Router()

const reportController = require('../controllers/reportController');

router.post('/', reportController.fetchStats);

module.exports = router;