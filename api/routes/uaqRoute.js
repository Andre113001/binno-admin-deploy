const express = require('express');
const router = express.Router();
const uaqController = require("../controllers/uaqController")

router.get('/', uaqController.getAllUaq);
router.post('/create', uaqController.getAllUaq);
router.post('/update', uaqController.updateUaq);
router.post('/delete', uaqController.deleteUaq);
