const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage(); // Use memory storage for simplicity, adjust as needed

const upload = multer({ storage: storage });

const applicationController = require('../controllers/applicationController');

router.post('/upload', upload.array('files'), applicationController.uploadDocuments);

module.exports = router;