const express = require('express');
const { upload_in_drive_controller, download_from_drive_controller } = require('../controllers/controller');
const router = express.Router();

// Route to upload files in google drive
router.post('/upload', upload_in_drive_controller)

//Route to download files from google drive
router.post('/download', download_from_drive_controller)
// Exporting the router to be used in other parts of the application
module.exports = router;
