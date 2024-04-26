const express = require('express');
const router = express.Router();
const uaqController = require('../controllers/uaqController');

router.get('/fetch', uaqController.readUaq);
router.post('/delete', uaqController.deleteUaq);

module.exports = router;