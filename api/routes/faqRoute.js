const express = require('express');
const router = express.Router();
const faqController = require("../controllers/faqController")

router.get('/', faqController.getAllFaq);
router.post('/create', faqController.getAllFaq);
router.post('/update', faqController.updateFaq);
router.post('/delete', faqController.deleteFaq);

